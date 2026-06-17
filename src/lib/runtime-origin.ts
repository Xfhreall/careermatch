const DEFAULT_LOCAL_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
] as const

type AuthOriginOptions = {
  configuredBaseURL?: string | null
  requestUrl?: string | URL | null
}

export function resolveAuthBaseURL({
  configuredBaseURL,
  requestUrl,
}: AuthOriginOptions): string {
  const configuredOrigin = getOrigin(configuredBaseURL)
  const requestOrigin = getOrigin(requestUrl)

  if (
    configuredOrigin &&
    !(
      isLoopbackOrigin(configuredOrigin) &&
      requestOrigin &&
      !isLoopbackOrigin(requestOrigin)
    )
  ) {
    return configuredOrigin
  }

  return requestOrigin ?? configuredOrigin ?? DEFAULT_LOCAL_ORIGINS[0]
}

export function resolveTrustedOrigins({
  configuredBaseURL,
  requestUrl,
}: AuthOriginOptions): string[] {
  return Array.from(
    new Set([
      resolveAuthBaseURL({
        configuredBaseURL,
        requestUrl,
      }),
      getOrigin(configuredBaseURL),
      getOrigin(requestUrl),
      ...DEFAULT_LOCAL_ORIGINS,
    ])
  ).filter((origin): origin is string => Boolean(origin))
}

export function resolveRequestUrl(
  input: string | URL,
  requestUrl?: string | URL | null
): string | URL {
  if (input instanceof URL) {
    return input
  }

  if (isAbsoluteUrl(input)) {
    return input
  }

  const baseOrigin = getOrigin(requestUrl)

  if (baseOrigin) {
    return new URL(input, baseOrigin).toString()
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return new URL(input, window.location.origin).toString()
  }

  return input
}

function getOrigin(value?: string | URL | null): string | null {
  if (!value) {
    return null
  }

  try {
    return new URL(value.toString()).origin
  } catch {
    return null
  }
}

function isAbsoluteUrl(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)
}

function isLoopbackOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin)
    return (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname === "127.0.0.1" ||
      hostname === "::1"
    )
  } catch {
    return false
  }
}
