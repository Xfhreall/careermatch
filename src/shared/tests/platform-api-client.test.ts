import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { fetchSuperadminSnapshot } from "@/shared/repository/platform/action"

describe("platform API client", () => {
  const originalFetch = globalThis.fetch
  const eventStorageSymbol = Symbol.for("tanstack-start:event-storage")
  const originalEventStorage = (
    globalThis as typeof globalThis & {
      [eventStorageSymbol]?: unknown
    }
  )[eventStorageSymbol]

  beforeEach(() => {
    ;(
      globalThis as typeof globalThis & {
        [eventStorageSymbol]?: {
          getStore: () => {
            h3Event: {
              req: Request
            }
          }
        }
      }
    )[eventStorageSymbol] = {
      getStore: () => ({
        h3Event: {
          req: new Request(
            "https://careermatch-capstone.xfhreall.workers.dev/hrd/portal"
          ),
        },
      }),
    }

    globalThis.fetch = vi.fn(async (input) => {
      expect(input).toBe(
        "https://careermatch-capstone.xfhreall.workers.dev/api/superadmin/snapshot"
      )

      return new Response(
        JSON.stringify({
          approvalRequests: [],
          auditEvents: [],
          modelConfigs: [],
          monitoringCards: [],
          platformSettings: [],
          scoringConfigs: [],
        }),
        {
          headers: {
            "content-type": "application/json",
          },
        }
      )
    }) as typeof fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    ;(
      globalThis as typeof globalThis & {
        [eventStorageSymbol]?: unknown
      }
    )[eventStorageSymbol] = originalEventStorage
    vi.restoreAllMocks()
  })

  it("resolves relative API calls against the active SSR request origin", async () => {
    await fetchSuperadminSnapshot()

    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })
})
