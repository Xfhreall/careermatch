import { createFileRoute } from "@tanstack/react-router"

import { withAuth } from "@/lib/auth"

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const result = await withAuth((auth) => {
            return auth.handler(request)
          }, request)
          return result
        } catch (e) {
          return new Response(
            JSON.stringify({
              error: "Internal Server Error",
              detail: e instanceof Error ? e.message : String(e),
            }),
            { status: 500, headers: { "content-type": "application/json" } }
          )
        }
      },
      POST: async ({ request }: { request: Request }) => {
        try {
          return await withAuth((auth) => auth.handler(request), request)
        } catch (e) {
          return new Response(
            JSON.stringify({
              error: "Internal Server Error",
              detail: e instanceof Error ? e.message : String(e),
            }),
            { status: 500, headers: { "content-type": "application/json" } }
          )
        }
      },
    },
  },
})
