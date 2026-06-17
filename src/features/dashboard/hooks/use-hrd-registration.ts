import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  fetchHrdRequestStatus,
  submitHrdRequest,
} from "@/shared/repository/platform/action"

export const hrdRequestStatusQueryKey = ["hrd-request-status"] as const

export function useHrdRequestStatusQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryFn: fetchHrdRequestStatus,
    queryKey: hrdRequestStatusQueryKey,
    enabled: options?.enabled ?? true,
  })
}

interface SubmitHrdRequestMutationCallbacks {
  onSuccess?: (payload: Awaited<ReturnType<typeof submitHrdRequest>>) => unknown
  onError?: (error: Error) => unknown
}

export function useSubmitHrdRequestMutation(
  callbacks?: SubmitHrdRequestMutationCallbacks
) {
  return useMutation({
    mutationFn: submitHrdRequest,
    onSuccess: async (payload) => {
      toast.success("Permintaan registrasi HRD berhasil diajukan.")
      await callbacks?.onSuccess?.(payload)
    },
    onError: async (error) => {
      const err = error instanceof Error ? error : new Error(String(error))
      toast.error(err.message || "Gagal mengajukan permintaan HRD.")
      await callbacks?.onError?.(err)
    },
  })
}
