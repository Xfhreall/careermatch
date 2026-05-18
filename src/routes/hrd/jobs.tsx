import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"
import { HrdJobsContainer } from "@/features/dashboard/hrd/containers/JobsContainer"

export const Route = createFileRoute("/hrd/jobs")({
  beforeLoad: requireRole(["hrd", "superadmin"]),
  component: HrdJobsPage,
})

function HrdJobsPage() {
  return (
    <DashboardLayout
      role="hrd"
      sidebarItems={getNavigationItems("hrd")}
      allowedRoles={["hrd", "superadmin"]}
    >
      <HrdJobsContainer />
    </DashboardLayout>
  )
}
