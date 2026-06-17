import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  type AnalyzeCvInput,
  analyzeCvRequest,
} from "@/shared/repository/cv-analysis/action"

import { trackCareerMatchEvent } from "../analytics"
import type { NormalizedAnalysisResponse } from "../types"

interface UseAnalyzeCvOptions {
  analyzeCv?: (input: AnalyzeCvInput) => Promise<NormalizedAnalysisResponse>
  onSuccess?: (result: NormalizedAnalysisResponse) => void
  onError?: (error: Error) => void
}

export function useAnalyzeCv(options?: UseAnalyzeCvOptions) {
  const customAnalyzeCv = options?.analyzeCv ?? analyzeCvRequest

  return useMutation({
    mutationFn: customAnalyzeCv,
    onSuccess: (result) => {
      toast.success("Analisis CV selesai.")
      trackCareerMatchEvent("cv_analysis_completed", {
        job_match_count: result.jobMatches.length,
        top_score: result.jobMatches[0]?.compatibilityScore ?? null,
      })
      options?.onSuccess?.(result)
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal terhubung ke server. Coba lagi sebentar."
      toast.error(message)
      trackCareerMatchEvent("cv_analysis_failed", {
        stage: "request",
        error_message: message,
      })
      options?.onError?.(error instanceof Error ? error : new Error(message))
    },
  })
}
