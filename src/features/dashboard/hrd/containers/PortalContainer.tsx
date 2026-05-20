import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  DownloadIcon,
  PlusIcon,
  RefreshCwIcon,
  SaveIcon,
  UsersIcon,
} from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import {
  createHrdJob,
  fetchHrdDashboard,
  refreshHrdEmbeddings,
} from "@/features/platform/api-client"
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

type HrdJobStatus = "active" | "closed" | "draft"

function parseSkills(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
}

export function HrdPortalContainer() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [skills, setSkills] = React.useState("")
  const [minYears, setMinYears] = React.useState("0")
  const [status, setStatus] = React.useState<HrdJobStatus>("active")
  const dashboardQuery = useQuery({
    queryFn: fetchHrdDashboard,
    queryKey: ["hrd-dashboard"],
  })
  const createJobMutation = useMutation({
    mutationFn: createHrdJob,
    onSuccess: (payload) => {
      queryClient.setQueryData(["hrd-dashboard"], payload)
      setCreateOpen(false)
      setTitle("")
      setDescription("")
      setSkills("")
      setMinYears("0")
      setStatus("active")
      toast.success("Lowongan berhasil dibuat.")
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Lowongan gagal dibuat."
      )
    },
  })
  const refreshMutation = useMutation({
    mutationFn: refreshHrdEmbeddings,
    onSuccess: (payload) => {
      queryClient.setQueryData(["hrd-dashboard"], payload)
    },
  })
  const jobs = dashboardQuery.data?.jobs ?? []
  const anonymousCandidates = dashboardQuery.data?.anonymousCandidates ?? []

  function handleNewJob(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedTitle = title.trim()
    const normalizedMinYears = Number(minYears)

    if (!normalizedTitle) {
      toast.info("Judul lowongan wajib diisi.")
      return
    }

    if (!Number.isFinite(normalizedMinYears) || normalizedMinYears < 0) {
      toast.info("Minimum pengalaman tidak valid.")
      return
    }

    createJobMutation.mutate({
      description: description.trim(),
      minYears: Math.round(normalizedMinYears),
      skills: parseSkills(skills),
      status,
      title: normalizedTitle,
    })
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
    anchor.download = "careermatch-anonymous-candidates.json"
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
        <div className="divide-y divide-border">
          {jobs.length > 0 ? (
            jobs.map((job) => (
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
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  <UsersIcon aria-hidden="true" className="size-4" />
                  <span className="font-medium">{job.candidates}</span>
                  <span className="text-muted-foreground text-sm">
                    candidates
                  </span>
                </div>
              </div>
            ))
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
          <p className="text-muted-foreground text-sm">Anonymous matches</p>
          <h2 className="font-medium text-3xl">Candidate ranking</h2>
        </div>
        <div className="divide-y divide-border">
          {anonymousCandidates.length > 0 ? (
            anonymousCandidates.map((candidate) => (
              <div className="p-5" key={candidate.candidate}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{candidate.candidate}</p>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {candidate.role}
                    </p>
                    <p className="mt-2 text-muted-foreground text-xs">
                      Matched skills: {candidate.skills}
                    </p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">
                    {candidate.score}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="p-5 text-muted-foreground text-sm">
              Kandidat akan muncul setelah CV dianalisis terhadap lowongan Anda.
            </p>
          )}
        </div>
      </aside>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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
                <Input
                  id="new-job-title"
                  onChange={(event) => setTitle(event.target.value)}
                  value={title}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-job-description">Deskripsi</FieldLabel>
                <textarea
                  className="min-h-24 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  id="new-job-description"
                  onChange={(event) => setDescription(event.target.value)}
                  value={description}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-job-skills">Keahlian</FieldLabel>
                <Input
                  id="new-job-skills"
                  onChange={(event) => setSkills(event.target.value)}
                  value={skills}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-job-min-years">
                  Minimum pengalaman
                </FieldLabel>
                <Input
                  id="new-job-min-years"
                  min={0}
                  onChange={(event) => setMinYears(event.target.value)}
                  type="number"
                  value={minYears}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="new-job-status">Status</FieldLabel>
                <select
                  className="h-10 rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                  id="new-job-status"
                  onChange={(event) =>
                    setStatus(event.target.value as HrdJobStatus)
                  }
                  value={status}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button
                disabled={createJobMutation.isPending}
                onClick={() => setCreateOpen(false)}
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
