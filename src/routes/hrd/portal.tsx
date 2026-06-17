import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { HrdPortalContainer } from "@/features/dashboard/hrd/containers/PortalContainer"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"

export const Route = createFileRoute("/hrd/portal")({
  beforeLoad: requireRole(["hrd", "superadmin"]),
  component: HrdPortalPage,
})

function HrdPortalPage() {
  return (
    <DashboardLayout
      sidebarItems={getNavigationItems("hrd")}
      allowedRoles={["hrd", "superadmin"]}
    >
      <HrdPortalContainer />
    </DashboardLayout>
  )
}
