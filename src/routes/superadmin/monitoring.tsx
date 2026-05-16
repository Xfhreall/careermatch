import { createFileRoute } from "@tanstack/react-router"
import { SlidersHorizontalIcon } from "lucide-react"

import { PlatformHeader } from "@/features/platform/components/PlatformHeader"
import {
  auditEvents,
  monitoringCards,
  scoringWeights,
} from "@/features/platform/data"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Progress } from "@/shared/components/shadcn/ui/progress"

export const Route = createFileRoute("/superadmin/monitoring")({
  component: SuperadminMonitoringPage,
})

function SuperadminMonitoringPage() {
  return (
    <main className="paper-grid min-h-dvh bg-background">
      <PlatformHeader
        description="Phase 5 scaffold: workflow health, AI cost, error rate, HRD approval queue, scoring weights, and audit log."
        eyebrow="Phase 5 - Admin & Monitoring"
        title="Superadmin console"
      />

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {monitoringCards.map((card) => (
          <div
            className="rounded-lg border border-border bg-card p-6"
            key={card.title}
          >
            <card.icon aria-hidden="true" className="size-5" />
            <p className="mt-6 text-muted-foreground text-sm">{card.title}</p>
            <p className="mt-2 font-medium text-4xl">{card.value}</p>
            <p className="mt-2 text-muted-foreground text-sm">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-border border-b p-6">
            <div className="flex items-center gap-3">
              <SlidersHorizontalIcon aria-hidden="true" className="size-5" />
              <h2 className="font-medium text-3xl">Scoring weights</h2>
            </div>
          </div>
          <div className="grid gap-5 p-6">
            {scoringWeights.map(([label, value]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="font-medium">{label}</span>
                  <Badge variant="outline">{value}%</Badge>
                </div>
                <Progress value={value} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-border border-b p-6">
            <p className="text-muted-foreground text-sm">Audit log</p>
            <h2 className="font-medium text-3xl">Recent platform events</h2>
          </div>
          <div className="divide-y divide-border">
            {auditEvents.map(([time, event, detail]) => (
              <div
                className="grid gap-3 p-5 md:grid-cols-[80px_1fr]"
                key={event}
              >
                <span className="text-muted-foreground text-sm">{time}</span>
                <div>
                  <p className="font-medium">{event}</p>
                  <p className="mt-1 text-muted-foreground text-sm">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
