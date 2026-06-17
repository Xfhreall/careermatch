import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  deleteAnalysisResultRequest,
  fetchAnalysisHistory,
} from "@/shared/repository/cv-analysis/action"

export const analysisHistoryQueryKey = ["analysis-history"] as const

export function useAnalysisHistoryQuery() {
  return useQuery({
    queryFn: fetchAnalysisHistory,
    queryKey: analysisHistoryQueryKey,
  })
}

interface DeleteAnalysisResultMutationCallbacks {
  onSuccess?: () => unknown
  onError?: (error: Error) => unknown
}

export function useDeleteAnalysisResultMutation(
  callbacks?: DeleteAnalysisResultMutationCallbacks
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAnalysisResultRequest(id),
    onSuccess: async () => {
      toast.success("Riwayat analisis berhasil dihapus.")
      await queryClient.invalidateQueries({ queryKey: analysisHistoryQueryKey })
      await callbacks?.onSuccess?.()
    },
    onError: async (error) => {
      const err = error instanceof Error ? error : new Error(String(error))
      toast.error(err.message || "Gagal menghapus riwayat.")
      await callbacks?.onError?.(err)
    },
  })
}
