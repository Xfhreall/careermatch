import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"
import { SuperadminApprovalContainer } from "@/features/dashboard/superadmin/containers/ApprovalContainer"

export const Route = createFileRoute("/superadmin/hrd-approval")({
  beforeLoad: requireRole(["superadmin"]),
  component: HrdApprovalPage,
})

function HrdApprovalPage() {
  return (
    <DashboardLayout
      sidebarItems={getNavigationItems("superadmin")}
      allowedRoles={["superadmin"]}
    >
      <SuperadminApprovalContainer />
    </DashboardLayout>
  )
}
