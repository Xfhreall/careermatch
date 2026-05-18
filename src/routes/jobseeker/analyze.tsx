import { createFileRoute } from "@tanstack/react-router";

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { JobseekerAnalyzeContainer } from "@/features/dashboard/jobseeker/containers/AnalyzeContainer";
import { requireRole } from "@/features/dashboard/lib/auth-middleware";
import { getNavigationItems } from "@/features/dashboard/lib/navigation";

export const Route = createFileRoute("/jobseeker/analyze")({
  beforeLoad: requireRole(["jobseeker"]),
  component: AnalyzePage,
});

function AnalyzePage() {
  return (
    <DashboardLayout
      role="jobseeker"
      sidebarItems={getNavigationItems("jobseeker")}
    >
      <JobseekerAnalyzeContainer />
    </DashboardLayout>
  );
}
