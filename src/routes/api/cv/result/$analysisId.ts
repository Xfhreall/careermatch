import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import {
  deleteAnalysisResult,
  loadAnalysisResult,
} from "@/lib/server/careermatch-repository"
import { jsonError } from "@/lib/server/http"

export const Route = createFileRoute("/api/cv/result/$analysisId")({
  server: {
    handlers: {
      DELETE: async ({ request }) => {
        const auth = await requireRole(request, ["jobseeker", "superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          await deleteAnalysisResult(
            auth.session.user.id,
            getAnalysisId(request)
          )
          return Response.json({ ok: true })
        } catch (error) {
          return jsonError(error, "Gagal menghapus hasil analisis.")
        }
      },
      GET: async ({ request }) => {
        const auth = await requireRole(request, ["jobseeker", "superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          const result = await loadAnalysisResult(
            auth.session.user.id,
            getAnalysisId(request)
          )

          if (!result) {
            return Response.json(
              { error: "Hasil analisis tidak ditemukan." },
              { status: 404 }
            )
          }

          return Response.json({ result })
        } catch (error) {
          return jsonError(error, "Gagal membaca hasil analisis.")
        }
      },
    },
  },
})

function getAnalysisId(request: Request) {
  return decodeURIComponent(
    new URL(request.url).pathname.split("/").pop() ?? ""
  )
}
