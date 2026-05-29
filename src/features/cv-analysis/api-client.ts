import { normalizeAnalysisResponse } from "./normalize"
import type {
  AnalysisHistoryItem,
  AppliedJob,
  NormalizedAnalysisResponse,
} from "./types"
import { validateCvFile } from "./validators"

export type AnalyzeCvInput = AppliedJob & {
  file: File
}

export function buildAnalyzeCvFormData(
  input: AnalyzeCvInput,
  sessionId = Date.now().toString()
) {
  const body = new FormData()
  body.append("cv", input.file)
  body.append("cv_file", input.file)
  body.append("filename", input.file.name)
  body.append("job_title", input.jobTitle.trim())
  body.append("job_description", input.jobDescription.trim())
  body.append("session_id", sessionId)

  return body
}

export async function analyzeCvRequest(
  input: AnalyzeCvInput
): Promise<NormalizedAnalysisResponse> {
  const validation = validateCvFile(input.file)

  if (!validation.ok) {
    throw new Error(validation.message)
  }

  const appliedJob = {
    jobDescription: input.jobDescription.trim(),
    jobTitle: input.jobTitle.trim(),
  }

  if (!appliedJob.jobTitle || !appliedJob.jobDescription) {
    throw new Error("Posisi yang dilamar dan deskripsi pekerjaan wajib diisi.")
  }

  const body = buildAnalyzeCvFormData({
    file: input.file,
    ...appliedJob,
  })

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

  return normalizeAnalysisResponse(payload, { appliedJob })
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
