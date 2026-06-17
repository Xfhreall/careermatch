import { useForm } from "@tanstack/react-form"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import * as React from "react"
import { toast } from "sonner"
import { useUserQuery } from "@/features/auth/hooks/use-user-query"
import { useAnalysisHistoryQuery } from "@/features/dashboard/jobseeker/hooks/use-analysis-history"
import type {
  JobseekerChatbotMessage,
  JobseekerChatbotMode,
} from "@/features/jobseeker-chatbot/types"
import { authClient } from "@/lib/auth-client"
import {
  fetchJobseekerChatbotSessions,
  type JobseekerChatbotSessionResponse,
  sendJobseekerChatbotMessage,
} from "@/shared/repository/jobseeker-chatbot/action"

export type LocalMessage = JobseekerChatbotMessage & {
  optimistic?: boolean
  pending?: boolean
}

export interface UseJobseekerChatbotProps {
  initialAnalysisId?: string
  initialMode?: JobseekerChatbotMode
  initialPrompt?: string
}

export const chatQueryKey = ["jobseeker-chatbot-sessions"] as const

export function useJobseekerChatbot({
  initialAnalysisId,
  initialMode = "direct",
  initialPrompt = "",
}: UseJobseekerChatbotProps = {}) {
  const queryClient = useQueryClient()
  const session = authClient.useSession()
  const userQuery = useUserQuery({ enabled: Boolean(session.data?.user) })

  const [mode, setMode] = React.useState<JobseekerChatbotMode>(
    initialAnalysisId ? "analysis" : initialMode
  )
  const [selectedAnalysisId, setSelectedAnalysisId] = React.useState<
    string | undefined
  >(initialAnalysisId)
  const [activeConversationId, setActiveConversationId] = React.useState<
    string | undefined
  >()
  const [messages, setMessages] = React.useState<LocalMessage[]>([])

  const initialSearchRef = React.useRef({
    analysisId: initialAnalysisId,
    mode: initialMode,
    prompt: initialPrompt,
  })

  const historyQuery = useAnalysisHistoryQuery()

  const sessionsQuery = useQuery({
    placeholderData: keepPreviousData,
    queryFn: () => fetchJobseekerChatbotSessions(activeConversationId),
    queryKey: [...chatQueryKey, activeConversationId],
  })

  const selectedAnalysis = historyQuery.data?.find(
    (item) => item.analysisId === selectedAnalysisId
  )
  const activeConversation =
    sessionsQuery.data?.activeConversation?.id === activeConversationId
      ? sessionsQuery.data?.activeConversation
      : null
  const conversations = sessionsQuery.data?.conversations ?? []
  const user = userQuery.data ?? session.data?.user

  const mutation = useMutation({
    mutationFn: sendJobseekerChatbotMessage,
    onSuccess: async (response) => {
      setActiveConversationId(response.conversationId)
      setMessages((current) =>
        settleChatbotMessages(
          current,
          response.userMessage,
          response.assistantMessage
        )
      )
      const activeData = {
        activeConversation: {
          analysisId: mode === "analysis" ? selectedAnalysisId : undefined,
          createdAt: response.userMessage.createdAt,
          id: response.conversationId,
          messages: settleChatbotMessages(
            messages,
            response.userMessage,
            response.assistantMessage
          ),
          mode,
          title: response.conversationTitle,
          updatedAt: response.assistantMessage.createdAt,
        },
        conversations: response.conversations,
      } satisfies JobseekerChatbotSessionResponse

      queryClient.setQueryData<JobseekerChatbotSessionResponse>(
        [...chatQueryKey, response.conversationId],
        activeData
      )
      queryClient.setQueryData<JobseekerChatbotSessionResponse>(
        [...chatQueryKey, activeConversationId],
        (current) =>
          current
            ? {
                ...current,
                conversations: response.conversations,
              }
            : current
      )
      queryClient.setQueryData<JobseekerChatbotSessionResponse>(
        [...chatQueryKey, undefined],
        (current) => ({
          activeConversation: current?.activeConversation ?? null,
          conversations: response.conversations,
        })
      )
      await queryClient.invalidateQueries({
        queryKey: chatQueryKey,
        refetchType: "inactive",
      })
    },
    onError: (error) => {
      const content =
        error instanceof Error
          ? error.message
          : "Chatbot belum bisa merespons saat ini."

      setMessages((current) =>
        current
          .filter((message) => !message.pending)
          .map((message) =>
            message.optimistic ? { ...message, optimistic: false } : message
          )
          .concat(createLocalMessage("assistant", content))
      )
      toast.error(content)
    },
  })

  const chatForm = useForm({
    defaultValues: {
      message: initialPrompt,
    },
    onSubmit: async ({ formApi, value }) => {
      const message = value.message.trim()

      if (!message || mutation.isPending) {
        return
      }

      if (mode === "analysis" && !selectedAnalysisId) {
        toast.error("Pilih hasil analisis CV terlebih dahulu.")
        return
      }

      const userMessage = {
        ...createLocalMessage("user", message),
        optimistic: true,
      }
      const pendingMessage = createLocalMessage(
        "assistant",
        "CareerMatch sedang memproses jawaban.",
        true
      )

      setMessages((current) => current.concat(userMessage, pendingMessage))
      formApi.setFieldValue("message", "")
      mutation.mutate({
        analysisId: mode === "analysis" ? selectedAnalysisId : undefined,
        conversationId: activeConversationId,
        history: [],
        message,
        mode,
      })
    },
  })

  const draft = chatForm.state.values.message
  const isConversationLoading = Boolean(
    activeConversationId && sessionsQuery.isFetching && !mutation.isPending
  )

  React.useEffect(() => {
    const currentSearch = {
      analysisId: initialAnalysisId,
      mode: initialMode,
      prompt: initialPrompt,
    }

    if (
      initialSearchRef.current.analysisId === currentSearch.analysisId &&
      initialSearchRef.current.mode === currentSearch.mode &&
      initialSearchRef.current.prompt === currentSearch.prompt
    ) {
      return
    }

    initialSearchRef.current = currentSearch
    setActiveConversationId(undefined)
    setMessages([])
    setMode(initialAnalysisId ? "analysis" : initialMode)
    setSelectedAnalysisId(initialAnalysisId)
    chatForm.setFieldValue("message", initialPrompt)
  }, [chatForm, initialAnalysisId, initialMode, initialPrompt])

  React.useEffect(() => {
    if (activeConversation) {
      setMode(activeConversation.mode)
      setSelectedAnalysisId(activeConversation.analysisId)
      setMessages(activeConversation.messages)
    }
  }, [activeConversation])

  React.useEffect(() => {
    if (
      mode === "analysis" &&
      !selectedAnalysisId &&
      historyQuery.data?.[0]?.analysisId
    ) {
      setSelectedAnalysisId(historyQuery.data[0].analysisId)
    }
  }, [historyQuery.data, mode, selectedAnalysisId])

  function handleNewChat() {
    setActiveConversationId(undefined)
    setMessages([])
    chatForm.setFieldValue("message", "")
    setMode("direct")
    setSelectedAnalysisId(undefined)
  }

  function handleSelectConversation(conversationId: string) {
    setActiveConversationId(conversationId)
    setMessages([])
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void chatForm.handleSubmit()
  }

  return {
    mode,
    setMode,
    selectedAnalysisId,
    setSelectedAnalysisId,
    activeConversationId,
    setActiveConversationId,
    messages,
    setMessages,
    conversations,
    activeConversation,
    selectedAnalysis,
    user,
    mutation,
    chatForm,
    draft,
    isConversationLoading,
    historyQuery,
    sessionsQuery,
    handleNewChat,
    handleSelectConversation,
    handleSubmit,
  }
}

function createLocalMessage(
  role: JobseekerChatbotMessage["role"],
  content: string,
  pending = false
): LocalMessage {
  return {
    content,
    createdAt: new Date().toISOString(),
    id: crypto.randomUUID(),
    pending,
    role,
  }
}

function settleChatbotMessages(
  current: LocalMessage[],
  userMessage: JobseekerChatbotMessage,
  assistantMessage: JobseekerChatbotMessage
) {
  const settled = current.filter((message) => !message.pending)
  let optimisticUserIndex = -1

  for (let index = settled.length - 1; index >= 0; index -= 1) {
    const message = settled[index]

    if (message?.optimistic && message.role === "user") {
      optimisticUserIndex = index
      break
    }
  }

  if (optimisticUserIndex >= 0) {
    settled[optimisticUserIndex] = userMessage
  } else if (!settled.some((message) => message.id === userMessage.id)) {
    settled.push(userMessage)
  }

  if (!settled.some((message) => message.id === assistantMessage.id)) {
    settled.push(assistantMessage)
  }

  return settled
}
