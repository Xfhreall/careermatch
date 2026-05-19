import { createFileRoute } from "@tanstack/react-router"

import { withAuth } from "@/lib/auth"

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        console.log("[Auth GET] path:", new URL(request.url).pathname)
        console.log("[Auth GET] has __env__:", Boolean((globalThis as any).__env__))
        console.log("[Auth GET] has HYPERDRIVE:", Boolean((globalThis as any).__env__?.HYPERDRIVE))
        try {
          console.log("[Auth GET] before withAuth")
          const result = await withAuth((auth) => {
            console.log("[Auth GET] inside withAuth callback, calling auth.handler")
            return auth.handler(request)
          })
          console.log("[Auth GET] after withAuth, status:", result.status)
          return result
        } catch (e) {
          console.error("[Auth GET] error:", e instanceof Error ? e.message : e)
          console.error("[Auth GET] stack:", e instanceof Error ? e.stack : "")
          return new Response(
            JSON.stringify({
              error: "Internal Server Error",
              detail: e instanceof Error ? e.message : String(e),
            }),
            { status: 500, headers: { "content-type": "application/json" } },
          )
        }
      },
      POST: async ({ request }: { request: Request }) => {
        try {
          return await withAuth((auth) => auth.handler(request))
        } catch (e) {
          console.error("[Auth] POST error:", e instanceof Error ? e.message : e)
          console.error("[Auth] POST stack:", e instanceof Error ? e.stack : "")
          return new Response(
            JSON.stringify({
              error: "Internal Server Error",
              detail: e instanceof Error ? e.message : String(e),
            }),
            { status: 500, headers: { "content-type": "application/json" } },
          )
        }
      },
    },
  },
})
