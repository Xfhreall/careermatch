import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router"
import { useEffect } from "react"

import { requireRole } from "@/features/dashboard/lib/auth-middleware"

export const Route = createFileRoute("/jobseeker/analysis")({
  beforeLoad: requireRole(["jobseeker"]),
  component: AnalysisLegacyRedirect,
})

function AnalysisLegacyRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  const isParentRoute = location.pathname === "/jobseeker/analysis"

  useEffect(() => {
    if (isParentRoute) {
      void navigate({ replace: true, to: "/jobseeker/history" })
    }
  }, [isParentRoute, navigate])

  if (isParentRoute) return null

  return <Outlet />
}
