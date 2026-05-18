import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { ProfileSettingsContainer } from "@/features/dashboard/components/ProfileSettingsContainer"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"

export const Route = createFileRoute("/hrd/profile")({
  beforeLoad: requireRole(["hrd", "superadmin"]),
  component: HrdProfilePage,
})

function HrdProfilePage() {
  return (
    <DashboardLayout
      role="hrd"
      sidebarItems={getNavigationItems("hrd")}
      allowedRoles={["hrd", "superadmin"]}
    >
      <ProfileSettingsContainer />
    </DashboardLayout>
  )
}
