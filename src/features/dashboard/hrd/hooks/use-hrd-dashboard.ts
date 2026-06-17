import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createHrdJob,
  deleteHrdJob,
  fetchHrdDashboard,
  refreshHrdEmbeddings,
  updateHrdJob,
} from "@/shared/repository/platform/action"

const HRD_DASHBOARD_REFETCH_INTERVAL_MS = 30_000
export const hrdDashboardQueryKey = ["hrd-dashboard"] as const

export function useHrdDashboardQuery() {
  return useQuery({
    queryFn: fetchHrdDashboard,
    queryKey: hrdDashboardQueryKey,
    refetchInterval: HRD_DASHBOARD_REFETCH_INTERVAL_MS,
  })
}

interface MutationCallbacks<TPayload = unknown, TVariables = void> {
  onMutate?: () => unknown
  onSuccess?: (payload: TPayload, variables: TVariables) => unknown
  onError?: (error: Error, variables: TVariables) => unknown
  onSettled?: () => unknown
}

export function useCreateHrdJobMutation(
  callbacks?: MutationCallbacks<
    Awaited<ReturnType<typeof createHrdJob>>,
    Parameters<typeof createHrdJob>[0]
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createHrdJob,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: hrdDashboardQueryKey })
      await callbacks?.onMutate?.()
    },
    onSuccess: async (payload, variables) => {
      queryClient.setQueryData(hrdDashboardQueryKey, payload)
      toast.success(
        variables.status === "active"
          ? "Lowongan berhasil dipublikasikan."
          : "Lowongan berhasil disimpan sebagai draft."
      )
      await callbacks?.onSuccess?.(payload, variables)
    },
    onError: async (error, variables) => {
      const err = error instanceof Error ? error : new Error(String(error))
      toast.error(err.message || "Lowongan gagal dibuat.")
      await callbacks?.onError?.(err, variables)
    },
    onSettled: async () => {
      await callbacks?.onSettled?.()
    },
  })
}

export function useUpdateHrdJobMutation(
  callbacks?: MutationCallbacks<
    Awaited<ReturnType<typeof updateHrdJob>>,
    Parameters<typeof updateHrdJob>[0]
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateHrdJob,
    onSuccess: async (payload, variables) => {
      queryClient.setQueryData(hrdDashboardQueryKey, payload)
      toast.success("Lowongan berhasil diperbarui.")
      await callbacks?.onSuccess?.(payload, variables)
    },
    onError: async (error, variables) => {
      const err = error instanceof Error ? error : new Error(String(error))
      toast.error(err.message || "Lowongan gagal diperbarui.")
      await callbacks?.onError?.(err, variables)
    },
    onSettled: async () => {
      await callbacks?.onSettled?.()
    },
  })
}

export function useDeleteHrdJobMutation(
  callbacks?: MutationCallbacks<
    Awaited<ReturnType<typeof deleteHrdJob>>,
    Parameters<typeof deleteHrdJob>[0]
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteHrdJob,
    onSuccess: async (payload, variables) => {
      queryClient.setQueryData(hrdDashboardQueryKey, payload)
      toast.success("Lowongan berhasil dihapus.")
      await callbacks?.onSuccess?.(payload, variables)
    },
    onError: async (error, variables) => {
      const err = error instanceof Error ? error : new Error(String(error))
      toast.error(err.message || "Lowongan gagal dihapus.")
      await callbacks?.onError?.(err, variables)
    },
    onSettled: async () => {
      await callbacks?.onSettled?.()
    },
  })
}

export function useRefreshHrdEmbeddingsMutation(
  callbacks?: MutationCallbacks<
    Awaited<ReturnType<typeof refreshHrdEmbeddings>>,
    void
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: refreshHrdEmbeddings,
    onSuccess: async (payload, variables) => {
      queryClient.setQueryData(hrdDashboardQueryKey, payload)
      await callbacks?.onSuccess?.(payload, variables)
    },
    onError: async (error, variables) => {
      const err = error instanceof Error ? error : new Error(String(error))
      await callbacks?.onError?.(err, variables)
    },
    onSettled: async () => {
      await callbacks?.onSettled?.()
    },
  })
}
