import { useEffect } from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

import { requireRole } from "@/features/dashboard/lib/auth-middleware"

export const Route = createFileRoute("/jobseeker/analysis")({
  beforeLoad: requireRole(["jobseeker"]),
  component: AnalysisLegacyRedirect,
})

function AnalysisLegacyRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    void navigate({ replace: true, to: "/jobseeker/history" })
  }, [navigate])

  return null
}
