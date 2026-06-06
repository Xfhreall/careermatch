import { useQueryClient } from "@tanstack/react-query"
import * as React from "react"

import { authClient } from "@/lib/auth-client"

import {
  normalizeUser,
  setUserCache,
  useUserQuery,
  userQueryKey,
} from "./user-query"

function getUserSignature(user: {
  email: string
  id: string
  image: string | null
  name: string
  role: string
  updatedAt?: string | Date | null
}) {
  return [
    user.id ?? "",
    user.email ?? "",
    user.name ?? "",
    user.image ?? "",
    user.role ?? "",
    user.updatedAt ? String(user.updatedAt) : "",
  ].join("|")
}

export function SessionUserCacheSync() {
  const queryClient = useQueryClient()
  const session = authClient.useSession()
  const [isClient, setIsClient] = React.useState(false)
  const lastUserSignatureRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  useUserQuery({
    enabled: isClient && Boolean(session.data?.user),
  })

  React.useEffect(() => {
    if (session.isPending) {
      return
    }

    const sessionUser = normalizeUser(session.data?.user)

    if (!sessionUser) {
      queryClient.removeQueries({ queryKey: userQueryKey })
      lastUserSignatureRef.current = null
      return
    }

    const nextUserSignature = getUserSignature(sessionUser)

    if (lastUserSignatureRef.current === nextUserSignature) {
      return
    }

    setUserCache(queryClient, sessionUser)
    lastUserSignatureRef.current = nextUserSignature
  }, [queryClient, session.data?.user, session.isPending])

  return null
}
