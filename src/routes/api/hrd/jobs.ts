import { createFileRoute } from "@tanstack/react-router"
import { requireRole } from "@/lib/server/auth-session"
import {
  createHrdJob,
  deleteHrdJob,
  getHrdDashboard,
  updateHrdJob,
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
          const payload = await readJobPayload(request)
          const validation = validateJobPayload(payload)

          if (validation.response) {
            return validation.response
          }

          await createHrdJob(auth.session.user, validation.job)
          return Response.json(
            await getHrdDashboard(auth.session.user, auth.role)
          )
        } catch (error) {
          return jsonError(error, "Gagal membuat lowongan.")
        }
      },
      DELETE: async ({ request }) => {
        const auth = await requireRole(request, ["hrd", "superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          const payload = (await request.json()) as { id?: string }

          if (!payload.id) {
            return Response.json(
              { error: "ID lowongan wajib dikirim." },
              { status: 400 }
            )
          }

          await deleteHrdJob(auth.session.user, auth.role, payload.id)
          return Response.json(
            await getHrdDashboard(auth.session.user, auth.role)
          )
        } catch (error) {
          return jsonError(error, "Gagal menghapus lowongan.")
        }
      },
      PATCH: async ({ request }) => {
        const auth = await requireRole(request, ["hrd", "superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          const payload = await readJobPayload(request)
          const validation = validateJobPayload(payload)

          if (!payload.id) {
            return Response.json(
              { error: "ID lowongan wajib dikirim." },
              { status: 400 }
            )
          }

          if (validation.response) {
            return validation.response
          }

          await updateHrdJob(auth.session.user, auth.role, {
            ...validation.job,
            id: payload.id,
          })

          return Response.json(
            await getHrdDashboard(auth.session.user, auth.role)
          )
        } catch (error) {
          return jsonError(error, "Gagal memperbarui lowongan.")
        }
      },
    },
  },
})

async function readJobPayload(request: Request) {
  try {
    return (await request.json()) as {
      description?: string
      id?: string
      minYears?: number
      skills?: string[]
      status?: string
      title?: string
    }
  } catch {
    return {}
  }
}

function validateJobPayload(payload: {
  description?: string
  minYears?: number
  skills?: string[]
  status?: string
  title?: string
}) {
  const title = payload.title?.trim()

  if (!title) {
    return {
      job: null,
      response: Response.json(
        { error: "Judul lowongan wajib dikirim." },
        { status: 400 }
      ),
    } as const
  }

  if (
    payload.status !== "active" &&
    payload.status !== "closed" &&
    payload.status !== "draft"
  ) {
    return {
      job: null,
      response: Response.json(
        { error: "Status lowongan tidak valid." },
        { status: 400 }
      ),
    } as const
  }

  const minYears = Number(payload.minYears ?? 0)

  if (!Number.isFinite(minYears) || minYears < 0) {
    return {
      job: null,
      response: Response.json(
        { error: "Minimum pengalaman tidak valid." },
        { status: 400 }
      ),
    } as const
  }

  return {
    job: {
      description: payload.description?.trim() ?? "",
      minYears: Math.round(minYears),
      skills: Array.isArray(payload.skills)
        ? payload.skills.map((skill) => skill.trim()).filter(Boolean)
        : [],
      status: payload.status,
      title,
    },
    response: null,
  } as const
}
