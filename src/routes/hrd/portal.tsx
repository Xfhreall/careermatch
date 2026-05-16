import { createFileRoute } from "@tanstack/react-router"
import { PlusIcon, RefreshCwIcon, UsersIcon } from "lucide-react"

import { PlatformHeader } from "@/features/platform/components/PlatformHeader"
import { anonymousCandidates, hrdJobs } from "@/features/platform/data"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"

export const Route = createFileRoute("/hrd/portal")({
  component: HrdPortalPage,
})

function HrdPortalPage() {
  return (
    <main className="paper-grid min-h-dvh bg-background">
      <PlatformHeader
        description="Phase 3 scaffold: HRD approval state, job posting workspace, embedding refresh state, and anonymous candidate matching."
        eyebrow="Phase 3 - HRD Portal"
        title="Recruiter workspace"
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-3 border-border border-b p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Job postings</p>
              <h2 className="font-medium text-3xl">Open roles</h2>
            </div>
            <Button disabled>
              <PlusIcon aria-hidden="true" data-icon="inline-start" />
              New job
            </Button>
          </div>
          <div className="divide-y divide-border">
            {hrdJobs.map((job) => (
              <div
                className="grid gap-4 p-5 md:grid-cols-[1fr_auto]"
                key={job.title}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-xl">{job.title}</h3>
                    <Badge variant="outline">{job.embedding}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  <UsersIcon aria-hidden="true" className="size-4" />
                  <span className="font-medium">{job.candidates}</span>
                  <span className="text-muted-foreground text-sm">
                    candidates
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-card">
          <div className="border-border border-b p-6">
            <p className="text-muted-foreground text-sm">Anonymous matches</p>
            <h2 className="font-medium text-3xl">Candidate ranking</h2>
          </div>
          <div className="divide-y divide-border">
            {anonymousCandidates.map(([candidate, role, score]) => (
              <div className="p-5" key={candidate}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{candidate}</p>
                    <p className="mt-1 text-muted-foreground text-sm">{role}</p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">
                    {score}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="border-border border-t p-5">
            <Button className="w-full" disabled variant="outline">
              <RefreshCwIcon aria-hidden="true" data-icon="inline-start" />
              Refresh embeddings
            </Button>
          </div>
        </aside>
      </section>
    </main>
  )
}
