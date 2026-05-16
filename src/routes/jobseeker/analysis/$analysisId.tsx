import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { motion, useReducedMotion } from "framer-motion"
import { FileSearchIcon } from "lucide-react"
import * as React from "react"

import { AnalysisResultView } from "@/features/cv-analysis/components/AnalysisResultView"
import {
  loadAnalysisResult,
  removeAnalysisResult,
} from "@/features/cv-analysis/storage"
import type { NormalizedAnalysisResponse } from "@/features/cv-analysis/types"
import { Button } from "@/shared/components/shadcn/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/components/shadcn/ui/empty"
import { Skeleton } from "@/shared/components/shadcn/ui/skeleton"

export const Route = createFileRoute("/jobseeker/analysis/$analysisId")({
  component: AnalysisPage,
})

function AnalysisPage() {
  const { analysisId } = Route.useParams()
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const [result, setResult] =
    React.useState<NormalizedAnalysisResponse | null>()

  React.useEffect(() => {
    setResult(loadAnalysisResult(analysisId))
  }, [analysisId])

  function handleReset() {
    removeAnalysisResult(analysisId)
    void navigate({ to: "/jobseeker/analyze" })
  }

  return (
    <main className="paper-grid min-h-dvh bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {result === undefined ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-56" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : result ? (
          <AnalysisResultView onReset={handleReset} result={result} />
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.28 }}
          >
            <Empty className="border border-border bg-card">
              <FileSearchIcon aria-hidden="true" />
              <EmptyHeader>
                <EmptyTitle>Hasil analisis tidak ditemukan</EmptyTitle>
                <EmptyDescription>
                  Data MVP disimpan sementara di sessionStorage. Jalankan
                  analisis CV baru untuk membuat result route.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  nativeButton={false}
                  render={<Link to="/jobseeker/analyze" />}
                >
                  Upload CV
                </Button>
              </EmptyContent>
            </Empty>
          </motion.div>
        )}
      </div>
    </main>
  )
}
