// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import type { JobseekerChatbotResponse } from "@/shared/repository/jobseeker-chatbot/action"

const { sendMessage } = vi.hoisted(() => ({
  sendMessage: vi.fn(),
}))

vi.mock("@/features/auth/hooks/use-user-query", () => ({
  useUserQuery: () => ({ data: null }),
}))

vi.mock("@/shared/repository/cv-analysis/action", () => ({
  fetchAnalysisHistory: () => Promise.resolve([]),
}))

vi.mock("@/features/cv-analysis/components/SafeMarkdown", () => ({
  SafeMarkdown: ({ value }: { value: string }) => <p>{value}</p>,
}))

vi.mock("@/shared/repository/jobseeker-chatbot/action", async () => {
  const actual = await vi.importActual<
    typeof import("@/shared/repository/jobseeker-chatbot/action")
  >("@/shared/repository/jobseeker-chatbot/action")

  return {
    ...actual,
    fetchJobseekerChatbotSessions: (conversationId?: string) =>
      conversationId
        ? new Promise(() => undefined)
        : Promise.resolve({
            activeConversation: null,
            conversations: [],
          }),
    sendJobseekerChatbotMessage: sendMessage,
  }
})

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: {
        user: {
          email: "jobseeker@example.com",
          name: "Job Seeker",
        },
      },
    }),
  },
}))

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}))

import { ChatbotContainer } from "@/features/dashboard/jobseeker/containers/ChatbotContainer"

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn()
})

describe("ChatbotContainer", () => {
  it("renders one user bubble after an optimistic message is settled", async () => {
    const response = deferred<JobseekerChatbotResponse>()
    const message =
      "Saya melakukan brainstorming lalu mengevaluasi solusi bersama tim."

    sendMessage.mockReturnValueOnce(response.promise)

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <ChatbotContainer />
      </QueryClientProvider>
    )

    fireEvent.change(screen.getByLabelText("Pesan chatbot"), {
      target: { value: message },
    })
    fireEvent.click(screen.getByRole("button", { name: "Kirim pesan" }))

    await screen.findByText(message)

    response.resolve({
      answer: "Jawaban sudah cukup jelas.",
      assistantMessage: {
        content: "Jawaban sudah cukup jelas.",
        createdAt: "2026-06-12T06:40:01.000Z",
        id: "assistant-message-1",
        role: "assistant",
      },
      conversationId: "conversation-1",
      conversationTitle: "Latihan interview",
      conversations: [],
      userMessage: {
        content: message,
        createdAt: "2026-06-12T06:40:00.000Z",
        id: "user-message-1",
        role: "user",
      },
    })

    await screen.findByText("Jawaban sudah cukup jelas.")
    await waitFor(() => {
      expect(screen.getAllByText(message)).toHaveLength(1)
    })
  })
})

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve
  })

  return { promise, resolve }
}
