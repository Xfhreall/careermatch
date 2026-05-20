import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FileSearchIcon, ShieldCheckIcon, SparklesIcon, ZapIcon } from "lucide-react";

import { UploadCvForm } from "@/features/cv-analysis/components/UploadCvForm";
import type { NormalizedAnalysisResponse } from "@/features/cv-analysis/types";
import { PlatformHeader } from "@/features/platform/components/PlatformHeader";

const FEATURES = [
  {
    icon: FileSearchIcon,
    label: "Format: PDF, DOC, DOCX (maks 10MB)",
  },
  {
    icon: ShieldCheckIcon,
    label: "PII anonymization di pipeline backend",
  },
  {
    icon: SparklesIcon,
    label: "Output: score overview, job match, skill gap, coaching",
  },
];

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
    <div className="min-h-dvh overflow-x-hidden" style={{ backgroundColor: "#F0F9FF" }}>
      <PlatformHeader
        description="Upload CV untuk analisis AI, dapatkan job match, skill gap, dan career coaching."
        eyebrow="Analisis CV"
        showNavbar={false}
        title="CV analysis"
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium" style={{ borderColor: "#BAE6FD", color: "#0369A1", backgroundColor: "#E7EFF5" }}>
            <ZapIcon className="size-4" />
            <span>Powered by AI</span>
          </div>
          <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl" style={{ color: "#0C4A6E" }}>
            Mulai dari CV, lanjut ke rekomendasi kerja yang lebih jelas.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed" style={{ color: "#0C4A6E", opacity: 0.7 }}>
            File diproses aman di backend CareerMatch. Setelah analisis selesai,
            kamu akan langsung diarahkan ke halaman hasil detail.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.label}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-150"
              style={{
                borderColor: "#BAE6FD",
                backgroundColor: "#FFFFFF",
                color: "#0C4A6E",
              }}
            >
              <feature.icon className="size-4" style={{ color: "#0369A1" }} />
              <span>{feature.label}</span>
            </div>
          ))}
        </div>

        <UploadCvForm onAnalysisReady={handleAnalysisReady} />
      </main>
    </div>
  );
}
