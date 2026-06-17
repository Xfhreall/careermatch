import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import { jsonError } from "@/lib/server/http"
import {
  getSuperadminSnapshot,
  updateHrdApproval,
} from "@/shared/repository/careermatch/action"

export const Route = createFileRoute("/api/superadmin/hrd-approval")({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        const auth = await requireRole(request, ["superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          const payload = (await request.json()) as {
            id?: string
            status?: string
          }

          if (!payload.id) {
            return Response.json(
              { error: "ID approval wajib dikirim." },
              { status: 400 }
            )
          }

          if (payload.status !== "approved" && payload.status !== "rejected") {
            return Response.json(
              { error: "Status approval tidak valid." },
              { status: 400 }
            )
          }

          await updateHrdApproval({
            id: payload.id,
            reviewerId: auth.session.user.id,
            status: payload.status,
          })

          return Response.json(await getSuperadminSnapshot())
        } catch (error) {
          return jsonError(error, "Gagal memperbarui approval HRD.")
        }
      },
    },
  },
})
