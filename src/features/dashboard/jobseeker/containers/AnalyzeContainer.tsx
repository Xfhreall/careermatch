import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FileSearchIcon } from "lucide-react";

import { UploadCvForm } from "@/features/cv-analysis/components/UploadCvForm";
import type { NormalizedAnalysisResponse } from "@/features/cv-analysis/types";
import { PlatformHeader } from "@/features/platform/components/PlatformHeader";

export function JobseekerAnalyzeContainer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function handleAnalysisReady(result: NormalizedAnalysisResponse) {
    void queryClient.invalidateQueries({ queryKey: ["analysis-history"] });
    void navigate({
      params: { analysisId: result.analysisId },
      to: "/jobseeker/analysis/$analysisId",
    });
  }

  return (
    <div className="paper-grid min-h-dvh overflow-x-hidden bg-background">
      <PlatformHeader
        description="Upload CV untuk analisis AI, dapatkan job match, skill gap, dan career coaching."
        eyebrow="Analisis CV"
        showNavbar={false}
        title="CV analysis"
      />

      <section className="mx-auto grid w-full max-w-7xl gap-8 overflow-x-hidden px-4 py-10 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
        <div className="min-w-0 rounded-lg border border-border bg-card p-6">
          <h2 className="font-medium text-3xl text-editorial leading-tight">
            Mulai dari CV, lanjut ke rekomendasi kerja yang lebih jelas.
          </h2>
          <p className="mt-4 text-muted-foreground leading-8">
            File diproses aman di backend CareerMatch. Setelah analisis selesai,
            kamu akan langsung diarahkan ke halaman hasil detail.
          </p>
          <div className="mt-6 grid gap-3">
            {[
              "Format: PDF, DOC, DOCX (maks 10MB)",
              "PII anonymization di pipeline backend",
              "Output: score overview, job match, skill gap, coaching",
            ].map((item) => (
              <div className="flex items-center gap-3" key={item}>
                <FileSearchIcon aria-hidden="true" className="size-4" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <UploadCvForm onAnalysisReady={handleAnalysisReady} />
      </section>
    </div>
  );
}
