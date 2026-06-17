import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import { jsonError } from "@/lib/server/http"
import {
  createHrdApprovalRequest,
  getHrdApprovalRequestForUser,
} from "@/shared/repository/careermatch/action"

export const Route = createFileRoute("/api/jobseeker/request-hrd")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireRole(request, ["jobseeker"])

        if (auth.response) {
          return auth.response
        }

        try {
          const status = await getHrdApprovalRequestForUser(
            auth.session.user.email
          )
          return Response.json(status)
        } catch (error) {
          return jsonError(error, "Gagal mendapatkan status pendaftaran HRD.")
        }
      },
      POST: async ({ request }) => {
        const auth = await requireRole(request, ["jobseeker"])

        if (auth.response) {
          return auth.response
        }

        try {
          const formData = await request.formData()
          const companyName = formData.get("companyName") as string | null
          const description = formData.get("description") as string | null
          const file = formData.get("file") as File | null

          if (!companyName?.trim()) {
            return Response.json(
              { error: "Nama perusahaan wajib diisi." },
              { status: 400 }
            )
          }

          const result = await createHrdApprovalRequest({
            userId: auth.session.user.id,
            companyName: companyName.trim(),
            email: auth.session.user.email,
            description: description?.trim() || null,
            supportingFile: file || null,
          })

          return Response.json(result)
        } catch (error) {
          return jsonError(error, "Gagal mengajukan pendaftaran HRD.")
        }
      },
    },
  },
})
