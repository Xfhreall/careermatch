import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import {
  getHrdDashboard,
  refreshHrdEmbeddings,
} from "@/lib/server/careermatch-repository"
import { jsonError } from "@/lib/server/http"

export const Route = createFileRoute("/api/hrd/refresh-embeddings")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireRole(request, ["hrd", "superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          await refreshHrdEmbeddings()
          return Response.json(await getHrdDashboard())
        } catch (error) {
          return jsonError(error, "Gagal refresh embeddings.")
        }
      },
    },
  },
})
