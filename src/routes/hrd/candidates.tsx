import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { HrdCandidatesContainer } from "@/features/dashboard/hrd/containers/CandidatesContainer"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"

export const Route = createFileRoute("/hrd/candidates")({
  beforeLoad: requireRole(["hrd", "superadmin"]),
  component: HrdCandidatesPage,
})

function HrdCandidatesPage() {
  return (
    <DashboardLayout
      role="hrd"
      sidebarItems={getNavigationItems("hrd")}
      allowedRoles={["hrd", "superadmin"]}
    >
      <HrdCandidatesContainer />
    </DashboardLayout>
  )
}
