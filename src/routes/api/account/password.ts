import { createFileRoute } from "@tanstack/react-router"

import { withAuth } from "@/lib/auth"
import { requireAuthenticatedUser } from "@/lib/server/auth-session"
import { jsonError } from "@/lib/server/http"

export const Route = createFileRoute("/api/account/password")({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        const authResult = await requireAuthenticatedUser(request)

        if (authResult.response) {
          return authResult.response
        }

        try {
          const payload = await request.json().catch(() => null)

          if (!isPasswordPayload(payload)) {
            return Response.json(
              { error: "Payload password tidak valid." },
              { status: 400 }
            )
          }

          const currentPassword = payload.currentPassword.trim()
          const newPassword = payload.newPassword.trim()
          const confirmPassword = payload.confirmPassword.trim()

          if (!currentPassword || !newPassword || !confirmPassword) {
            return Response.json(
              { error: "Semua field password wajib diisi." },
              { status: 400 }
            )
          }

          if (newPassword !== confirmPassword) {
            return Response.json(
              { error: "Password baru dan konfirmasi password belum sama." },
              { status: 400 }
            )
          }

          if (newPassword.length < 8) {
            return Response.json(
              { error: "Password baru minimal 8 karakter." },
              { status: 400 }
            )
          }

          const changeResponse = await withAuth((auth) =>
            auth.api.changePassword({
              asResponse: true,
              body: {
                currentPassword,
                newPassword,
                revokeOtherSessions: false,
              },
              headers: request.headers,
            })
          )

          if (!changeResponse.ok) {
            const errorPayload = await readPayload(changeResponse)
            const fallback =
              changeResponse.status === 400
                ? "Password sekarang tidak valid atau password baru tidak memenuhi aturan."
                : "Gagal mengubah password."

            return Response.json(
              { error: readErrorMessage(errorPayload, fallback) },
              { status: changeResponse.status }
            )
          }

          const headers = new Headers(changeResponse.headers)

          return Response.json(
            { ok: true, message: "Password berhasil diubah." },
            { headers }
          )
        } catch (error) {
          return jsonError(error, "Gagal mengubah password.")
        }
      },
    },
  },
})

function isPasswordPayload(value: unknown): value is {
  confirmPassword: string
  currentPassword: string
  newPassword: string
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "confirmPassword" in value &&
    "currentPassword" in value &&
    "newPassword" in value &&
    typeof value.confirmPassword === "string" &&
    typeof value.currentPassword === "string" &&
    typeof value.newPassword === "string"
  )
}

async function readPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  return response.text()
}

function readErrorMessage(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error
  }

  if (typeof payload === "string" && payload.length > 0) {
    return payload
  }

  return fallback
}
