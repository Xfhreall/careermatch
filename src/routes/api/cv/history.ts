import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import { jsonError } from "@/lib/server/http"
import { listAnalysisHistory } from "@/shared/repository/careermatch/action"

export const Route = createFileRoute("/api/cv/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireRole(request, ["jobseeker", "superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          return Response.json({
            history: await listAnalysisHistory(auth.session.user.id),
          })
        } catch (error) {
          return jsonError(error, "Gagal membaca riwayat analisis.")
        }
      },
    },
  },
})
