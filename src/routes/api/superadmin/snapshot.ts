import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import { jsonError } from "@/lib/server/http"
import { getSuperadminSnapshot } from "@/shared/repository/careermatch/action"

export const Route = createFileRoute("/api/superadmin/snapshot")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireRole(request, ["superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          return Response.json(await getSuperadminSnapshot())
        } catch (error) {
          return jsonError(error, "Gagal membaca dashboard superadmin.")
        }
      },
    },
  },
})
