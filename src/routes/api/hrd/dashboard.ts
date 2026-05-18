import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import { getHrdDashboard } from "@/lib/server/careermatch-repository"
import { jsonError } from "@/lib/server/http"

export const Route = createFileRoute("/api/hrd/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireRole(request, ["hrd", "superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          return Response.json(await getHrdDashboard())
        } catch (error) {
          return jsonError(error, "Gagal membaca dashboard HRD.")
        }
      },
    },
  },
})
