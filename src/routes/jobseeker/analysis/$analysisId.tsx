import { createFileRoute } from "@tanstack/react-router"
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { JobseekerAnalysisDetailContainer } from "@/features/dashboard/jobseeker/containers/AnalysisDetailContainer"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"

export const Route = createFileRoute("/jobseeker/analysis/$analysisId")({
  beforeLoad: requireRole(["jobseeker"]),
  component: AnalysisPage,
})

function AnalysisPage() {
  const { analysisId } = Route.useParams()
  return (
    <DashboardLayout sidebarItems={getNavigationItems("jobseeker")}>
      <JobseekerAnalysisDetailContainer analysisId={analysisId} />
    </DashboardLayout>
  )
}
