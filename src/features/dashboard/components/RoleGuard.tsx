import { useNavigate } from "@tanstack/react-router"
import * as React from "react"
import {
  type AppRole,
  getDashboardPathForRole,
  getUserRole,
} from "@/features/auth/lib/role-routing"
import { authClient } from "@/lib/auth-client"

export function RoleAccessGuard({ allowedRoles }: { allowedRoles: AppRole[] }) {
  const navigate = useNavigate()
  const session = authClient.useSession()

  React.useEffect(() => {
    if (session.isPending) {
      return
    }

    if (!session.data?.user) {
      void navigate({ replace: true, to: "/login" })
      return
    }

    const role = getUserRole(session.data.user)

    if (!allowedRoles.includes(role)) {
      void navigate({
        replace: true,
        to: getDashboardPathForRole(role),
      })
    }
  }, [allowedRoles, navigate, session.data?.user, session.isPending])

  return null
}
