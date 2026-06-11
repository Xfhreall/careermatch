import type { ChatbotHistoryMessage } from "./chatbot-guard"
import type {
  JobseekerChatbotConversation,
  JobseekerChatbotConversationSummary,
  JobseekerChatbotMessage,
  JobseekerChatbotMode,
} from "./types"

export type JobseekerChatbotRequest = {
  analysisId?: string
  conversationId?: string
  history: ChatbotHistoryMessage[]
  message: string
  mode: JobseekerChatbotMode
}

export type JobseekerChatbotResponse = {
  answer: string
  assistantMessage: JobseekerChatbotMessage
  conversationId: string
  conversationTitle: string
  conversations: JobseekerChatbotConversationSummary[]
  guard?: {
    enabled?: boolean
    score: number
    threshold: number
  }
  userMessage: JobseekerChatbotMessage
}

export type JobseekerChatbotSessionResponse = {
  activeConversation: JobseekerChatbotConversation | null
  conversations: JobseekerChatbotConversationSummary[]
}

export async function fetchJobseekerChatbotSessions(
  conversationId?: string
): Promise<JobseekerChatbotSessionResponse> {
  const params = conversationId
    ? `?conversationId=${encodeURIComponent(conversationId)}`
    : ""
  const response = await fetch(`/api/jobseeker/chatbot${params}`)
  const payload = await readResponsePayload(response)

  if (!response.ok) {
    throw new Error(readErrorMessage(payload, response.status))
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "conversations" in payload &&
    Array.isArray(payload.conversations)
  ) {
    return payload as JobseekerChatbotSessionResponse
  }

  throw new Error("Response session chatbot tidak valid.")
}

export async function sendJobseekerChatbotMessage(
  input: JobseekerChatbotRequest
): Promise<JobseekerChatbotResponse> {
  const response = await fetch("/api/jobseeker/chatbot", {
    body: JSON.stringify(input),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  })
  const payload = await readResponsePayload(response)

  if (!response.ok) {
    throw new Error(readErrorMessage(payload, response.status))
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "answer" in payload &&
    typeof payload.answer === "string"
  ) {
    return payload as JobseekerChatbotResponse
  }

  throw new Error("Response chatbot tidak valid.")
}

async function readResponsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json()
  }

  return response.text()
}

function readErrorMessage(payload: unknown, status: number) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error
  }

  return `Server merespons dengan status ${status}`
}
