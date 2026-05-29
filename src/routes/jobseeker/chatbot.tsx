import { createFileRoute } from "@tanstack/react-router"

import { ChatbotContainer } from "@/features/dashboard/jobseeker/containers/ChatbotContainer"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"
import type { JobseekerChatbotMode } from "@/features/jobseeker-chatbot/types"

type ChatbotSearch = {
  analysisId?: string
  mode?: JobseekerChatbotMode
  prompt?: string
}

export const Route = createFileRoute("/jobseeker/chatbot")({
  beforeLoad: requireRole(["jobseeker"]),
  validateSearch: (search): ChatbotSearch => ({
    analysisId:
      typeof search.analysisId === "string" ? search.analysisId : undefined,
    mode: search.mode === "analysis" ? "analysis" : undefined,
    prompt: typeof search.prompt === "string" ? search.prompt : undefined,
  }),
  component: JobseekerChatbotPage,
})

function JobseekerChatbotPage() {
  const search = Route.useSearch()

  return (
    <ChatbotContainer
      initialAnalysisId={search.analysisId}
      initialMode={search.mode}
      initialPrompt={search.prompt}
    />
  )
}
