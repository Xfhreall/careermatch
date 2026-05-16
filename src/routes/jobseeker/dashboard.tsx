import { createFileRoute, Link } from "@tanstack/react-router"
import { DownloadIcon, FileSearchIcon } from "lucide-react"
import * as React from "react"

import {
  type AnalysisHistoryItem,
  listAnalysisHistory,
} from "@/features/cv-analysis/storage"
import { PlatformHeader } from "@/features/platform/components/PlatformHeader"
import { dashboardCards } from "@/features/platform/data"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/components/shadcn/ui/empty"

export const Route = createFileRoute("/jobseeker/dashboard")({
  component: JobseekerDashboardPage,
})

function JobseekerDashboardPage() {
  const [historyItems, setHistoryItems] = React.useState<AnalysisHistoryItem[]>(
    []
  )

  React.useEffect(() => {
    setHistoryItems(listAnalysisHistory())
  }, [])

  return (
    <main className="paper-grid min-h-dvh bg-background">
      <PlatformHeader
        description="Phase 2 scaffold: auth-ready shell, local analysis history, saved report surface, and PDF action slot."
        eyebrow="Phase 2 - Persistence & Auth"
        title="Jobseeker dashboard"
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        {dashboardCards.map((card) => (
          <div
            className="rounded-lg border border-border bg-card p-6"
            key={card.title}
          >
            <card.icon aria-hidden="true" className="size-5" />
            <div className="mt-6 flex items-start justify-between gap-4">
              <h2 className="font-medium text-2xl">{card.title}</h2>
              <Badge variant="outline">{card.status}</Badge>
            </div>
            <p className="mt-4 text-muted-foreground text-sm leading-7">
              {card.body}
            </p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-3 border-border border-b p-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-muted-foreground text-sm">
                Saved analysis jobs
              </p>
              <h2 className="font-medium text-3xl">Analysis history</h2>
            </div>
            <Button
              nativeButton={false}
              render={<Link to="/jobseeker/analyze" />}
            >
              <FileSearchIcon aria-hidden="true" data-icon="inline-start" />
              Analyze CV
            </Button>
          </div>

          {historyItems.length > 0 ? (
            <div className="divide-y divide-border">
              {historyItems.map((item) => (
                <div
                  className="grid gap-4 p-5 md:grid-cols-[1fr_auto_auto] md:items-center"
                  key={item.analysisId}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {item.topRole ?? "Analysis report"}
                    </p>
                    <p className="mt-1 text-muted-foreground text-sm">
                      {item.topCompany ?? "CareerMatch"} -{" "}
                      {new Date(item.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-accent text-accent-foreground">
                      {item.jobMatchCount} matches
                    </Badge>
                    <Badge variant="outline">
                      {item.topScore ? `${Math.round(item.topScore)}%` : "N/A"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      nativeButton={false}
                      render={
                        <Link
                          params={{ analysisId: item.analysisId }}
                          to="/jobseeker/analysis/$analysisId"
                        />
                      }
                      variant="outline"
                    >
                      Open
                    </Button>
                    <Button disabled variant="ghost">
                      <DownloadIcon
                        aria-hidden="true"
                        data-icon="inline-start"
                      />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="border-0">
              <FileSearchIcon aria-hidden="true" />
              <EmptyHeader>
                <EmptyTitle>No local analysis history yet</EmptyTitle>
                <EmptyDescription>
                  Run CV analysis first. Dashboard index uses browser storage
                  until Supabase persistence ships.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  nativeButton={false}
                  render={<Link to="/jobseeker/analyze" />}
                >
                  Analyze CV
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </div>
      </section>
    </main>
  )
}
