import { createFileRoute } from "@tanstack/react-router"

import { getUserRole } from "@/features/auth/lib/role-routing"
import { withAuth } from "@/lib/auth"
import { requireAuthenticatedUser } from "@/lib/server/auth-session"
import { jsonError } from "@/lib/server/http"
import {
  removeAvatarFromStorageByPublicUrl,
  uploadAvatarToStorage,
  validateAvatarFile,
} from "@/shared/repository/account/action"

export const Route = createFileRoute("/api/account/profile")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const authResult = await requireAuthenticatedUser(request)

        if (authResult.response) {
          return authResult.response
        }

        return Response.json({
          profile: toProfilePayload(authResult.session.user),
        })
      },
      PATCH: async ({ request }) => {
        const authResult = await requireAuthenticatedUser(request)

        if (authResult.response) {
          return authResult.response
        }

        const currentUser = authResult.session.user

        try {
          const formData = await request.formData()
          const nameValue = formData.get("name")
          const removeAvatar =
            String(formData.get("removeAvatar") ?? "false") === "true"
          const avatarValue = formData.get("avatar")

          if (nameValue != null && typeof nameValue !== "string") {
            return Response.json(
              { error: "Field name tidak valid." },
              { status: 400 }
            )
          }

          let nextName: string | undefined

          if (typeof nameValue === "string") {
            const trimmed = nameValue.trim()

            if (trimmed.length > 0 && trimmed.length < 2) {
              return Response.json(
                { error: "Username minimal 2 karakter." },
                { status: 400 }
              )
            }

            if (trimmed.length > 80) {
              return Response.json(
                { error: "Username maksimal 80 karakter." },
                { status: 400 }
              )
            }

            if (trimmed.length > 0 && trimmed !== (currentUser.name ?? "")) {
              nextName = trimmed
            }
          }

          const avatarFile =
            avatarValue instanceof File && avatarValue.size > 0
              ? avatarValue
              : null

          if (avatarFile) {
            const validationError = validateAvatarFile(avatarFile)

            if (validationError) {
              return Response.json({ error: validationError }, { status: 400 })
            }
          }

          let nextImage: string | null | undefined

          if (removeAvatar) {
            nextImage = null
          }

          if (avatarFile) {
            const uploaded = await uploadAvatarToStorage(
              currentUser.id,
              avatarFile
            )
            nextImage = uploaded.publicUrl
          }

          const updatePayload: { image?: string | null; name?: string } = {}

          if (nextName !== undefined) {
            updatePayload.name = nextName
          }

          if (nextImage !== undefined) {
            updatePayload.image = nextImage
          }

          if (Object.keys(updatePayload).length === 0) {
            return Response.json({
              profile: toProfilePayload(currentUser),
            })
          }

          const updateResponse = await withAuth(
            (auth) =>
              auth.api.updateUser({
                asResponse: true,
                body: updatePayload,
                headers: request.headers,
              }),
            request
          )

          if (!updateResponse.ok) {
            return updateResponse
          }

          const previousImage = currentUser.image ?? null
          const imageChanged =
            nextImage !== undefined &&
            previousImage &&
            previousImage !== nextImage

          if (imageChanged || (removeAvatar && previousImage)) {
            void removeAvatarFromStorageByPublicUrl(previousImage)
          }

          const headers = new Headers(updateResponse.headers)

          return Response.json(
            {
              profile: {
                email: currentUser.email,
                id: currentUser.id,
                image:
                  nextImage === undefined
                    ? (currentUser.image ?? null)
                    : nextImage,
                name: nextName ?? currentUser.name ?? "",
                role: getUserRole(currentUser),
              },
            },
            { headers }
          )
        } catch (error) {
          return jsonError(error, "Gagal memperbarui profile.")
        }
      },
    },
  },
})

function toProfilePayload(user: {
  email: string
  id: string
  image?: string | null
  name?: string | null
  role?: string | null
}) {
  return {
    email: user.email,
    id: user.id,
    image: user.image ?? null,
    name: user.name ?? "",
    role: getUserRole(user),
  }
}
