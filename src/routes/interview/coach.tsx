import { useForm } from "@tanstack/react-form"
import { createFileRoute } from "@tanstack/react-router"
import { BotIcon, MessageSquareIcon, PlayIcon, SendIcon } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import { PlatformHeader } from "@/features/platform/components/PlatformHeader"
import { coachQuestions } from "@/features/platform/data"
import { Badge } from "@/shared/components/shadcn/ui/badge"
import { Button } from "@/shared/components/shadcn/ui/button"

export const Route = createFileRoute("/interview/coach")({
  beforeLoad: requireRole(["jobseeker", "hrd"]),
  component: InterviewCoachPage,
})

type CoachMessage = {
  answer: string
  feedback: string
  question: string
}

function InterviewCoachPage() {
  const [selectedQuestion, setSelectedQuestion] = React.useState(0)
  const [messages, setMessages] = React.useState<CoachMessage[]>([])
  const answerForm = useForm({
    defaultValues: {
      answer: "",
    },
    onSubmit: async ({ value, formApi }) => {
      const trimmedAnswer = value.answer.trim()

      if (!trimmedAnswer || !activeQuestion) {
        toast.info("Jawaban tidak boleh kosong.")
        return
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          answer: trimmedAnswer,
          feedback: buildStarFeedback(trimmedAnswer),
          question: activeQuestion.question,
        },
      ])
      formApi.reset({ answer: "" })
      setSelectedQuestion((currentQuestion) =>
        Math.min(currentQuestion + 1, coachQuestions.length - 1)
      )
      toast.success("Jawaban berhasil dikirim.")
    },
  })
  const activeQuestion = coachQuestions[selectedQuestion]

  function handleStart() {
    setSelectedQuestion(0)
    answerForm.reset({ answer: "" })
    setMessages([])
    toast.info("Sesi interview direset.")
  }

  return (
    <main className="paper-grid min-h-dvh bg-background">
      <PlatformHeader
        description="Latihan interview STAR dengan prompt, jawaban kandidat, feedback struktur, dan ringkasan sesi."
        eyebrow="Career coaching"
        title="STAR coach"
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside className="rounded-lg border border-border bg-card p-6">
          <BotIcon aria-hidden="true" className="size-6" />
          <h2 className="mt-6 font-medium text-3xl">Session setup</h2>
          <p className="mt-4 text-muted-foreground leading-7">
            Coach memakai pola Situation, Task, Action, Result untuk menilai
            apakah jawaban sudah lengkap dan cukup spesifik.
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
          <Button className="mt-6 w-full" onClick={handleStart}>
            <PlayIcon aria-hidden="true" data-icon="inline-start" />
            Restart simulation
          </Button>
        </aside>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-border border-b p-6">
            <p className="text-muted-foreground text-sm">Generated prompts</p>
            <h2 className="font-medium text-3xl">Interview questions</h2>
          </div>
          <div className="divide-y divide-border">
            {coachQuestions.map((item, index) => (
              <button
                className="grid w-full gap-4 p-5 text-left transition-colors hover:bg-muted md:grid-cols-[auto_1fr]"
                key={item.question}
                onClick={() => setSelectedQuestion(index)}
                type="button"
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
              </button>
            ))}
          </div>

          <div className="border-border border-t p-6">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-muted-foreground text-sm">Active question</p>
              <h3 className="mt-2 font-medium leading-7">
                {activeQuestion?.question}
              </h3>
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  void answerForm.handleSubmit()
                }}
              >
                <answerForm.Field name="answer">
                  {(field) => (
                    <textarea
                      className="mt-4 min-h-32 w-full resize-y rounded-lg border border-border bg-card p-3 text-sm leading-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      placeholder="Tulis jawaban STAR kamu..."
                      value={field.state.value}
                    />
                  )}
                </answerForm.Field>
                <Button className="mt-3" type="submit">
                  <SendIcon aria-hidden="true" data-icon="inline-start" />
                  Submit answer
                </Button>
              </form>
            </div>

            <div className="mt-6 grid gap-3">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    className="rounded-lg border border-border bg-background p-4"
                    key={`${message.question}-${message.answer}`}
                  >
                    <p className="font-medium leading-7">{message.question}</p>
                    <p className="mt-3 text-muted-foreground text-sm leading-6">
                      {message.answer}
                    </p>
                    <Badge className="mt-4 bg-accent text-accent-foreground">
                      {message.feedback}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  Jawaban yang dikirim akan muncul sebagai transcript sesi.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function buildStarFeedback(answer: string) {
  const lowerAnswer = answer.toLowerCase()
  const wordCount = answer.split(/\s+/).filter(Boolean).length
  const hasSituation = /situasi|konteks|proyek|tim/.test(lowerAnswer)
  const hasAction = /saya|kami|melakukan|membangun|mengukur|memperbaiki/.test(
    lowerAnswer
  )
  const hasResult = /hasil|meningkat|turun|naik|persen|%|selesai/.test(
    lowerAnswer
  )
  const score =
    (wordCount >= 45 ? 1 : 0) +
    (hasSituation ? 1 : 0) +
    (hasAction ? 1 : 0) +
    (hasResult ? 1 : 0)

  if (score >= 4) {
    return "STAR lengkap"
  }

  if (score >= 2) {
    return "Tambahkan metrik result"
  }

  return "Lengkapi situation, action, result"
}
