import type {
  AnonymousCandidateRecord,
  HrdJobRecord,
  SuperadminSnapshot,
} from "./types"

export type HrdDashboardPayload = {
  anonymousCandidates: AnonymousCandidateRecord[]
  jobs: HrdJobRecord[]
}

export async function fetchHrdDashboard(): Promise<HrdDashboardPayload> {
  return fetchJson("/api/hrd/dashboard")
}

export async function createHrdJob(): Promise<HrdDashboardPayload> {
  return fetchJson("/api/hrd/jobs", { method: "POST" })
}

export async function refreshHrdEmbeddings(): Promise<HrdDashboardPayload> {
  return fetchJson("/api/hrd/refresh-embeddings", { method: "POST" })
}

export async function fetchSuperadminSnapshot(): Promise<SuperadminSnapshot> {
  return fetchJson("/api/superadmin/snapshot")
}

export async function updateHrdApprovalRequest(input: {
  id: string
  status: "approved" | "rejected"
}): Promise<SuperadminSnapshot> {
  return fetchJson("/api/superadmin/hrd-approval", {
    body: JSON.stringify(input),
    headers: {
      "content-type": "application/json",
    },
    method: "PATCH",
  })
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  const payload = await readPayload(response)

  if (!response.ok) {
    throw new Error(
      isErrorPayload(payload) && payload.error
        ? payload.error
        : `Server merespons dengan status ${response.status}`
    )
  }

  return payload as T
}

async function readPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  return response.text()
}

function isErrorPayload(value: unknown): value is { error?: string } {
  return typeof value === "object" && value !== null && "error" in value
}
