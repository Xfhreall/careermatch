import type { NormalizedAnalysisResponse } from "./types"

const STORAGE_PREFIX = "careermatch:analysis:"
const HISTORY_KEY = "careermatch:analysis-history"

export type AnalysisHistoryItem = {
  analysisId: string
  createdAt: string
  jobMatchCount: number
  topCompany?: string
  topRole?: string
  topScore?: number
}

export function saveAnalysisResult(result: NormalizedAnalysisResponse) {
  if (!canUseSessionStorage()) {
    return
  }

  sessionStorage.setItem(storageKey(result.analysisId), JSON.stringify(result))
  saveAnalysisHistoryItem(result)
}

export function loadAnalysisResult(
  analysisId: string
): NormalizedAnalysisResponse | null {
  if (!canUseSessionStorage()) {
    return null
  }

  const rawValue = sessionStorage.getItem(storageKey(analysisId))

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as NormalizedAnalysisResponse
  } catch {
    sessionStorage.removeItem(storageKey(analysisId))
    return null
  }
}

export function removeAnalysisResult(analysisId: string) {
  if (!canUseSessionStorage()) {
    return
  }

  sessionStorage.removeItem(storageKey(analysisId))
  removeAnalysisHistoryItem(analysisId)
}

export function listAnalysisHistory(): AnalysisHistoryItem[] {
  if (!canUseLocalStorage()) {
    return []
  }

  const rawValue = localStorage.getItem(HISTORY_KEY)

  if (!rawValue) {
    return []
  }

  try {
    return JSON.parse(rawValue) as AnalysisHistoryItem[]
  } catch {
    localStorage.removeItem(HISTORY_KEY)
    return []
  }
}

function storageKey(analysisId: string) {
  return `${STORAGE_PREFIX}${analysisId}`
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && "sessionStorage" in window
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && "localStorage" in window
}

function saveAnalysisHistoryItem(result: NormalizedAnalysisResponse) {
  if (!canUseLocalStorage()) {
    return
  }

  const topMatch = result.jobMatches[0]
  const nextItem: AnalysisHistoryItem = {
    analysisId: result.analysisId,
    createdAt: new Date().toISOString(),
    jobMatchCount: result.jobMatches.length,
    topCompany: topMatch?.company,
    topRole: topMatch?.jobTitle,
    topScore: topMatch?.compatibilityScore,
  }
  const existingItems = listAnalysisHistory().filter(
    (item) => item.analysisId !== result.analysisId
  )

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify([nextItem, ...existingItems].slice(0, 12))
  )
}

function removeAnalysisHistoryItem(analysisId: string) {
  if (!canUseLocalStorage()) {
    return
  }

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(
      listAnalysisHistory().filter((item) => item.analysisId !== analysisId)
    )
  )
}
