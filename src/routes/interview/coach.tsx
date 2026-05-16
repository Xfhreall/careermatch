import { createFileRoute } from "@tanstack/react-router"
import { BotIcon, MessageSquareIcon, PlayIcon } from "lucide-react"

import { PlatformHeader } from "@/features/platform/components/PlatformHeader"
import { coachQuestions } from "@/features/platform/data"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"

export const Route = createFileRoute("/interview/coach")({
  component: InterviewCoachPage,
})

function InterviewCoachPage() {
  return (
    <main className="paper-grid min-h-dvh bg-background">
      <PlatformHeader
        description="Phase 4 scaffold: STAR questions, simulation transcript surface, feedback rubric, and resume session slot."
        eyebrow="Phase 4 - Interview Coach"
        title="STAR coach"
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside className="rounded-lg border border-border bg-card p-6">
          <BotIcon aria-hidden="true" className="size-6" />
          <h2 className="mt-6 font-medium text-3xl">Session setup</h2>
          <p className="mt-4 text-muted-foreground leading-7">
            Coach uses analysis result as context later. Current scaffold keeps
            STAR flow visible without pretending backend session persistence
            exists.
          </p>
          <div className="mt-6 grid gap-3">
            {["Situation", "Task", "Action", "Result"].map((step) => (
              <div
                className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                key={step}
              >
                <span>{step}</span>
                <Badge variant="outline">Rubric</Badge>
              </div>
            ))}
          </div>
          <Button className="mt-6 w-full" disabled>
            <PlayIcon aria-hidden="true" data-icon="inline-start" />
            Start simulation
          </Button>
        </aside>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-border border-b p-6">
            <p className="text-muted-foreground text-sm">Generated prompts</p>
            <h2 className="font-medium text-3xl">Interview questions</h2>
          </div>
          <div className="divide-y divide-border">
            {coachQuestions.map((item, index) => (
              <div
                className="grid gap-4 p-5 md:grid-cols-[auto_1fr]"
                key={item.question}
              >
                <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-background font-medium">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium leading-7">{item.question}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <MessageSquareIcon aria-hidden="true" className="size-4" />
                    <Badge className="bg-accent text-accent-foreground">
                      {item.focus}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid border-border border-t md:grid-cols-3">
            {[
              ["Feedback", "Per STAR component"],
              ["Transcript", "Resume-ready later"],
              ["Session", "Local scaffold"],
            ].map(([title, body]) => (
              <div
                className="border-border border-b p-5 md:border-r md:border-b-0 md:last:border-r-0"
                key={title}
              >
                <p className="font-medium">{title}</p>
                <p className="mt-2 text-muted-foreground text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
