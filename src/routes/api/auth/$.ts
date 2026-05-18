import { createFileRoute } from "@tanstack/react-router"

import { withAuth } from "@/lib/auth"

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) =>
        withAuth((auth) => auth.handler(request)),
      POST: async ({ request }: { request: Request }) =>
        withAuth((auth) => auth.handler(request)),
    },
  },
})
