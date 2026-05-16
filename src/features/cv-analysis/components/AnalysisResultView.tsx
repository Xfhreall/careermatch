import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowLeftIcon,
  BriefcaseBusinessIcon,
  CheckCircle2Icon,
  RotateCcwIcon,
} from "lucide-react"

import { Alert, AlertDescription } from "@/shared/components/shadcn/ui/alert"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import { Progress } from "@/shared/components/shadcn/ui/progress"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/shadcn/ui/tabs"

import { trackCareerMatchEvent } from "../analytics"
import type { NormalizedAnalysisResponse } from "../types"
import { JobMatchesTable } from "./JobMatchesTable"
import { SafeMarkdown } from "./SafeMarkdown"

type AnalysisResultViewProps = {
  result: NormalizedAnalysisResponse
  onReset: () => void
}

export function AnalysisResultView({
  result,
  onReset,
}: AnalysisResultViewProps) {
  const shouldReduceMotion = useReducedMotion()
  const topMatch = result.jobMatches[0]
  const candidateSkills = result.candidateProfile?.skills?.slice(0, 8) ?? []
  const transition = {
    duration: shouldReduceMotion ? 0 : 0.34,
    ease: [0.16, 1, 0.3, 1],
  } as const

  function handleReset() {
    trackCareerMatchEvent("analysis_reset", {
      analysis_id: result.analysisId,
      previous_job_match_count: result.jobMatches.length,
    })
    onReset()
  }

  function handleTabOpened(tab: string) {
    trackCareerMatchEvent("tab_opened", {
      analysis_id: result.analysisId,
      tab,
    })
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      transition={transition}
    >
      <div className="grid gap-6 border-border border-b bg-background/85 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="flex max-w-4xl flex-col gap-4">
          <Badge className="w-fit bg-card" variant="outline">
            Analysis ID: {result.analysisId}
          </Badge>
          <div className="flex flex-col gap-3">
            <h1 className="text-5xl text-editorial leading-tight md:text-7xl">
              Hasil analisis CV
            </h1>
            <p className="max-w-2xl text-muted-foreground leading-8">
              Ranking pekerjaan, gap skill, dan career coaching dari pipeline
              CareerMatch.
            </p>
          </div>
        </div>
        <Button onClick={handleReset} variant="outline">
          <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
          Analisis CV Baru
        </Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground text-sm">Candidate profile</p>
          <h2 className="mt-3 font-medium text-2xl leading-8">
            {result.candidateProfile?.summary ??
              "Profil kandidat tersedia pada Full Report."}
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {candidateSkills.length > 0 ? (
              candidateSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">Skills in report</Badge>
            )}
          </div>
        </div>

        {topMatch ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <ScorePanel
              label="Kompatibilitas"
              value={topMatch.compatibilityScore}
            />
            <ScorePanel label="Skill Match" value={topMatch.skillMatchScore} />
            <ScorePanel
              label="Pengalaman"
              value={topMatch.experienceMatchScore}
            />
          </div>
        ) : (
          <Alert className="bg-card">
            <BriefcaseBusinessIcon aria-hidden="true" />
            <AlertDescription>
              Data job match terstruktur tidak ditemukan. Laporan lengkap tetap
              tersedia di tab Full Report.
            </AlertDescription>
          </Alert>
        )}
      </section>

      <Tabs
        defaultValue={topMatch ? "jobs" : "raw"}
        onValueChange={handleTabOpened}
      >
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="jobs">Job Matches</TabsTrigger>
          <TabsTrigger value="coaching">Career Coach</TabsTrigger>
          <TabsTrigger value="raw">Full Report</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            transition={transition}
          >
            <div className="border-border border-b p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Ranked matches
                  </p>
                  <h2 className="font-medium text-2xl">
                    Lowongan paling cocok
                  </h2>
                </div>
                <Badge variant="outline">
                  {result.jobMatches.length} matches
                </Badge>
              </div>
            </div>
            <div className="p-0">
              {result.jobMatches.length > 0 ? (
                <JobMatchesTable jobs={result.jobMatches} />
              ) : (
                <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center">
                  <BriefcaseBusinessIcon aria-hidden="true" />
                  <p className="font-medium">Belum ada job match terstruktur</p>
                  <p className="max-w-md text-muted-foreground text-sm leading-6">
                    Buka Full Report untuk melihat output mentah dari backend.
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        </TabsContent>

        <TabsContent value="coaching">
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            transition={transition}
          >
            <div className="border-border border-b p-6">
              <p className="text-muted-foreground text-sm">Career coaching</p>
              <h2 className="font-medium text-2xl">
                Rekomendasi dan interview prep
              </h2>
            </div>
            <div className="p-6">
              <SafeMarkdown value={result.careerCoaching} />
            </div>
          </motion.section>
        </TabsContent>

        <TabsContent value="raw">
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            transition={transition}
          >
            <div className="border-border border-b p-6">
              <p className="text-muted-foreground text-sm">Full report</p>
              <h2 className="font-medium text-2xl">Pipeline response</h2>
            </div>
            <div className="p-6">
              {typeof result.rawResponse === "string" ? (
                <SafeMarkdown value={result.rawResponse} />
              ) : (
                <pre className="max-h-[520px] max-w-full overflow-auto rounded-lg border border-border bg-background p-4 text-xs leading-6">
                  {JSON.stringify(result.rawResponse, null, 2)}
                </pre>
              )}
            </div>
          </motion.section>
        </TabsContent>
      </Tabs>

      <Button className="w-fit" onClick={handleReset} variant="ghost">
        <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
        Kembali ke upload
      </Button>
    </motion.div>
  )
}

function ScorePanel({ label, value }: { label: string; value?: number }) {
  const normalizedValue = value ?? 0

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="mt-2 font-medium text-3xl">{formatScore(value)}</p>
        </div>
        <CheckCircle2Icon aria-hidden="true" className="size-5" />
      </div>
      <Progress className="mt-6" value={normalizedValue} />
    </div>
  )
}

function formatScore(value: number | undefined) {
  if (value === undefined) {
    return "-"
  }

  return `${Math.round(value)}%`
}
