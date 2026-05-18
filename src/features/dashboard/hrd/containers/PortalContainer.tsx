import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DownloadIcon, PlusIcon, RefreshCwIcon, UsersIcon } from "lucide-react";

import {
  createHrdJob,
  fetchHrdDashboard,
  refreshHrdEmbeddings,
} from "@/features/platform/api-client";
import { Badge } from "@/shared/components/shadcn/ui/badge";
import { Button } from "@/shared/components/shadcn/ui/button";

export function HrdPortalContainer() {
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({
    queryFn: fetchHrdDashboard,
    queryKey: ["hrd-dashboard"],
  });
  const createJobMutation = useMutation({
    mutationFn: createHrdJob,
    onSuccess: (payload) => {
      queryClient.setQueryData(["hrd-dashboard"], payload);
    },
  });
  const refreshMutation = useMutation({
    mutationFn: refreshHrdEmbeddings,
    onSuccess: (payload) => {
      queryClient.setQueryData(["hrd-dashboard"], payload);
    },
  });
  const jobs = dashboardQuery.data?.jobs ?? [];
  const anonymousCandidates = dashboardQuery.data?.anonymousCandidates ?? [];

  function handleNewJob() {
    createJobMutation.mutate();
  }

  function handleRefreshEmbeddings() {
    refreshMutation.mutate();
  }

  function handleExportCandidates() {
    const report = {
      exportedAt: new Date().toISOString(),
      candidates: anonymousCandidates,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "careermatch-anonymous-candidates.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-3 border-border border-b p-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Job postings</p>
            <h2 className="font-medium text-3xl">Open roles</h2>
          </div>
          <Button disabled={createJobMutation.isPending} onClick={handleNewJob}>
            <PlusIcon aria-hidden="true" data-icon="inline-start" />
            New job
          </Button>
        </div>
        <div className="divide-y divide-border">
          {jobs.map((job) => (
            <div
              className="grid gap-4 p-5 md:grid-cols-[1fr_auto]"
              key={`${job.company}-${job.title}`}
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
          ))}
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
          {anonymousCandidates.map((candidate) => (
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
          ))}
        </div>
      </aside>
    </section>
  );
}
