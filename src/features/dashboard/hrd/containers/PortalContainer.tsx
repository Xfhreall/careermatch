import { useForm } from "@tanstack/react-form"
import {
  DownloadIcon,
  PlusIcon,
  RefreshCwIcon,
  SaveIcon,
  TargetIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react"
import * as React from "react"
import { toast } from "sonner"
import {
  useCreateHrdJobMutation,
  useHrdDashboardQuery,
  useRefreshHrdEmbeddingsMutation,
} from "@/features/dashboard/hrd/hooks/use-hrd-dashboard"
import {
  type HrdJobStatus,
  parseSkills,
} from "@/features/dashboard/hrd/lib/job-utils"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/shadcn/ui/field"
import { Input } from "@/shared/components/shadcn/ui/input"
import { Progress } from "@/shared/components/shadcn/ui/progress"

export function HrdPortalContainer() {
  const [createOpen, setCreateOpen] = React.useState(false)
  const dashboardQuery = useHrdDashboardQuery()
  const createJobMutation = useCreateHrdJobMutation({
    onSuccess: () => {
      setCreateOpen(false)
    },
  })
  const refreshMutation = useRefreshHrdEmbeddingsMutation()
  const jobs = dashboardQuery.data?.jobs ?? []
  const anonymousCandidates = dashboardQuery.data?.anonymousCandidates ?? []
  const activeJobs = jobs.filter((job) => job.status === "Active")
  const topCandidate = anonymousCandidates[0]
  const averageScore =
    anonymousCandidates.length > 0
      ? Math.round(
          anonymousCandidates.reduce(
            (total, candidate) => total + candidate.scoreValue,
            0
          ) / anonymousCandidates.length
        )
      : 0
  const matchedRoleCount = new Set(
    anonymousCandidates.map((candidate) => candidate.jobId)
  ).size
  const candidatesByJob = new Map<string, typeof anonymousCandidates>()

  for (const candidate of anonymousCandidates) {
    const current = candidatesByJob.get(candidate.jobId)

    if (current) {
      current.push(candidate)
    } else {
      candidatesByJob.set(candidate.jobId, [candidate])
    }
  }
  const createForm = useForm({
    defaultValues: {
      description: "",
      minYears: "0",
      skills: "",
      status: "active" as HrdJobStatus,
      title: "",
    },
    onSubmit: async ({ value }) => {
      const normalizedTitle = value.title.trim()
      const normalizedMinYears = Number(value.minYears)

      if (!normalizedTitle) {
        toast.info("Judul lowongan wajib diisi.")
        return
      }

      if (!Number.isFinite(normalizedMinYears) || normalizedMinYears < 0) {
        toast.info("Minimum pengalaman tidak valid.")
        return
      }

      createJobMutation.mutate({
        description: value.description.trim(),
        minYears: Math.round(normalizedMinYears),
        skills: parseSkills(value.skills),
        status: value.status,
        title: normalizedTitle,
      })
    },
  })

  function handleNewJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void createForm.handleSubmit()
  }

  function handleCreateOpenChange(open: boolean) {
    setCreateOpen(open)

    if (!open) {
      createForm.reset()
    }
  }

  function handleRefreshEmbeddings() {
    refreshMutation.mutate()
  }

  function handleExportCandidates() {
    const report = {
      exportedAt: new Date().toISOString(),
      candidates: anonymousCandidates,
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "careermatch-matched-candidates.json"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-3 border-border border-b p-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Job postings</p>
            <h2 className="font-medium text-3xl">Open roles</h2>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon aria-hidden="true" data-icon="inline-start" />
            New job
          </Button>
        </div>
        <div className="grid gap-0 border-border border-b sm:grid-cols-3">
          <div className="border-border border-b p-5 sm:border-r sm:border-b-0">
            <p className="text-muted-foreground text-sm">Matched candidates</p>
            <p className="mt-2 font-medium text-3xl">
              {anonymousCandidates.length}
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              {formatCandidateLabel(anonymousCandidates.length)}
            </p>
          </div>
          <div className="border-border border-b p-5 sm:border-r sm:border-b-0">
            <p className="text-muted-foreground text-sm">Average score</p>
            <p className="mt-2 font-medium text-3xl">{averageScore}%</p>
            <Progress className="mt-3" value={averageScore} />
          </div>
          <div className="p-5">
            <p className="text-muted-foreground text-sm">Matched roles</p>
            <p className="mt-2 font-medium text-3xl">
              {matchedRoleCount}/{activeJobs.length}
            </p>
            <p className="mt-1 text-muted-foreground text-xs">
              active roles with at least one candidate
            </p>
          </div>
        </div>
        <div className="divide-y divide-border">
          {jobs.length > 0 ? (
            jobs.map((job) => {
              const jobCandidates = candidatesByJob.get(job.id) ?? []
              const jobTopCandidate = jobCandidates[0]

              return (
                <div
                  className="grid gap-4 p-5 md:grid-cols-[1fr_auto]"
                  key={job.id}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-xl">{job.title}</h3>
                      <Badge variant="outline">{job.company}</Badge>
                      <Badge className="bg-accent text-accent-foreground">
                        {job.embedding}
                      </Badge>
                      <Badge variant="secondary">{job.status}</Badge>
                      {jobTopCandidate ? (
                        <Badge variant="outline">
                          Top match {jobTopCandidate.score}
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-3 text-muted-foreground text-sm">
                      Minimum experience: {job.minYears} tahun
                    </p>
                    {jobTopCandidate ? (
                      <div className="mt-4 max-w-xl">
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="text-muted-foreground">
                            Best candidate: {jobTopCandidate.name}
                          </span>
                          <span className="font-medium">
                            {jobTopCandidate.score}
                          </span>
                        </div>
                        <Progress value={jobTopCandidate.scoreValue} />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3 md:justify-end">
                    <UsersIcon aria-hidden="true" className="size-4" />
                    <span className="font-medium">{job.candidates}</span>
                    <span className="text-muted-foreground text-sm">
                      candidates
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="p-5 text-muted-foreground text-sm">
              Belum ada lowongan untuk role ini.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 border-border border-t p-5 sm:flex-row">
          <Button
            disabled={refreshMutation.isPending}
            onClick={handleRefreshEmbeddings}
            variant="outline"
          >
            <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
            Refresh embeddings
          </Button>
          <Button onClick={handleExportCandidates} variant="outline">
            <DownloadIcon aria-hidden="true" data-icon="inline-start" />
            Export candidates
          </Button>
        </div>
        {dashboardQuery.error ? (
          <p className="border-border border-t p-5 text-destructive text-sm">
            {dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : "Dashboard HRD belum bisa dimuat."}
          </p>
        ) : null}
      </div>

      <aside className="rounded-lg border border-border bg-card">
        <div className="border-border border-b p-6">
          <p className="text-muted-foreground text-sm">Matched candidates</p>
          <h2 className="font-medium text-3xl">Candidate ranking</h2>
          {topCandidate ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="bg-primary text-primary-foreground">
                <TrophyIcon aria-hidden="true" className="size-3.5" />
                Top match {topCandidate.score}
              </Badge>
              <Badge variant="outline">
                <TargetIcon aria-hidden="true" className="size-3.5" />
                {topCandidate.role}
              </Badge>
            </div>
          ) : null}
        </div>
        <div className="divide-y divide-border">
          {anonymousCandidates.length > 0 ? (
            anonymousCandidates.map((candidate) => (
              <div
                className="p-5"
                key={`${candidate.candidate}-${candidate.role}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {candidate.name || candidate.candidate}
                    </p>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {candidate.email}
                    </p>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {candidate.role}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {candidate.matchedSkills.length > 0 ? (
                        candidate.matchedSkills.map((skill) => (
                          <Badge
                            className="text-xs"
                            key={`${candidate.candidate}-${skill}`}
                            variant="secondary"
                          >
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          No matched skills listed
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">
                    {candidate.score}
                  </Badge>
                </div>
                <Progress className="mt-4" value={candidate.scoreValue} />
              </div>
            ))
          ) : (
            <p className="p-5 text-muted-foreground text-sm">
              Kandidat akan muncul setelah CV dianalisis terhadap lowongan Anda.
            </p>
          )}
        </div>
      </aside>
      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Buat lowongan</DialogTitle>
            <DialogDescription>
              Data tersimpan ke Supabase dan langsung muncul di dashboard HRD.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleNewJob}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-job-title">Posisi</FieldLabel>
                <createForm.Field name="title">
                  {(field) => (
                    <Input
                      id="new-job-title"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      value={field.state.value}
                    />
                  )}
                </createForm.Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="new-job-description">Deskripsi</FieldLabel>
                <createForm.Field name="description">
                  {(field) => (
                    <textarea
                      className="min-h-24 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                      id="new-job-description"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      value={field.state.value}
                    />
                  )}
                </createForm.Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="new-job-skills">Keahlian</FieldLabel>
                <createForm.Field name="skills">
                  {(field) => (
                    <Input
                      id="new-job-skills"
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      value={field.state.value}
                    />
                  )}
                </createForm.Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="new-job-min-years">
                  Minimum pengalaman
                </FieldLabel>
                <createForm.Field name="minYears">
                  {(field) => (
                    <Input
                      id="new-job-min-years"
                      min={0}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      type="number"
                      value={field.state.value}
                    />
                  )}
                </createForm.Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="new-job-status">Status</FieldLabel>
                <createForm.Field name="status">
                  {(field) => (
                    <select
                      className="h-10 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                      id="new-job-status"
                      onChange={(event) =>
                        field.handleChange(event.target.value as HrdJobStatus)
                      }
                      value={field.state.value}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="closed">Closed</option>
                    </select>
                  )}
                </createForm.Field>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                disabled={createJobMutation.isPending}
                onClick={() => handleCreateOpenChange(false)}
                type="button"
                variant="outline"
              >
                Batal
              </Button>
              <Button disabled={createJobMutation.isPending} type="submit">
                <SaveIcon aria-hidden="true" data-icon="inline-start" />
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function formatCandidateLabel(count: number) {
  return count === 1 ? "1 kandidat cocok" : `${count} kandidat cocok`
}
