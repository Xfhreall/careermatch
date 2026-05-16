import { normalizeAnalysisResponse } from "./normalize"
import type { NormalizedAnalysisResponse } from "./types"
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
