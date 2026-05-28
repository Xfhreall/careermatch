import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeftIcon,
  BrainCircuitIcon,
  BriefcaseBusinessIcon,
  CheckCircle2Icon,
  DownloadIcon,
  FileTextIcon,
  GaugeIcon,
  LightbulbIcon,
  ListChecksIcon,
  RotateCcwIcon,
  SparklesIcon,
  TargetIcon,
  UserRoundIcon,
} from "lucide-react";
import type * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/shadcn/ui/accordion";
import { Alert, AlertDescription } from "@/shared/components/shadcn/ui/alert";
import { Badge } from "@/shared/components/shadcn/ui/badge";
import { Button } from "@/shared/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadcn/ui/card";
import { Progress } from "@/shared/components/shadcn/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/shadcn/ui/tabs";

import { trackCareerMatchEvent } from "../analytics";
import type { JobMatch, NormalizedAnalysisResponse } from "../types";
import { JobMatchesTable } from "./JobMatchesTable";
import { SafeMarkdown } from "./SafeMarkdown";

type AnalysisResultViewProps = {
  result: NormalizedAnalysisResponse;
  onReset: () => void;
};

const CAREER_ANALYSIS_KEYS = [
  "career_analysis",
  "careerAnalysis",
  "cv_analysis",
  "cvAnalysis",
  "analysis",
  "candidate_analysis",
  "candidateAnalysis",
  "recommendation_analysis",
  "recommendationAnalysis",
] as const;

const CHATBOT_RESPONSE_KEYS = [
  "chatbot_response",
  "chatbotResponse",
  "chat_response",
  "chatResponse",
  "assistant_response",
  "assistantResponse",
  "llm_response",
  "llmResponse",
  "response",
  "message",
] as const;

export function AnalysisResultView({
  result,
  onReset,
}: AnalysisResultViewProps) {
  const shouldReduceMotion = useReducedMotion();
  const parsedResponse = parseMaybeJson(result.rawResponse);
  const careerAnalysis = findFirstReadableByKeys(
    parsedResponse,
    CAREER_ANALYSIS_KEYS,
  );
  const chatbotResponse = findFirstReadableByKeys(
    parsedResponse,
    CHATBOT_RESPONSE_KEYS,
  );
  const topMatch = result.jobMatches[0];
  const candidateSkills = result.candidateProfile?.skills ?? [];
  const fallbackReport =
    typeof parsedResponse === "string" ? parsedResponse : "";
  const chatbotValue = getDistinctReadableValue(
    chatbotResponse,
    result.careerCoaching,
  );
  const transition = {
    duration: shouldReduceMotion ? 0 : 0.34,
    ease: [0.16, 1, 0.3, 1],
  } as const;
  const overviewMetrics = [
    {
      icon: BriefcaseBusinessIcon,
      label: "Total rekomendasi",
      value: String(result.jobMatches.length),
      helper: "Job match terstruktur",
    },
    {
      icon: GaugeIcon,
      label: "Top match",
      value: formatScore(topMatch?.compatibilityScore),
      helper: topMatch?.jobTitle ?? "Belum tersedia",
    },
    {
      icon: ListChecksIcon,
      label: "Skill terdeteksi",
      value: String(candidateSkills.length),
      helper: "Dari profil kandidat",
    },
  ];

  function handleReset() {
    trackCareerMatchEvent("analysis_reset", {
      analysis_id: result.analysisId,
      previous_job_match_count: result.jobMatches.length,
    });
    onReset();
  }

  function handleTabOpened(tab: string) {
    trackCareerMatchEvent("tab_opened", {
      analysis_id: result.analysisId,
      tab,
    });
  }

  function handlePrintReport() {
    trackCareerMatchEvent("report_exported", {
      analysis_id: result.analysisId,
      export_type: "browser_pdf",
    });
    window.print();
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-8"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      transition={transition}
    >
      <Card className="border-border border-b pb-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end p-4">
          <div className="flex max-w-4xl flex-col gap-4">
            <Badge className="w-fit bg-card" variant="outline">
              Analysis ID: {result.analysisId}
            </Badge>
            <div className="flex flex-col gap-3">
              <h1 className="font-semibold text-4xl text-editorial leading-tight sm:text-5xl lg:text-6xl">
                Hasil analisis CV
              </h1>
              <p className="max-w-2xl text-muted-foreground leading-8">
                Laporan lengkap CareerMatch dengan career analysis, job match,
                skill gap, dan response chatbot dalam format yang bisa dibaca.
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
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {overviewMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <CandidateProfileCard skills={candidateSkills} result={result} />
        {topMatch ? (
          <TopMatchCard job={topMatch} />
        ) : (
          <Alert className="bg-card">
            <BriefcaseBusinessIcon aria-hidden="true" />
            <AlertDescription>
              Data job match terstruktur tidak ditemukan. Laporan lengkap tetap
              tersedia di tab Career Analysis, Chatbot Response, dan Full
              Report.
            </AlertDescription>
          </Alert>
        )}
      </section>

      <Tabs defaultValue="overview" onValueChange={handleTabOpened}>
        <TabsList className="w-full justify-start sm:w-fit h-full py-1.5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Job Matches</TabsTrigger>
          <TabsTrigger value="career">Career Analysis</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot Response</TabsTrigger>
          <TabsTrigger value="report">Full Report</TabsTrigger>
        </TabsList>

        <AnimatedTabsContent
          transition={transition}
          shouldReduceMotion={shouldReduceMotion}
          value="overview"
        >
          <OverviewReport result={result} />
        </AnimatedTabsContent>

        <AnimatedTabsContent
          transition={transition}
          shouldReduceMotion={shouldReduceMotion}
          value="jobs"
        >
          <JobMatchesReport jobs={result.jobMatches} />
        </AnimatedTabsContent>

        <AnimatedTabsContent
          transition={transition}
          shouldReduceMotion={shouldReduceMotion}
          value="career"
        >
          <CareerAnalysisReport
            careerAnalysis={careerAnalysis}
            fallbackReport={fallbackReport}
            result={result}
          />
        </AnimatedTabsContent>

        <AnimatedTabsContent
          transition={transition}
          shouldReduceMotion={shouldReduceMotion}
          value="chatbot"
        >
          <ChatbotResponseReport
            chatbotValue={chatbotValue}
            careerCoaching={result.careerCoaching}
            fallbackReport={fallbackReport}
          />
        </AnimatedTabsContent>

        <AnimatedTabsContent
          transition={transition}
          shouldReduceMotion={shouldReduceMotion}
          value="report"
        >
          <FullReport result={result} parsedResponse={parsedResponse} />
        </AnimatedTabsContent>
      </Tabs>

      <Button className="w-fit" onClick={handleReset} variant="ghost">
        <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
        Kembali ke upload
      </Button>
    </motion.div>
  );
}

function AnimatedTabsContent({
  children,
  shouldReduceMotion,
  transition,
  value,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
  transition: {
    duration: number;
    ease: readonly [number, number, number, number];
  };
  value: string;
}) {
  return (
    <TabsContent value={value}>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        transition={transition}
      >
        {children}
      </motion.div>
    </TabsContent>
  );
}

function MetricCard({
  helper,
  icon: Icon,
  label,
  value,
}: {
  helper: string;
  icon: React.ComponentType<{ "aria-hidden": true; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader>
        <Icon aria-hidden={true} className="size-5 text-accent-foreground" />
        <CardDescription>{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-medium text-3xl">{value}</p>
        <p className="mt-2 text-muted-foreground text-sm">{helper}</p>
      </CardContent>
    </Card>
  );
}

function CandidateProfileCard({
  result,
  skills,
}: {
  result: NormalizedAnalysisResponse;
  skills: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardDescription>Profil kandidat</CardDescription>
            <CardTitle className="mt-1 text-2xl leading-8">
              {result.candidateProfile?.summary ??
                "Profil kandidat tersedia pada laporan lengkap."}
            </CardTitle>
          </div>
          <UserRoundIcon
            aria-hidden="true"
            className="size-5 shrink-0 text-accent-foreground"
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {typeof result.candidateProfile?.totalExperienceYears === "number" ? (
          <Badge className="w-fit" variant="outline">
            {result.candidateProfile.totalExperienceYears} tahun pengalaman
          </Badge>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.slice(0, 14).map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))
          ) : (
            <Badge variant="outline">Skills tersedia di full report</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TopMatchCard({ job }: { job: JobMatch }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardDescription>Rekomendasi teratas</CardDescription>
            <CardTitle className="mt-1 text-2xl leading-8">
              {job.jobTitle}
            </CardTitle>
            <p className="mt-2 text-muted-foreground text-sm">{job.company}</p>
          </div>
          <Badge>{formatScore(job.compatibilityScore)}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          <ScorePanel label="Kompatibilitas" value={job.compatibilityScore} />
          <ScorePanel label="Skill match" value={job.skillMatchScore} />
          <ScorePanel label="Pengalaman" value={job.experienceMatchScore} />
        </div>
      </CardContent>
      {job.reasoning ? (
        <CardFooter>
          <p className="text-muted-foreground text-sm leading-6">
            {job.reasoning}
          </p>
        </CardFooter>
      ) : null}
    </Card>
  );
}

function ScorePanel({ label, value }: { label: string; value?: number }) {
  const normalizedValue = value ?? 0;

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{label}</p>
        <CheckCircle2Icon
          aria-hidden="true"
          className="size-4 text-accent-foreground"
        />
      </div>
      <p className="mt-3 font-medium text-2xl">{formatScore(value)}</p>
      <Progress className="mt-4" value={normalizedValue} />
    </div>
  );
}

function OverviewReport({ result }: { result: NormalizedAnalysisResponse }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardDescription>Pipeline summary</CardDescription>
          <CardTitle className="text-xl">Ringkasan hasil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SummaryRow
            icon={TargetIcon}
            label="Top role"
            value={result.jobMatches[0]?.jobTitle ?? "Belum tersedia"}
          />
          <SummaryRow
            icon={BriefcaseBusinessIcon}
            label="Top company"
            value={result.jobMatches[0]?.company ?? "Belum tersedia"}
          />
          <SummaryRow
            icon={SparklesIcon}
            label="Career coaching"
            value={
              result.careerCoaching
                ? "Response tersedia"
                : "Belum ada response coaching"
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Actionable insight</CardDescription>
          <CardTitle className="text-xl">Prioritas pengembangan</CardTitle>
        </CardHeader>
        <CardContent>
          {result.jobMatches[0]?.skillGap.length ? (
            <div className="flex flex-wrap gap-2">
              {result.jobMatches[0].skillGap.slice(0, 12).map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm leading-6">
              Skill gap tidak ditemukan pada job match teratas. Buka full report
              untuk melihat detail mentah dari model.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ "aria-hidden": true; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
      <Icon
        aria-hidden={true}
        className="mt-0.5 size-4 text-accent-foreground"
      />
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs uppercase tracking-[0.08em]">
          {label}
        </p>
        <p className="mt-1 break-words text-sm">{value}</p>
      </div>
    </div>
  );
}

function JobMatchesReport({ jobs }: { jobs: JobMatch[] }) {
  if (jobs.length === 0) {
    return (
      <Alert className="bg-card">
        <BriefcaseBusinessIcon aria-hidden="true" />
        <AlertDescription>
          Belum ada job match terstruktur. Detail lain tetap tersedia pada full
          report.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardDescription>Ranked matches</CardDescription>
              <CardTitle className="text-xl">Lowongan paling cocok</CardTitle>
            </div>
            <Badge variant="outline">{jobs.length} matches</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <JobMatchesTable jobs={jobs} />
        </CardContent>
      </Card>

      <Accordion defaultValue={[getJobKey(jobs[0])]} multiple>
        {jobs.slice(0, 8).map((job, index) => (
          <AccordionItem key={getJobKey(job)} value={getJobKey(job)}>
            <AccordionTrigger>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate">
                  {index + 1}. {job.jobTitle}
                </span>
                <span className="text-muted-foreground text-xs">
                  {job.company} - {formatScore(job.compatibilityScore)}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-4">
                {job.reasoning ? (
                  <p className="text-muted-foreground leading-6">
                    {job.reasoning}
                  </p>
                ) : null}
                <SkillRow label="Skill cocok" skills={job.matchedSkills} />
                <SkillRow label="Skill gap" skills={job.skillGap} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <ScorePanel
                    label="Kompatibilitas"
                    value={job.compatibilityScore}
                  />
                  <ScorePanel label="Skill match" value={job.skillMatchScore} />
                  <ScorePanel
                    label="Pengalaman"
                    value={job.experienceMatchScore}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}

function CareerAnalysisReport({
  careerAnalysis,
  fallbackReport,
  result,
}: {
  careerAnalysis: unknown;
  fallbackReport: string;
  result: NormalizedAnalysisResponse;
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <BrainCircuitIcon
            aria-hidden="true"
            className="size-5 text-accent-foreground"
          />
          <CardDescription>Career analysis</CardDescription>
          <CardTitle className="text-xl">Analisis karier lengkap</CardTitle>
        </CardHeader>
        <CardContent>
          {hasReadableValue(careerAnalysis) ? (
            <ReadableContent value={careerAnalysis} />
          ) : fallbackReport ? (
            <SafeMarkdown value={fallbackReport} />
          ) : (
            <p className="text-muted-foreground text-sm leading-6">
              Career analysis tidak ditemukan sebagai field terpisah. Ringkasan
              profil dan job match tetap ditampilkan dari data terstruktur.
            </p>
          )}
        </CardContent>
      </Card>

      <Accordion defaultValue={["profile", "jobs"]} multiple>
        <AccordionItem value="profile">
          <AccordionTrigger>Profil kandidat dan skill</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              <p className="text-muted-foreground leading-6">
                {result.candidateProfile?.summary ??
                  "Ringkasan kandidat tidak tersedia."}
              </p>
              <SkillRow
                label="Keahlian kandidat"
                skills={result.candidateProfile?.skills ?? []}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="jobs">
          <AccordionTrigger>Rekomendasi pekerjaan dan gap</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-4">
              {result.jobMatches.slice(0, 5).map((job) => (
                <div
                  className="rounded-lg border border-border bg-background p-4"
                  key={getJobKey(job)}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium">{job.jobTitle}</p>
                      <p className="text-muted-foreground text-sm">
                        {job.company}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {formatScore(job.compatibilityScore)}
                    </Badge>
                  </div>
                  {job.reasoning ? (
                    <p className="mt-3 text-muted-foreground text-sm leading-6">
                      {job.reasoning}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

function ChatbotResponseReport({
  careerCoaching,
  chatbotValue,
  fallbackReport,
}: {
  careerCoaching: string;
  chatbotValue: unknown;
  fallbackReport: string;
}) {
  const hasCoaching = careerCoaching.trim().length > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <LightbulbIcon
            aria-hidden="true"
            className="size-5 text-accent-foreground"
          />
          <CardDescription>Chatbot response</CardDescription>
          <CardTitle className="text-xl">Response dan coaching</CardTitle>
        </CardHeader>
        <CardContent>
          {hasCoaching ? (
            <SafeMarkdown value={careerCoaching} />
          ) : hasReadableValue(chatbotValue) ? (
            <ReadableContent value={chatbotValue} />
          ) : fallbackReport ? (
            <SafeMarkdown value={fallbackReport} />
          ) : (
            <p className="text-muted-foreground text-sm leading-6">
              Response chatbot tidak tersedia pada hasil analisis ini.
            </p>
          )}
        </CardContent>
      </Card>

      {hasReadableValue(chatbotValue) && hasCoaching ? (
        <Card>
          <CardHeader>
            <CardDescription>Raw chatbot field</CardDescription>
            <CardTitle className="text-xl">Response tambahan</CardTitle>
          </CardHeader>
          <CardContent>
            <ReadableContent value={chatbotValue} />
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}

function FullReport({
  parsedResponse,
  result,
}: {
  parsedResponse: unknown;
  result: NormalizedAnalysisResponse;
}) {
  const sections = createFullReportSections(parsedResponse);

  return (
    <>
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

      {sections.length > 0 ? (
        <Accordion
          defaultValue={sections.slice(0, 2).map((item) => item.id)}
          multiple
        >
          {sections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger>
                <span className="flex min-w-0 items-center gap-3">
                  <FileTextIcon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-accent-foreground"
                  />
                  <span className="truncate">{section.title}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ReadableContent value={section.value} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Alert className="bg-card">
          <FileTextIcon aria-hidden="true" />
          <AlertDescription>
            Full report belum memiliki konten yang bisa ditampilkan.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="mt-2 font-medium text-2xl">{value}</p>
      </CardContent>
    </Card>
  );
}

function ReadableContent({ value }: { value: unknown }) {
  const parsedValue = parseMaybeJson(value);

  if (!hasReadableValue(parsedValue)) {
    return (
      <p className="text-muted-foreground text-sm">
        Belum ada konten yang tersedia.
      </p>
    );
  }

  if (typeof parsedValue === "string") {
    return <SafeMarkdown value={parsedValue} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <DisplayValue label="Detail" value={parsedValue} />
    </div>
  );
}

function SkillRow({ label, skills }: { label: string; skills: string[] }) {
  if (skills.length === 0) {
    return null;
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
  );
}

type ReportSection = {
  id: string;
  title: string;
  value: unknown;
};

type PipelineItem = {
  label: string;
  value: unknown;
};

function createFullReportSections(value: unknown): ReportSection[] {
  const parsedValue = parseMaybeJson(value);

  if (!hasReadableValue(parsedValue)) {
    return [];
  }

  if (isRecord(parsedValue)) {
    return Object.entries(parsedValue)
      .filter(([, entryValue]) => hasReadableValue(entryValue))
      .map(([key, entryValue]) => ({
        id: key,
        title: formatLabel(key),
        value: entryValue,
      }));
  }

  if (Array.isArray(parsedValue)) {
    return parsedValue.filter(hasReadableValue).map((entryValue, index) => ({
      id: `item-${index}`,
      title: `Item ${index + 1}`,
      value: entryValue,
    }));
  }

  return [
    {
      id: "output",
      title: "Output Analisis",
      value: parsedValue,
    },
  ];
}

function DisplayValue({ label, value }: PipelineItem) {
  const parsedValue = parseMaybeJson(value);

  if (!hasReadableValue(parsedValue)) {
    return null;
  }

  if (Array.isArray(parsedValue)) {
    const primitiveValues = parsedValue.filter(isPrimitiveValue);

    if (primitiveValues.length === parsedValue.length) {
      return (
        <div className="flex flex-col gap-2">
          <ValueLabel>{label}</ValueLabel>
          <div className="flex flex-wrap gap-2">
            {primitiveValues.map((item) => (
              <Badge key={String(item)} variant="secondary">
                {formatPrimitive(item)}
              </Badge>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <ValueLabel>{label}</ValueLabel>
        {parsedValue.map((item) => (
          <div
            className="rounded-lg border border-border bg-background p-4"
            key={`${label}-${getValueKey(item)}`}
          >
            {isRecord(item) ? (
              <div className="flex flex-col gap-3">
                {Object.entries(item).map(([itemKey, itemValue]) => (
                  <DisplayValue
                    key={`${label}-${getValueKey(item)}-${itemKey}`}
                    label={formatLabel(itemKey)}
                    value={itemValue}
                  />
                ))}
              </div>
            ) : (
              <PrimitiveValue value={item} />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (isRecord(parsedValue)) {
    return (
      <div className="flex flex-col gap-3">
        <ValueLabel>{label}</ValueLabel>
        {Object.entries(parsedValue).map(([key, childValue]) => (
          <DisplayValue
            key={`${label}-${key}`}
            label={formatLabel(key)}
            value={childValue}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-1">
      <ValueLabel>{label}</ValueLabel>
      <PrimitiveValue value={parsedValue} />
    </div>
  );
}

function ValueLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-xs uppercase tracking-[0.08em]">
      {children}
    </p>
  );
}

function PrimitiveValue({ value }: { value: unknown }) {
  if (typeof value === "string" && looksLikeMarkdown(value)) {
    return <SafeMarkdown value={value} />;
  }

  return (
    <p className="break-words text-sm leading-6">{formatPrimitive(value)}</p>
  );
}

function formatScore(value: number | undefined) {
  if (value === undefined) {
    return "-";
  }

  return `${Math.round(value)}%`;
}

function findFirstReadableByKeys(
  value: unknown,
  keys: readonly string[],
  depth = 0,
): unknown {
  if (depth > 6) {
    return undefined;
  }

  const parsedValue = parseMaybeJson(value);

  if (Array.isArray(parsedValue)) {
    for (const item of parsedValue) {
      const nestedValue = findFirstReadableByKeys(item, keys, depth + 1);

      if (hasReadableValue(nestedValue)) {
        return nestedValue;
      }
    }
  }

  if (!isRecord(parsedValue)) {
    return undefined;
  }

  for (const key of keys) {
    if (hasReadableValue(parsedValue[key])) {
      return parsedValue[key];
    }
  }

  for (const child of Object.values(parsedValue)) {
    const nestedValue = findFirstReadableByKeys(child, keys, depth + 1);

    if (hasReadableValue(nestedValue)) {
      return nestedValue;
    }
  }

  return undefined;
}

function getDistinctReadableValue(value: unknown, compareTo: string) {
  if (!hasReadableValue(value)) {
    return undefined;
  }

  if (
    typeof value === "string" &&
    compareTo.trim() &&
    normalizeText(value) === normalizeText(compareTo)
  ) {
    return undefined;
  }

  return value;
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function looksLikeMarkdown(value: string) {
  return /(^#{1,4}\s|\n#{1,4}\s|^\d+\.\s|^[-*]\s|\n[-*]\s|`|\*\*)/.test(value);
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue.startsWith("{") && !trimmedValue.startsWith("[")) {
    return value;
  }

  try {
    return JSON.parse(trimmedValue);
  } catch {
    return value;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrimitiveValue(value: unknown) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function hasReadableValue(value: unknown): boolean {
  const parsedValue = parseMaybeJson(value);

  if (parsedValue === null || parsedValue === undefined) {
    return false;
  }

  if (typeof parsedValue === "string") {
    return parsedValue.trim().length > 0;
  }

  if (Array.isArray(parsedValue)) {
    return parsedValue.some(hasReadableValue);
  }

  if (isRecord(parsedValue)) {
    return Object.values(parsedValue).some(hasReadableValue);
  }

  return true;
}

function formatLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPrimitive(value: unknown) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    }
  }

  if (typeof value === "boolean") {
    return value ? "Ya" : "Tidak";
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  return String(value);
}

function getJobKey(job: { company: string; jobId?: string; jobTitle: string }) {
  return job.jobId ?? `${job.company}-${job.jobTitle}`;
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
      value.jobTitle;

    if (isPrimitiveValue(idValue)) {
      return String(idValue);
    }
  }

  if (isPrimitiveValue(value)) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
