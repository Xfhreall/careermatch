import { normalizeAnalysisResponse } from "./normalize"
import type { AnalysisHistoryItem, NormalizedAnalysisResponse } from "./types"
import { validateCvFile } from "./validators"

export async function analyzeCvRequest(
  file: File
): Promise<NormalizedAnalysisResponse> {
  const validation = validateCvFile(file)

  if (!validation.ok) {
    throw new Error(validation.message)
  }

  const body = new FormData()
  body.append("cv", file)
  body.append("filename", file.name)

  const response = await fetch("/api/cv/analyze", {
    method: "POST",
    body,
  })
  const payload = await readResponsePayload(response)

  if (!response.ok) {
    const message =
      isErrorPayload(payload) && payload.error
        ? payload.error
        : `Server merespons dengan status ${response.status}`

    throw new Error(`Gagal terhubung ke server: ${message}`)
  }

  return normalizeAnalysisResponse(payload)
}

export async function fetchAnalysisHistory(): Promise<AnalysisHistoryItem[]> {
  const response = await fetch("/api/cv/history")
  const payload = await readResponsePayload(response)

  if (!response.ok) {
    throw new Error(readErrorMessage(payload, response.status))
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "history" in payload &&
    Array.isArray(payload.history)
  ) {
    return payload.history as AnalysisHistoryItem[]
  }

  return []
}

export async function fetchAnalysisResult(
  analysisId: string
): Promise<NormalizedAnalysisResponse | null> {
  const response = await fetch(
    `/api/cv/result/${encodeURIComponent(analysisId)}`
  )
  const payload = await readResponsePayload(response)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(readErrorMessage(payload, response.status))
  }

  if (typeof payload === "object" && payload !== null && "result" in payload) {
    return normalizeAnalysisResponse(payload.result)
  }

  return normalizeAnalysisResponse(payload)
}

export async function deleteAnalysisResultRequest(analysisId: string) {
  const response = await fetch(
    `/api/cv/result/${encodeURIComponent(analysisId)}`,
    {
      method: "DELETE",
    }
  )
  const payload = await readResponsePayload(response)

  if (!response.ok) {
    throw new Error(readErrorMessage(payload, response.status))
  }
}

async function readResponsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  return response.text()
}

function isErrorPayload(value: unknown): value is { error?: string } {
  return typeof value === "object" && value !== null && "error" in value
}

function readErrorMessage(payload: unknown, status: number) {
  return isErrorPayload(payload) && payload.error
    ? payload.error
    : `Server merespons dengan status ${status}`
}
