export type CareerMatchEventName =
  | "cv_file_selected"
  | "cv_analysis_started"
  | "cv_analysis_failed"
  | "cv_analysis_completed"
  | "tab_opened"
  | "analysis_reset"
  | "report_exported"

export type CareerMatchEvent = {
  name: CareerMatchEventName
  properties: Record<string, unknown>
  timestamp: string
}

export function trackCareerMatchEvent(
  name: CareerMatchEventName,
  properties: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") {
    return
  }

  const event: CareerMatchEvent = {
    name,
    properties,
    timestamp: new Date().toISOString(),
  }

  window.dispatchEvent(
    new CustomEvent("careermatch:analytics", {
      detail: event,
    })
  )

  if (import.meta.env.DEV) {
    console.info("[CareerMatch analytics]", event)
  }
}

export function getFileExtension(filename: string) {
  const extension = filename.toLowerCase().match(/\.[^.]+$/)?.[0]

  return extension ?? "unknown"
}
