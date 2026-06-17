import { createFileRoute } from "@tanstack/react-router"

import { requireRole } from "@/lib/server/auth-session"
import { jsonError } from "@/lib/server/http"
import {
  getSuperadminSnapshot,
  updateModelConfig,
  updatePlatformSetting,
  updateScoringConfig,
} from "@/shared/repository/careermatch/action"

export const Route = createFileRoute("/api/superadmin/model-config")({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        const auth = await requireRole(request, ["superadmin"])

        if (auth.response) {
          return auth.response
        }

        try {
          const payload = (await request.json()) as {
            key?: string
            kind?: string
            model?: string
            purpose?: string
            value?: boolean
            weight?: number
          }

          if (!payload.key) {
            return Response.json(
              { error: "Key konfigurasi wajib dikirim." },
              { status: 400 }
            )
          }

          if (payload.kind === "scoring") {
            const weight = Number(payload.weight)

            if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
              return Response.json(
                { error: "Bobot scoring harus 0 sampai 100." },
                { status: 400 }
              )
            }

            await updateScoringConfig({
              key: payload.key,
              reviewerId: auth.session.user.id,
              weight: Math.round(weight),
            })

            return Response.json(await getSuperadminSnapshot())
          }

          if (payload.kind === "model") {
            const model = payload.model?.trim()
            const purpose = payload.purpose?.trim()

            if (!model || !purpose) {
              return Response.json(
                { error: "Model dan purpose wajib diisi." },
                { status: 400 }
              )
            }

            await updateModelConfig({
              key: payload.key,
              model,
              purpose,
              reviewerId: auth.session.user.id,
            })

            return Response.json(await getSuperadminSnapshot())
          }

          if (payload.kind === "platform") {
            if (typeof payload.value !== "boolean") {
              return Response.json(
                { error: "Nilai setting platform harus boolean." },
                { status: 400 }
              )
            }

            await updatePlatformSetting({
              key: payload.key,
              reviewerId: auth.session.user.id,
              value: payload.value,
            })

            return Response.json(await getSuperadminSnapshot())
          }

          return Response.json(
            { error: "Jenis konfigurasi tidak valid." },
            { status: 400 }
          )
        } catch (error) {
          return jsonError(error, "Gagal memperbarui konfigurasi model.")
        }
      },
    },
  },
})
