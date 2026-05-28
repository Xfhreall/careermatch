import { createFileRoute } from "@tanstack/react-router"

import type { NormalizedAnalysisResponse } from "@/features/cv-analysis/types"
import {
  assessChatbotPrompt,
  extractChatbotAnswer,
  sanitizeChatbotHistory,
} from "@/features/jobseeker-chatbot/chatbot-guard"
import type { JobseekerChatbotMode } from "@/features/jobseeker-chatbot/types"
import { requireRole } from "@/lib/server/auth-session"
import {
  appendChatbotMessage,
  createChatbotConversation,
  listChatbotConversations,
  loadAnalysisResult,
  loadChatbotConversation,
} from "@/lib/server/careermatch-repository"
import { jsonError } from "@/lib/server/http"

export const Route = createFileRoute("/api/jobseeker/chatbot")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireRole(request, ["jobseeker"])

        if (auth.response) {
          return auth.response
        }

        try {
          const url = new URL(request.url)
          const conversationId = url.searchParams.get("conversationId")
          const [conversations, activeConversation] = await Promise.all([
            listChatbotConversations(auth.session.user.id),
            conversationId
              ? loadChatbotConversation(auth.session.user.id, conversationId)
              : Promise.resolve(null),
          ])

          if (conversationId && !activeConversation) {
            return Response.json(
              { error: "Session chatbot tidak ditemukan." },
              { status: 404 }
            )
          }

          return Response.json({
            activeConversation,
            conversations,
          })
        } catch (error) {
          return jsonError(error, "Gagal membaca session chatbot.")
        }
      },
      POST: async ({ request }) => {
        const auth = await requireRole(request, ["jobseeker"])

        if (auth.response) {
          return auth.response
        }

        const chatbotUrl = process.env.CHATBOT_URL

        if (!chatbotUrl) {
          return Response.json(
            { error: "CHATBOT_URL belum dikonfigurasi di server." },
            { status: 500 }
          )
        }

        const payload = await readJsonPayload(request)
        const message =
          typeof payload.message === "string" ? payload.message.trim() : ""
        const mode: JobseekerChatbotMode =
          payload.mode === "analysis" ? "analysis" : "direct"
        const analysisId =
          typeof payload.analysisId === "string"
            ? payload.analysisId.trim()
            : undefined
        const conversationId =
          typeof payload.conversationId === "string"
            ? payload.conversationId.trim()
            : undefined
        const existingConversation = conversationId
          ? await loadChatbotConversation(auth.session.user.id, conversationId)
          : null

        if (conversationId && !existingConversation) {
          return Response.json(
            { error: "Session chatbot tidak ditemukan." },
            { status: 404 }
          )
        }

        const conversationMode = existingConversation?.mode ?? mode
        const conversationAnalysisId =
          existingConversation?.analysisId ?? analysisId

        let analysisContext: NormalizedAnalysisResponse | null = null

        if (conversationMode === "analysis") {
          if (!conversationAnalysisId) {
            return Response.json(
              { error: "Pilih hasil analisis CV sebagai konteks chat." },
              { status: 400 }
            )
          }

          analysisContext = await loadAnalysisResult(
            auth.session.user.id,
            conversationAnalysisId
          )

          if (!analysisContext) {
            return Response.json(
              { error: "Hasil analisis tidak ditemukan." },
              { status: 404 }
            )
          }
        }

        const assessment = assessChatbotPrompt({
          hasAnalysisContext: Boolean(analysisContext),
          message,
        })

        if (!assessment.allowed) {
          return Response.json(
            {
              error: assessment.reason,
              guard: {
                score: assessment.score,
                threshold: assessment.threshold,
              },
            },
            { status: 422 }
          )
        }

        const history = sanitizeChatbotHistory(
          (existingConversation?.messages ?? []).map(({ content, role }) => ({
            content,
            role,
          }))
        )
        const conversation =
          existingConversation ??
          (await createChatbotConversation({
            analysisId:
              conversationMode === "analysis" ? analysisId : undefined,
            message,
            mode: conversationMode,
            userId: auth.session.user.id,
          }))
        const userMessage = await appendChatbotMessage({
          content: message,
          conversationId: conversation.id,
          role: "user",
          userId: auth.session.user.id,
        })

        let webhookResponse: Response

        try {
          webhookResponse = await fetch(chatbotUrl, {
            body: JSON.stringify({
              analysisContext: analysisContext
                ? toCompactAnalysisContext(analysisContext)
                : null,
              app: "CareerMatch",
              guard: {
                allowedTopics: [
                  "CV",
                  "job match",
                  "skill gap",
                  "career coaching",
                  "interview preparation",
                  "CareerMatch platform guidance",
                ],
                instruction:
                  "Jawab hanya dalam konteks CareerMatch untuk jobseeker. Jika pertanyaan keluar dari topik CV, job match, skill gap, karier, atau interview, tolak singkat dan arahkan kembali ke topik CareerMatch. Jangan mengarang data lowongan atau hasil analisis yang tidak tersedia pada konteks.",
                relevanceScore: assessment.score,
                threshold: assessment.threshold,
              },
              history,
              message,
              mode: conversationMode,
              question: message,
              user: {
                id: auth.session.user.id,
                role: "jobseeker",
              },
            }),
            headers: {
              "content-type": "application/json",
            },
            method: "POST",
          })
        } catch (error) {
          return jsonError(error, "Gagal menghubungi chatbot.", 502)
        }

        const responsePayload = await readWebhookResponse(webhookResponse)

        if (!webhookResponse.ok) {
          return Response.json(
            {
              error:
                typeof responsePayload === "string"
                  ? responsePayload
                  : `Webhook chatbot merespons status ${webhookResponse.status}.`,
              rawResponse: responsePayload,
            },
            { status: webhookResponse.status }
          )
        }

        const answer = extractChatbotAnswer(responsePayload)

        if (!answer) {
          return Response.json(
            {
              error: "Response chatbot tidak berisi jawaban yang bisa dibaca.",
              rawResponse: responsePayload,
            },
            { status: 502 }
          )
        }

        const assistantMessage = await appendChatbotMessage({
          content: answer,
          conversationId: conversation.id,
          metadata: {
            guardScore: assessment.score,
            guardThreshold: assessment.threshold,
          },
          role: "assistant",
          userId: auth.session.user.id,
        })
        const conversations = await listChatbotConversations(
          auth.session.user.id
        )

        return Response.json({
          answer,
          assistantMessage,
          conversationId: conversation.id,
          conversationTitle: conversation.title,
          conversations,
          guard: {
            score: assessment.score,
            threshold: assessment.threshold,
          },
          userMessage,
        })
      },
    },
  },
})

async function readJsonPayload(request: Request) {
  try {
    const payload = await request.json()

    return typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

async function readWebhookResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  return response.text()
}

function toCompactAnalysisContext(result: NormalizedAnalysisResponse) {
  return {
    analysisId: result.analysisId,
    candidateProfile: {
      skills: result.candidateProfile?.skills?.slice(0, 24) ?? [],
      summary: result.candidateProfile?.summary,
      totalExperienceYears: result.candidateProfile?.totalExperienceYears,
    },
    careerCoaching: result.careerCoaching.slice(0, 2800),
    jobMatches: result.jobMatches.slice(0, 6).map((job) => ({
      candidateYears: job.candidateYears,
      company: job.company,
      compatibilityScore: job.compatibilityScore,
      experienceMatchScore: job.experienceMatchScore,
      jobTitle: job.jobTitle,
      matchedSkills: job.matchedSkills.slice(0, 12),
      reasoning: job.reasoning?.slice(0, 900),
      requiredYears: job.requiredYears,
      skillGap: job.skillGap.slice(0, 12),
      skillMatchScore: job.skillMatchScore,
    })),
  }
}
