import { createFileRoute } from "@tanstack/react-router"

import { normalizeAnalysisResponse } from "@/features/cv-analysis/normalize"
import { validateCvFile } from "@/features/cv-analysis/validators"
import { requireRole } from "@/lib/server/auth-session"
import {
  createAnalysisJob,
  markAnalysisJobStatus,
  saveAnalysisResult,
  uploadCvToStorage,
} from "@/lib/server/careermatch-repository"
import { jsonError } from "@/lib/server/http"

export const Route = createFileRoute("/api/cv/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireRole(request, ["jobseeker", "superadmin"])

        if (auth.response) {
          return auth.response
        }

        const webhookUrl = process.env.N8N_WEBHOOK_URL

        if (!webhookUrl) {
          return Response.json(
            { error: "N8N_WEBHOOK_URL belum dikonfigurasi di server." },
            { status: 500 }
          )
        }

        const incomingForm = await request.formData()
        const cvValue = incomingForm.get("cv")
        const filename = incomingForm.get("filename")

        if (!(cvValue instanceof File)) {
          return Response.json(
            { error: "Silakan upload file CV terlebih dahulu." },
            { status: 400 }
          )
        }

        const validation = validateCvFile(cvValue)

        if (!validation.ok) {
          return Response.json({ error: validation.message }, { status: 400 })
        }

        let analysisJobId: string | undefined

        try {
          const storagePath = await uploadCvToStorage(
            auth.session.user.id,
            cvValue
          )
          analysisJobId = await createAnalysisJob({
            file: cvValue,
            storagePath,
            userId: auth.session.user.id,
          })
        } catch (error) {
          return jsonError(error, "Gagal menyimpan CV ke Supabase.")
        }

        const outgoingForm = new FormData()
        outgoingForm.append("cv", cvValue, cvValue.name)
        outgoingForm.append(
          "filename",
          typeof filename === "string" ? filename : cvValue.name
        )

        let webhookResponse: Response

        try {
          webhookResponse = await fetch(webhookUrl, {
            method: "POST",
            body: outgoingForm,
          })
        } catch (error) {
          await markAnalysisFailed(analysisJobId, error)

          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : "Gagal menghubungi webhook n8n.",
            },
            { status: 502 }
          )
        }

        const payload = await readWebhookPayload(webhookResponse)

        if (!webhookResponse.ok) {
          await markAnalysisFailed(
            analysisJobId,
            `Webhook n8n merespons status ${webhookResponse.status}.`
          )

          return Response.json(
            {
              error:
                typeof payload === "string"
                  ? payload
                  : `Webhook n8n merespons status ${webhookResponse.status}.`,
              rawResponse: payload,
            },
            { status: webhookResponse.status }
          )
        }

        const result = normalizeAnalysisResponse(payload)

        try {
          await saveAnalysisResult({
            jobId: analysisJobId,
            rawResponse: payload,
            result,
            userId: auth.session.user.id,
          })
          await markAnalysisJobStatus(analysisJobId, "completed")
        } catch (error) {
          await markAnalysisFailed(analysisJobId, error)
          return jsonError(error, "Gagal menyimpan hasil analisis.")
        }

        return Response.json(result)
      },
    },
  },
})

async function readWebhookPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  return response.text()
}

async function markAnalysisFailed(jobId: string, error: unknown) {
  await markAnalysisJobStatus(
    jobId,
    "failed",
    error instanceof Error ? error.message : String(error)
  )
}
