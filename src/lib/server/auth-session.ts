import {
  getDashboardPathForRole,
  getUserRole,
} from "@/features/auth/lib/role-routing"
import { withAuth } from "@/lib/auth"

type SessionUser = {
  companyId?: string | null
  email: string
  id: string
  image?: string | null
  name?: string | null
  role?: string | null
}

export type RequestSession = {
  session: unknown
  user: SessionUser
}

export async function getRequestSession(request: Request) {
  return (await withAuth(
    (auth) =>
      auth.api.getSession({
        headers: request.headers,
      }),
    request
  )) as RequestSession | null
}

export async function requireAuthenticatedUser(request: Request) {
  const session = await getRequestSession(request)

  if (!session?.user) {
    return {
      response: Response.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      ),
      session: null,
    } as const
  }

  return { response: null, session } as const
}

export async function requireRole(
  request: Request,
  allowedRoles: Array<"jobseeker" | "hrd" | "superadmin">
) {
  const authResult = await requireAuthenticatedUser(request)

  if (authResult.response) {
    return authResult
  }

  const role = getUserRole(authResult.session.user)

  if (!allowedRoles.includes(role)) {
    return {
      response: Response.json(
        {
          error: "Role user tidak memiliki akses ke resource ini.",
          redirectTo: getDashboardPathForRole(role),
        },
        { status: 403 }
      ),
      session: null,
    } as const
  }

  return { response: null, session: authResult.session, role } as const
}
