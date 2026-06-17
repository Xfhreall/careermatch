import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import { jsonError } from "@/lib/server/http"
import {
  getHrdDashboard,
  refreshHrdEmbeddings,
} from "@/shared/repository/careermatch/action"

export const Route = createFileRoute("/api/hrd/refresh-embeddings")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireRole(request, ["hrd", "superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          await refreshHrdEmbeddings(auth.session.user, auth.role)
          return Response.json(
            await getHrdDashboard(auth.session.user, auth.role)
          )
        } catch (error) {
          return jsonError(error, "Gagal refresh embeddings.")
        }
      },
    },
  },
})
