import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { ProfileSettingsContainer } from "@/features/dashboard/containers/ProfileSettingsContainer"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"

export const Route = createFileRoute("/hrd/profile")({
  beforeLoad: requireRole(["hrd", "superadmin"]),
  component: HrdProfilePage,
})

function HrdProfilePage() {
  return (
    <DashboardLayout
      sidebarItems={getNavigationItems("hrd")}
      allowedRoles={["hrd", "superadmin"]}
    >
      <ProfileSettingsContainer />
    </DashboardLayout>
  )
}
