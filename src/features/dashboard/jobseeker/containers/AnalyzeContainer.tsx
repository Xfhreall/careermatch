import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import {
  FileSearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react"

import { UploadCvForm } from "@/features/cv-analysis/components/UploadCvForm"
import type { NormalizedAnalysisResponse } from "@/features/cv-analysis/types"
import { PlatformHeader } from "@/features/platform/components/PlatformHeader"
import { Badge } from "@/shared/components/shadcn/ui/badge"

const FEATURES = [
  {
    icon: FileSearchIcon,
    label: "Format: PDF, DOC, DOCX (maks 10MB)",
  },
  {
    icon: ShieldCheckIcon,
    label: "Data pribadi dianonimkan sebelum analisis",
  },
  {
    icon: SparklesIcon,
    label: "Hasil: skor, job match, skill gap, coaching",
  },
]

export function JobseekerAnalyzeContainer() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  function handleAnalysisReady(result: NormalizedAnalysisResponse) {
    void queryClient.invalidateQueries({ queryKey: ["analysis-history"] })
    void navigate({
      params: { analysisId: result.analysisId },
      to: "/jobseeker/analysis/$analysisId",
    })
  }

  return (
    <div className="paper-grid min-h-dvh overflow-x-hidden bg-background">
      <PlatformHeader
        description="Upload CV untuk analisis AI, dapatkan job match, skill gap, dan career coaching."
        eyebrow="Analisis CV"
        showNavbar={false}
        title="CV analysis"
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="mb-10 text-center">
          <Badge
            className="mx-auto mb-6 gap-2 rounded-full bg-card px-4 py-1.5 text-sm"
            variant="outline"
          >
            <ZapIcon aria-hidden="true" />
            <span>Powered by AI</span>
          </Badge>
          <h1 className="font-bold font-heading text-3xl text-foreground leading-tight tracking-normal sm:text-4xl">
            Mulai dari CV, lanjut ke rekomendasi kerja yang lebih jelas.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground leading-relaxed">
            File diproses aman di backend CareerMatch. Setelah analisis selesai,
            kamu akan langsung diarahkan ke halaman hasil detail.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          {FEATURES.map((feature) => (
            <Badge
              key={feature.label}
              className="gap-2 rounded-lg bg-card px-4 py-2.5 text-sm"
              variant="outline"
            >
              <feature.icon aria-hidden="true" />
              <span>{feature.label}</span>
            </Badge>
          ))}
        </div>

        <UploadCvForm onAnalysisReady={handleAnalysisReady} />
      </main>
    </div>
  )
}
