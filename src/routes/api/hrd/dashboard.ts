import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import { jsonError } from "@/lib/server/http"
import { getHrdDashboard } from "@/shared/repository/careermatch/action"

export const Route = createFileRoute("/api/hrd/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireRole(request, ["hrd", "superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          return Response.json(
            await getHrdDashboard(auth.session.user, auth.role)
          )
        } catch (error) {
          return jsonError(error, "Gagal membaca dashboard HRD.")
        }
      },
    },
  },
})
