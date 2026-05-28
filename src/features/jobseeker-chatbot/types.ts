export type JobseekerChatbotMode = "analysis" | "direct"

export type JobseekerChatbotRole = "assistant" | "user"

export type JobseekerChatbotMessage = {
  content: string
  createdAt: string
  id: string
  role: JobseekerChatbotRole
}

export type JobseekerChatbotConversation = {
  analysisId?: string
  createdAt: string
  id: string
  messages: JobseekerChatbotMessage[]
  mode: JobseekerChatbotMode
  title: string
  updatedAt: string
}

export type JobseekerChatbotConversationSummary = Omit<
  JobseekerChatbotConversation,
  "messages"
>
