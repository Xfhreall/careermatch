import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"
import { SuperadminMonitoringContainer } from "@/features/dashboard/superadmin/containers/MonitoringContainer"

export const Route = createFileRoute("/superadmin/monitoring")({
  beforeLoad: requireRole(["superadmin"]),
  component: SuperadminMonitoringPage,
})

function SuperadminMonitoringPage() {
  return (
    <DashboardLayout
      role="superadmin"
      sidebarItems={getNavigationItems("superadmin")}
    >
      <SuperadminMonitoringContainer />
    </DashboardLayout>
  )
}
