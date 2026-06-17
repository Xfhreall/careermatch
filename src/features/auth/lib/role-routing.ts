export type AppRole = "jobseeker" | "hrd" | "superadmin"

export type RoleDashboardPath =
  | "/jobseeker/dashboard"
  | "/hrd/portal"
  | "/superadmin/monitoring"

export function getDashboardPathForRole(role: unknown): RoleDashboardPath {
  switch (role) {
    case "hrd":
      return "/hrd/portal"
    case "superadmin":
      return "/superadmin/monitoring"
    default:
      return "/jobseeker/dashboard"
  }
}

export function getUserRole(user: unknown): AppRole {
  if (!isRecord(user)) {
    return "jobseeker"
  }

  const role = user.role

  if (role === "hrd" || role === "superadmin" || role === "jobseeker") {
    return role
  }

  return "jobseeker"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
