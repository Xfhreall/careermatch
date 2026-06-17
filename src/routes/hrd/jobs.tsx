import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { HrdJobsContainer } from "@/features/dashboard/hrd/containers/JobsContainer"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"

export const Route = createFileRoute("/hrd/jobs")({
  beforeLoad: requireRole(["hrd", "superadmin"]),
  component: HrdJobsPage,
})

function HrdJobsPage() {
  return (
    <DashboardLayout
      sidebarItems={getNavigationItems("hrd")}
      allowedRoles={["hrd", "superadmin"]}
    >
      <HrdJobsContainer />
    </DashboardLayout>
  )
}
