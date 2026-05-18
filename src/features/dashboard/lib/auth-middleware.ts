import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"

import {
  type AppRole,
  getDashboardPathForRole,
  getUserRole,
} from "@/features/auth/role-routing"
import { auth } from "@/lib/auth"

const getRouteAccessSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getRequest()
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return {
        authenticated: false as const,
        role: null,
      }
    }

    return {
      authenticated: true as const,
      role: getUserRole(session.user),
    }
  }
)

export function requireRole(allowedRoles: AppRole[]) {
  return async () => {
    const authResult = await getRouteAccessSession()

    if (!authResult.authenticated || !authResult.role) {
      throw redirect({
        replace: true,
        to: "/login",
      })
    }

    if (!allowedRoles.includes(authResult.role)) {
      throw redirect({
        replace: true,
        to: getDashboardPathForRole(authResult.role),
      })
    }
  }
}
