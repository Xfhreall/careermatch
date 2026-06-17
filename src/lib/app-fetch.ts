import { resolveRequestUrl } from "./runtime-origin"

export async function fetchApp(input: string | URL, init?: RequestInit) {
  return fetch(await resolveAppRequestUrl(input), init)
}

async function resolveAppRequestUrl(input: string | URL) {
  if (typeof window !== "undefined") {
    return resolveRequestUrl(input)
  }

  return resolveRequestUrl(input, getTanStackStartRequestUrl())
}

function getTanStackStartRequestUrl(): string | undefined {
  const eventStorage = (
    globalThis as typeof globalThis & {
      [TANSTACK_START_EVENT_STORAGE_SYMBOL]?: {
        getStore?: () => {
          h3Event?: {
            req?: Request
          }
        }
      }
    }
  )[TANSTACK_START_EVENT_STORAGE_SYMBOL]

  return eventStorage?.getStore?.()?.h3Event?.req?.url
}

const TANSTACK_START_EVENT_STORAGE_SYMBOL = Symbol.for(
  "tanstack-start:event-storage"
)
