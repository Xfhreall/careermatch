import { createFileRoute } from "@tanstack/react-router"
import { CheckCircle2Icon, CircleHelpIcon } from "lucide-react"

import { PlatformHeader } from "@/features/platform/components/PlatformHeader"
import {
  engineeringNotes,
  openQuestions,
  roadmapPhases,
  roleMatrix,
  techStackGroups,
} from "@/features/platform/data"
import { Badge } from "@/shared/components/shadcn/ui/badge"

export const Route = createFileRoute("/platform/architecture")({
  component: PlatformArchitecturePage,
})

function PlatformArchitecturePage() {
  return (
    <main className="paper-grid min-h-dvh bg-background">
      <PlatformHeader
        description="Sections 15-18 converted into visible product and engineering surfaces: roadmap, open decisions, tech stack, role matrix, and engineering notes."
        eyebrow="PRD Sections 15-18"
        title="Platform architecture"
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-5">
          {roadmapPhases.map((phase) => (
            <div
              className="rounded-lg border border-border bg-card p-5"
              key={phase.phase}
            >
              <Badge variant="outline">{phase.phase}</Badge>
              <h2 className="mt-5 font-medium text-2xl">{phase.title}</h2>
              <Badge className="mt-4 bg-accent text-accent-foreground">
                {phase.status}
              </Badge>
              <div className="mt-5 grid gap-3">
                {phase.items.map((item) => (
                  <div className="flex gap-2 text-sm" key={item}>
                    <CheckCircle2Icon
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0"
                    />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-border border-b p-6">
            <p className="text-muted-foreground text-sm">Section 16</p>
            <h2 className="font-medium text-3xl">Open questions</h2>
          </div>
          <div className="divide-y divide-border">
            {openQuestions.map((item) => (
              <div className="grid gap-3 p-5" key={item.question}>
                <div className="flex items-center gap-2">
                  <CircleHelpIcon aria-hidden="true" className="size-4" />
                  <p className="font-medium">{item.question}</p>
                </div>
                <p className="text-muted-foreground text-sm leading-6">
                  {item.assumption}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-border border-b p-6">
            <p className="text-muted-foreground text-sm">Section 18</p>
            <h2 className="font-medium text-3xl">Engineering notes</h2>
          </div>
          <div className="divide-y divide-border">
            {engineeringNotes.map((note) => (
              <div className="flex gap-3 p-5" key={note}>
                <CheckCircle2Icon aria-hidden="true" className="mt-1 size-4" />
                <p className="text-sm leading-7">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {techStackGroups.map((group) => (
            <div
              className="rounded-lg border border-border bg-card p-6"
              key={group.title}
            >
              <group.icon aria-hidden="true" className="size-5" />
              <h2 className="mt-5 font-medium text-2xl">{group.title}</h2>
              <div className="mt-5 grid gap-3">
                {group.rows.map(([tech, purpose]) => (
                  <div
                    className="border-border border-b pb-3 last:border-b-0 last:pb-0"
                    key={tech}
                  >
                    <p className="font-medium text-sm">{tech}</p>
                    <p className="mt-1 text-muted-foreground text-xs leading-5">
                      {purpose}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-border border-b p-6">
            <p className="text-muted-foreground text-sm">Role matrix</p>
            <h2 className="font-medium text-3xl">Access model scaffold</h2>
          </div>
          <div className="divide-y divide-border">
            {roleMatrix.map(([feature, ...roles]) => (
              <div
                className="grid gap-3 p-5 md:grid-cols-[1fr_auto]"
                key={feature}
              >
                <p className="font-medium">{feature}</p>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
