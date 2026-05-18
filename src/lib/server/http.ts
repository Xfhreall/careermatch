export function jsonError(error: unknown, fallback: string, status = 500) {
  return Response.json(
    {
      error: error instanceof Error ? error.message : fallback,
    },
    { status }
  )
}
