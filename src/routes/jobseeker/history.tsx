import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { AnalysisHistoryContainer } from "@/features/dashboard/jobseeker/containers/AnalysisHistoryContainer"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"

export const Route = createFileRoute("/jobseeker/history")({
  beforeLoad: requireRole(["jobseeker"]),
  component: AnalysisHistoryPage,
})

function AnalysisHistoryPage() {
  return (
    <DashboardLayout sidebarItems={getNavigationItems("jobseeker")}>
      <AnalysisHistoryContainer />
    </DashboardLayout>
  )
}
