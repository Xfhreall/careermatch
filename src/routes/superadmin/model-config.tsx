import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"
import { SuperadminModelConfigContainer } from "@/features/dashboard/superadmin/containers/ModelConfigContainer"

export const Route = createFileRoute("/superadmin/model-config")({
  beforeLoad: requireRole(["superadmin"]),
  component: ModelConfigPage,
})

function ModelConfigPage() {
  return (
    <DashboardLayout
      sidebarItems={getNavigationItems("superadmin")}
      allowedRoles={["superadmin"]}
    >
      <SuperadminModelConfigContainer />
    </DashboardLayout>
  )
}
