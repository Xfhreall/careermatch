import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { JobseekerDashboardContainer } from "@/features/dashboard/jobseeker/containers/DashboardContainer"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"

export const Route = createFileRoute("/jobseeker/dashboard")({
  beforeLoad: requireRole(["jobseeker"]),
  component: JobseekerDashboardPage,
})

function JobseekerDashboardPage() {
  return (
    <DashboardLayout
      role="jobseeker"
      sidebarItems={getNavigationItems("jobseeker")}
    >
      <JobseekerDashboardContainer />
    </DashboardLayout>
  )
}
