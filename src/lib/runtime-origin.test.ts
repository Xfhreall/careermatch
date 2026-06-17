import { describe, expect, it } from "vitest"

import { resolveAuthBaseURL, resolveTrustedOrigins } from "./runtime-origin"

describe("auth runtime origin resolution", () => {
  it("prefers the active request origin over a localhost fallback", () => {
    const requestUrl = "https://careermatch-capstone.xfhreall.workers.dev/login"

    expect(
      resolveAuthBaseURL({
        configuredBaseURL: "http://localhost:3000",
        requestUrl,
      })
    ).toBe("https://careermatch-capstone.xfhreall.workers.dev")
  })

  it("trusts both the active request origin and local development origins", () => {
    const trustedOrigins = resolveTrustedOrigins({
      configuredBaseURL: "http://localhost:3000",
      requestUrl:
        "https://careermatch-capstone.xfhreall.workers.dev/jobseeker/dashboard",
    })

    expect(trustedOrigins).toContain(
      "https://careermatch-capstone.xfhreall.workers.dev"
    )
    expect(trustedOrigins).toContain("http://localhost:3000")
    expect(trustedOrigins).toContain("http://127.0.0.1:3001")
  })

  it("keeps the configured localhost callback origin for local OAuth", () => {
    expect(
      resolveAuthBaseURL({
        configuredBaseURL: "http://localhost:3000",
        requestUrl: "http://127.0.0.1:4173/login",
      })
    ).toBe("http://localhost:3000")
  })
})
