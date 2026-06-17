import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  fetchSuperadminSnapshot,
  updateHrdApprovalRequest,
} from "@/shared/repository/platform/action"

export const superadminSnapshotQueryKey = ["superadmin-snapshot"] as const

export function useSuperadminSnapshotQuery() {
  return useQuery({
    queryFn: fetchSuperadminSnapshot,
    queryKey: superadminSnapshotQueryKey,
  })
}

interface UpdateHrdApprovalMutationCallbacks {
  onSuccess?: (
    payload: Awaited<ReturnType<typeof updateHrdApprovalRequest>>
  ) => unknown
  onError?: (error: Error) => unknown
}

export function useUpdateHrdApprovalMutation(
  callbacks?: UpdateHrdApprovalMutationCallbacks
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateHrdApprovalRequest,
    onSuccess: async (payload) => {
      queryClient.setQueryData(superadminSnapshotQueryKey, payload)
      toast.success("Status approval HRD diperbarui.")
      await callbacks?.onSuccess?.(payload)
    },
    onError: async (error) => {
      const err = error instanceof Error ? error : new Error(String(error))
      toast.error(err.message || "Approval HRD gagal diproses.")
      await callbacks?.onError?.(err)
    },
  })
}
