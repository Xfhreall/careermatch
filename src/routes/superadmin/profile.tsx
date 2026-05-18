import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { ProfileSettingsContainer } from "@/features/dashboard/components/ProfileSettingsContainer"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"

export const Route = createFileRoute("/superadmin/profile")({
  beforeLoad: requireRole(["superadmin"]),
  component: SuperadminProfilePage,
})

function SuperadminProfilePage() {
  return (
    <DashboardLayout
      role="superadmin"
      sidebarItems={getNavigationItems("superadmin")}
      allowedRoles={["superadmin"]}
    >
      <ProfileSettingsContainer />
    </DashboardLayout>
  )
}
