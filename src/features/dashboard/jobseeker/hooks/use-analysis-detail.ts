import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  deleteAnalysisResultRequest,
  fetchAnalysisResult,
} from "@/shared/repository/cv-analysis/action"
import { analysisHistoryQueryKey } from "./use-analysis-history"

export const analysisDetailQueryKey = (analysisId: string) =>
  ["analysis-result", analysisId] as const

export function useAnalysisDetailQuery(analysisId: string) {
  return useQuery({
    queryFn: () => fetchAnalysisResult(analysisId),
    queryKey: analysisDetailQueryKey(analysisId),
  })
}

interface DeleteAnalysisDetailMutationCallbacks {
  onSuccess?: () => unknown
  onSettled?: () => unknown
}

export function useDeleteAnalysisDetailMutation(
  analysisId: string,
  callbacks?: DeleteAnalysisDetailMutationCallbacks
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteAnalysisResultRequest(analysisId),
    onSuccess: async () => {
      await callbacks?.onSuccess?.()
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: analysisHistoryQueryKey })
      await callbacks?.onSettled?.()
    },
  })
}
