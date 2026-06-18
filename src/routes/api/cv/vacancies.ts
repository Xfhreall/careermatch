import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import { jsonError } from "@/lib/server/http"
import { listActiveVacancies } from "@/shared/repository/careermatch/action"

export const Route = createFileRoute("/api/cv/vacancies")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireRole(request, ["jobseeker", "superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          const vacancies = await listActiveVacancies()
          return Response.json({ vacancies })
        } catch (error) {
          return jsonError(error, "Gagal memuat lowongan aktif.")
        }
      },
    },
  },
})
