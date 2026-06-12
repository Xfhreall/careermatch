import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import {
  createHrdApprovalRequest,
  getHrdApprovalRequestForUser,
} from "@/lib/server/careermatch-repository"
import { jsonError } from "@/lib/server/http"

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
          const payload = (await request.json()) as {
            companyName?: string
          }

          if (!payload.companyName?.trim()) {
            return Response.json(
              { error: "Nama perusahaan wajib diisi." },
              { status: 400 }
            )
          }

          const result = await createHrdApprovalRequest({
            userId: auth.session.user.id,
            companyName: payload.companyName.trim(),
            email: auth.session.user.email,
          })

          return Response.json(result)
        } catch (error) {
          return jsonError(error, "Gagal mengajukan pendaftaran HRD.")
        }
      },
    },
  },
})
