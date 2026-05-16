import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  FileTextIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { UploadCvForm } from "@/features/cv-analysis/components/UploadCvForm"
import { saveAnalysisResult } from "@/features/cv-analysis/storage"
import type { NormalizedAnalysisResponse } from "@/features/cv-analysis/types"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"

export const Route = createFileRoute("/jobseeker/analyze")({
  component: AnalyzePage,
})

const intakeChecks = [
  "Validasi PDF, DOC, dan DOCX",
  "Ukuran file maksimal 10MB",
  "Upload dikirim sebagai multipart form data",
  "Result disimpan sementara di browser",
]

function AnalyzePage() {
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const transition = {
    duration: shouldReduceMotion ? 0 : 0.34,
    ease: [0.16, 1, 0.3, 1],
  } as const

  function handleAnalysisReady(result: NormalizedAnalysisResponse) {
    saveAnalysisResult(result)
    void navigate({
      params: { analysisId: result.analysisId },
      to: "/jobseeker/analysis/$analysisId",
    })
  }

  return (
    <main className="paper-grid min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
        <motion.nav
          animate={{ opacity: 1, y: 0 }}
          className="flex h-16 items-center justify-between border-border border-b bg-background/85"
          initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
          transition={transition}
        >
          <Button nativeButton={false} render={<Link to="/" />} variant="ghost">
            <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
            CareerMatch
          </Button>
          <Badge className="bg-card" variant="outline">
            Jobseeker Analyze
          </Badge>
        </motion.nav>

        <section className="grid gap-8 pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.04 }}
          >
            <div className="flex flex-col gap-5">
              <Badge className="w-fit bg-accent text-accent-foreground">
                CV intake
              </Badge>
              <h1 className="text-5xl text-editorial leading-tight md:text-7xl">
                Upload CV, dapatkan dossier pekerjaan.
              </h1>
              <p className="max-w-2xl text-muted-foreground leading-8">
                CareerMatch memvalidasi file di browser, mengirimnya ke server
                proxy, lalu membuka hasil analisis sebagai route terpisah.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5">
                <FileTextIcon aria-hidden="true" className="size-5" />
                <p className="mt-5 font-medium">File contract</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["PDF", "DOC", "DOCX"].map((format) => (
                    <Badge key={format} variant="outline">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <ShieldCheckIcon aria-hidden="true" className="size-5" />
                <p className="mt-5 font-medium">Webhook stays server-side</p>
                <p className="mt-3 text-muted-foreground text-sm leading-6">
                  Browser hanya bicara ke endpoint internal CareerMatch.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-5">
              <p className="font-medium">Acceptance checklist</p>
              <div className="mt-4 grid gap-3">
                {intakeChecks.map((item) => (
                  <div className="flex items-center gap-3" key={item}>
                    <CheckCircle2Icon
                      aria-hidden="true"
                      className="size-4 text-accent-foreground"
                    />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            transition={{ ...transition, delay: shouldReduceMotion ? 0 : 0.12 }}
          >
            <UploadCvForm onAnalysisReady={handleAnalysisReady} />
          </motion.div>
        </section>
      </div>
    </main>
  )
}
