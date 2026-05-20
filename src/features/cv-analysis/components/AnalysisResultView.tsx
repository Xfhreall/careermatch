import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowLeftIcon,
  BriefcaseBusinessIcon,
  CheckCircle2Icon,
  DownloadIcon,
  RotateCcwIcon,
} from "lucide-react"
import type * as React from "react"

import { Alert, AlertDescription } from "@/shared/components/shadcn/ui/alert"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadcn/ui/card"
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

  function handlePrintReport() {
    trackCareerMatchEvent("report_exported", {
      analysis_id: result.analysisId,
      export_type: "browser_pdf",
    })
    window.print()
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
        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
          <Button onClick={handlePrintReport} variant="outline">
            <DownloadIcon aria-hidden="true" data-icon="inline-start" />
            Simpan PDF
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
            Analisis CV Baru
          </Button>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardDescription>Profil kandidat</CardDescription>
            <CardTitle className="text-2xl leading-8">
              {result.candidateProfile?.summary ??
                "Profil kandidat tersedia pada Laporan Lengkap."}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
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
          </CardContent>
        </Card>

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
              tersedia di tab Laporan Lengkap.
            </AlertDescription>
          </Alert>
        )}
      </section>

      <Tabs
        defaultValue={topMatch ? "jobs" : "report"}
        onValueChange={handleTabOpened}
      >
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="jobs">Job Matches</TabsTrigger>
          <TabsTrigger value="coaching">Career Coach</TabsTrigger>
          <TabsTrigger value="report">Laporan Lengkap</TabsTrigger>
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
                    Buka Laporan Lengkap untuk melihat ringkasan hasil analisis.
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

        <TabsContent value="report">
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            transition={transition}
          >
            <div className="flex flex-col gap-2 border-border border-b pb-4">
              <p className="text-muted-foreground text-sm">Laporan lengkap</p>
              <h2 className="font-medium text-2xl">Ringkasan hasil analisis</h2>
              <p className="max-w-2xl text-muted-foreground text-sm leading-6">
                Informasi tambahan disusun menjadi bagian ringkas tanpa
                menampilkan JSON teknis ke pengguna.
              </p>
            </div>
            <StructuredReport result={result} />
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
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="mt-2 font-medium text-3xl">{formatScore(value)}</p>
          </div>
          <CheckCircle2Icon aria-hidden="true" className="size-5" />
        </div>
        <Progress className="mt-6" value={normalizedValue} />
      </CardContent>
    </Card>
  )
}

function formatScore(value: number | undefined) {
  if (value === undefined) {
    return "-"
  }

  return `${Math.round(value)}%`
}

function StructuredReport({ result }: { result: NormalizedAnalysisResponse }) {
  const parsedResponse = parseMaybeJson(result.rawResponse)
  const fallbackReport =
    typeof parsedResponse === "string" ? parsedResponse : ""
  const pipelineSections = createPipelineSections(parsedResponse)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <ReportMetric
          label="Total rekomendasi"
          value={String(result.jobMatches.length)}
        />
        <ReportMetric
          label="Top match"
          value={formatScore(result.jobMatches[0]?.compatibilityScore)}
        />
        <ReportMetric
          label="Skill terdeteksi"
          value={String(result.candidateProfile?.skills?.length ?? 0)}
        />
      </div>

      {result.candidateProfile?.summary ? (
        <ReportSection title="Profil kandidat">
          <p className="text-muted-foreground leading-7">
            {result.candidateProfile.summary}
          </p>
        </ReportSection>
      ) : null}

      {result.candidateProfile?.skills?.length ? (
        <ReportSection title="Keahlian kandidat">
          <div className="flex flex-wrap gap-2">
            {result.candidateProfile.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </ReportSection>
      ) : null}

      {result.jobMatches.length > 0 ? (
        <ReportSection title="Rekomendasi pekerjaan">
          <div className="grid gap-3">
            {result.jobMatches.slice(0, 5).map((job, index) => (
              <Card className="bg-background" key={getJobKey(job)}>
                <CardHeader className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <CardDescription>Prioritas {index + 1}</CardDescription>
                      <CardTitle className="mt-1 text-base leading-6">
                        {job.jobTitle}
                      </CardTitle>
                      <p className="mt-1 text-muted-foreground text-sm">
                        {job.company}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {formatScore(job.compatibilityScore)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-4 pt-0">
                  {job.reasoning ? (
                    <p className="text-muted-foreground text-sm leading-6">
                      {job.reasoning}
                    </p>
                  ) : null}
                  <SkillRow label="Skill cocok" skills={job.matchedSkills} />
                  <SkillRow label="Skill gap" skills={job.skillGap} />
                </CardContent>
              </Card>
            ))}
          </div>
        </ReportSection>
      ) : null}

      {result.careerCoaching ? (
        <ReportSection title="Career coaching">
          <SafeMarkdown value={result.careerCoaching} />
        </ReportSection>
      ) : null}

      {fallbackReport && !result.careerCoaching ? (
        <ReportSection title="Output analisis">
          <SafeMarkdown value={fallbackReport} />
        </ReportSection>
      ) : null}

      {pipelineSections.length > 0 ? (
        <ReportSection title="Detail pendukung analisis">
          <div className="grid gap-3">
            {pipelineSections.map((section) => (
              <Card className="bg-background" key={section.title}>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-4 pt-0">
                  {section.items.map((item) => (
                    <DisplayValue
                      key={`${section.title}-${item.label}`}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </ReportSection>
      ) : null}
    </div>
  )
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="bg-background">
      <CardContent className="p-4">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="mt-2 font-medium text-2xl">{value}</p>
      </CardContent>
    </Card>
  )
}

function ReportSection({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-medium text-lg">{title}</h3>
      {children}
    </section>
  )
}

function SkillRow({ label, skills }: { label: string; skills: string[] }) {
  if (skills.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs uppercase tracking-[0.08em]">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill} variant="secondary">
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  )
}

type PipelineItem = {
  label: string
  value: unknown
}

type PipelineSection = {
  title: string
  items: PipelineItem[]
}

function createPipelineSections(value: unknown): PipelineSection[] {
  if (!isRecord(value)) {
    return []
  }

  return Object.entries(value)
    .filter(
      ([key]) =>
        ![
          "analysis_id",
          "analysisId",
          "candidate_profile",
          "candidateProfile",
          "career_coaching",
          "careerCoaching",
          "job_matches",
          "jobMatches",
          "rawResponse",
        ].includes(key)
    )
    .map(([key, nestedValue]) => ({
      title: formatLabel(key),
      items: isRecord(nestedValue)
        ? Object.entries(nestedValue).map(([nestedKey, childValue]) => ({
            label: formatLabel(nestedKey),
            value: childValue,
          }))
        : [{ label: formatLabel(key), value: nestedValue }],
    }))
    .filter((section) =>
      section.items.some((item) => hasReadableValue(item.value))
    )
}

function DisplayValue({ label, value }: PipelineItem) {
  const parsedValue = parseMaybeJson(value)

  if (!hasReadableValue(parsedValue)) {
    return null
  }

  if (Array.isArray(parsedValue)) {
    const primitiveValues = parsedValue.filter(isPrimitiveValue)

    if (primitiveValues.length === parsedValue.length) {
      return (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.08em]">
            {label}
          </p>
          <div className="flex flex-wrap gap-2">
            {primitiveValues.map((item) => (
              <Badge key={String(item)} variant="secondary">
                {formatPrimitive(item)}
              </Badge>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.08em]">
          {label}
        </p>
        <div className="grid gap-2">
          {parsedValue.map((item) => (
            <div
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3"
              key={`${label}-${getValueKey(item)}`}
            >
              {isRecord(item) ? (
                Object.entries(item).map(([itemKey, itemValue]) => (
                  <DisplayValue
                    key={`${label}-${getValueKey(item)}-${itemKey}`}
                    label={formatLabel(itemKey)}
                    value={itemValue}
                  />
                ))
              ) : (
                <p className="text-sm">{formatPrimitive(item)}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isRecord(parsedValue)) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.08em]">
          {label}
        </p>
        <div className="grid gap-2">
          {Object.entries(parsedValue).map(([key, childValue]) => (
            <DisplayValue
              key={`${label}-${key}`}
              label={formatLabel(key)}
              value={childValue}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-1">
      <p className="text-muted-foreground text-xs uppercase tracking-[0.08em]">
        {label}
      </p>
      <p className="text-sm leading-6">{formatPrimitive(parsedValue)}</p>
    </div>
  )
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") {
    return value
  }

  const trimmedValue = value.trim()

  if (!trimmedValue.startsWith("{") && !trimmedValue.startsWith("[")) {
    return value
  }

  try {
    return JSON.parse(trimmedValue)
  } catch {
    return value
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isPrimitiveValue(value: unknown) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
}

function hasReadableValue(value: unknown): boolean {
  const parsedValue = parseMaybeJson(value)

  if (parsedValue === null || parsedValue === undefined) {
    return false
  }

  if (typeof parsedValue === "string") {
    return parsedValue.trim().length > 0
  }

  if (Array.isArray(parsedValue)) {
    return parsedValue.some(hasReadableValue)
  }

  if (isRecord(parsedValue)) {
    return Object.values(parsedValue).some(hasReadableValue)
  }

  return true
}

function formatLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatPrimitive(value: unknown) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value)

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    }
  }

  if (typeof value === "boolean") {
    return value ? "Ya" : "Tidak"
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }

  return String(value)
}

function getJobKey(job: { company: string; jobId?: string; jobTitle: string }) {
  return job.jobId ?? `${job.company}-${job.jobTitle}`
}

function getValueKey(value: unknown) {
  if (isRecord(value)) {
    const idValue =
      value.id ??
      value.rank ??
      value.title ??
      value.question ??
      value.company ??
      value.job_title ??
      value.jobTitle

    if (isPrimitiveValue(idValue)) {
      return String(idValue)
    }
  }

  if (isPrimitiveValue(value)) {
    return String(value)
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
