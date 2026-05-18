import { createFileRoute } from "@tanstack/react-router";

import { requireRole } from "@/features/dashboard/lib/auth-middleware";
import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { getNavigationItems } from "@/features/dashboard/lib/navigation";
import { JobseekerAnalysisDetailContainer } from "@/features/dashboard/jobseeker/containers/AnalysisDetailContainer";

export const Route = createFileRoute("/jobseeker/analysis/$analysisId")({
  beforeLoad: requireRole(["jobseeker"]),
  component: AnalysisPage,
});

function AnalysisPage() {
  const { analysisId } = Route.useParams();
  return (
    <DashboardLayout
      role="jobseeker"
      sidebarItems={getNavigationItems("jobseeker")}
    >
      <JobseekerAnalysisDetailContainer analysisId={analysisId} />
    </DashboardLayout>
  );
}
