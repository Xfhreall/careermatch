import { useQuery, type QueryClient } from "@tanstack/react-query"

import { getUserRole, type AppRole } from "./role-routing"

export const userQueryKey = ["user"] as const

export type UserCache = {
  email: string
  id: string
  image: string | null
  name: string
  role: AppRole
}

export function normalizeUser(value: unknown): UserCache | null {
  if (!isRecord(value)) {
    return null
  }

  const id = typeof value.id === "string" ? value.id : ""
  const email = typeof value.email === "string" ? value.email : ""

  if (!id || !email) {
    return null
  }

  return {
    email,
    id,
    image: typeof value.image === "string" ? value.image : null,
    name: typeof value.name === "string" ? value.name : "",
    role: getUserRole(value),
  }
}

export function setUserCache(queryClient: QueryClient, value: unknown) {
  const normalized = normalizeUser(value)

  if (!normalized) {
    queryClient.removeQueries({ queryKey: userQueryKey })
    return
  }

  queryClient.setQueryData(userQueryKey, normalized)
}

export function useUserQuery(options?: { enabled?: boolean }) {
  return useQuery({
    enabled: options?.enabled ?? true,
    gcTime: Number.POSITIVE_INFINITY,
    queryFn: fetchUserProfile,
    queryKey: userQueryKey,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })
}

async function fetchUserProfile(): Promise<UserCache | null> {
  const response = await fetch("/api/account/profile", {
    method: "GET",
  })
  const payload = await readPayload(response)

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error(readErrorMessage(payload, response.status))
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("profile" in payload)
  ) {
    throw new Error("Response profile tidak valid.")
  }

  return normalizeUser(payload.profile)
}

async function readPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  return response.text()
}

function readErrorMessage(payload: unknown, status: number) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message
  }

  if (typeof payload === "string" && payload.length > 0) {
    return payload
  }

  return `Server merespons dengan status ${status}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
