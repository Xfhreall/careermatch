import { createFileRoute } from "@tanstack/react-router"

import { DashboardLayout } from "@/features/dashboard/components/DashboardLayout"
import { ProfileSettingsContainer } from "@/features/dashboard/containers/ProfileSettingsContainer"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { getNavigationItems } from "@/features/dashboard/lib/navigation"

export const Route = createFileRoute("/jobseeker/profile")({
  beforeLoad: requireRole(["jobseeker"]),
  component: JobseekerProfilePage,
})

function JobseekerProfilePage() {
  return (
    <DashboardLayout sidebarItems={getNavigationItems("jobseeker")}>
      <ProfileSettingsContainer />
    </DashboardLayout>
  )
}
