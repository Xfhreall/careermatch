import { createFileRoute } from "@tanstack/react-router"

import { ChatbotContainer } from "@/features/dashboard/jobseeker/containers/ChatbotContainer"
import { requireRole } from "@/features/dashboard/lib/auth-middleware"

export const Route = createFileRoute("/jobseeker/chatbot")({
  beforeLoad: requireRole(["jobseeker"]),
  component: JobseekerChatbotPage,
})

function JobseekerChatbotPage() {
  return <ChatbotContainer />
}
