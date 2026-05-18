import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import {
  createDefaultHrdJob,
  getHrdDashboard,
} from "@/lib/server/careermatch-repository"
import { jsonError } from "@/lib/server/http"

export const Route = createFileRoute("/api/hrd/jobs")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireRole(request, ["hrd", "superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          await createDefaultHrdJob(auth.session.user)
          return Response.json(await getHrdDashboard())
        } catch (error) {
          return jsonError(error, "Gagal membuat lowongan.")
        }
      },
    },
  },
})
