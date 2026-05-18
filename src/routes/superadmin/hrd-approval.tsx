import { createFileRoute } from "@tanstack/react-router";

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout";
import { SuperadminApprovalContainer } from "@/features/dashboard/superadmin/containers/ApprovalContainer";
import { requireRole } from "@/features/dashboard/lib/auth-middleware";
import { getNavigationItems } from "@/features/dashboard/lib/navigation";

export const Route = createFileRoute("/superadmin/hrd-approval")({
  beforeLoad: requireRole(["superadmin"]),
  component: HrdApprovalPage,
});

function HrdApprovalPage() {
  return (
    <DashboardLayout
      role="superadmin"
      sidebarItems={getNavigationItems("superadmin")}
      allowedRoles={["superadmin"]}
    >
      <SuperadminApprovalContainer />
    </DashboardLayout>
  );
}
