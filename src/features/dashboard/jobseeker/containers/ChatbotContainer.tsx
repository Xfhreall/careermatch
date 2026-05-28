import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  BotIcon,
  ClockIcon,
  FileSearchIcon,
  LayoutDashboardIcon,
  MenuIcon,
  MessageSquarePlusIcon,
  SendIcon,
  SparklesIcon,
  UserRoundIcon,
  XIcon,
} from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { useUserQuery } from "@/features/auth/user-query"
import { fetchAnalysisHistory } from "@/features/cv-analysis/api-client"
import { SafeMarkdown } from "@/features/cv-analysis/components/SafeMarkdown"
import type { AnalysisHistoryItem } from "@/features/cv-analysis/types"
import {
  fetchJobseekerChatbotSessions,
  type JobseekerChatbotSessionResponse,
  sendJobseekerChatbotMessage,
} from "@/features/jobseeker-chatbot/api-client"
import type {
  JobseekerChatbotConversationSummary,
  JobseekerChatbotMessage,
  JobseekerChatbotMode,
} from "@/features/jobseeker-chatbot/types"
import { authClient } from "@/lib/auth-client"
import { Button, buttonVariants } from "@/shared/components/shadcn/ui/button"
import { Skeleton } from "@/shared/components/shadcn/ui/skeleton"
import { cn } from "@/shared/lib/utils"

type LocalMessage = JobseekerChatbotMessage & {
  pending?: boolean
}

const QUICK_PROMPTS = {
  analysis: [
    "Prioritaskan skill gap dari analisis CV ini.",
    "Buat rencana belajar 7 hari untuk role teratas.",
    "Simulasikan jawaban interview berbasis hasil analisis ini.",
  ],
  direct: [
    "Bantu rapikan struktur CV untuk role frontend developer.",
    "Buat latihan interview metode STAR.",
    "Skill apa yang perlu ditonjolkan untuk lamaran remote?",
  ],
} satisfies Record<JobseekerChatbotMode, string[]>

const chatQueryKey = ["jobseeker-chatbot-sessions"] as const

export function ChatbotContainer() {
  const queryClient = useQueryClient()
  const shouldReduceMotion = useReducedMotion()
  const session = authClient.useSession()
  const userQuery = useUserQuery({ enabled: Boolean(session.data?.user) })
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [mode, setMode] = React.useState<JobseekerChatbotMode>("direct")
  const [selectedAnalysisId, setSelectedAnalysisId] = React.useState<
    string | undefined
  >()
  const [activeConversationId, setActiveConversationId] = React.useState<
    string | undefined
  >()
  const [draft, setDraft] = React.useState("")
  const [messages, setMessages] = React.useState<LocalMessage[]>([])
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
  const historyQuery = useQuery({
    queryFn: fetchAnalysisHistory,
    queryKey: ["analysis-history"],
  })
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
  const transition = {
    duration: shouldReduceMotion ? 0 : 0.2,
    ease: [0.16, 1, 0.3, 1],
  } as const
  const mutation = useMutation({
    mutationFn: sendJobseekerChatbotMessage,
    onSuccess: async (response) => {
      setActiveConversationId(response.conversationId)
      setMessages((current) =>
        current
          .filter((message) => !message.pending)
          .concat(response.assistantMessage)
      )
      const activeData = {
        activeConversation: {
          analysisId: mode === "analysis" ? selectedAnalysisId : undefined,
          createdAt: response.userMessage.createdAt,
          id: response.conversationId,
          messages: [
            ...messages.filter((message) => !message.pending),
            response.userMessage,
            response.assistantMessage,
          ],
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
          .concat(createLocalMessage("assistant", content))
      )
      toast.error(content)
    },
  })
  const isConversationLoading = Boolean(
    activeConversationId && sessionsQuery.isFetching && !mutation.isPending
  )

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: chat viewport must follow appended messages.
  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages.length])

  // biome-ignore lint/correctness/useExhaustiveDependencies: textarea height tracks draft content.
  React.useEffect(() => {
    if (!textareaRef.current) {
      return
    }

    textareaRef.current.style.height = "0px"
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      176
    )}px`
  }, [draft])

  function handleNewChat() {
    setActiveConversationId(undefined)
    setMessages([])
    setDraft("")
    setMode("direct")
    setSelectedAnalysisId(undefined)
    setSidebarOpen(false)
  }

  function handleSelectConversation(conversationId: string) {
    setActiveConversationId(conversationId)
    setMessages([])
    setSidebarOpen(false)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const message = draft.trim()

    if (!message || mutation.isPending) {
      return
    }

    if (mode === "analysis" && !selectedAnalysisId) {
      toast.error("Pilih hasil analisis CV terlebih dahulu.")
      return
    }

    const userMessage = createLocalMessage("user", message)
    const pendingMessage = createLocalMessage(
      "assistant",
      "CareerMatch sedang memproses jawaban.",
      true
    )

    setMessages((current) => current.concat(userMessage, pendingMessage))
    setDraft("")
    mutation.mutate({
      analysisId: mode === "analysis" ? selectedAnalysisId : undefined,
      conversationId: activeConversationId,
      history: [],
      message,
      mode,
    })
  }

  return (
    <div className="h-dvh overflow-hidden bg-background text-foreground">
      <div className="flex h-full min-w-0 overflow-hidden">
        {sidebarOpen ? (
          <button
            aria-label="Tutup sidebar chatbot"
            className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
          />
        ) : null}

        <ChatSidebar
          activeConversationId={activeConversationId}
          conversations={conversations}
          history={historyQuery.data ?? []}
          historyLoading={historyQuery.isLoading}
          mode={mode}
          onClose={() => setSidebarOpen(false)}
          onModeChange={setMode}
          onNewChat={handleNewChat}
          onSelectAnalysis={setSelectedAnalysisId}
          onSelectConversation={handleSelectConversation}
          open={sidebarOpen}
          selectedAnalysisId={selectedAnalysisId}
          sessionsLoading={
            sessionsQuery.isLoading &&
            conversations.length === 0 &&
            !activeConversationId
          }
          user={user}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <ChatHeader
            activeConversation={activeConversation}
            mode={mode}
            onOpenSidebar={() => setSidebarOpen(true)}
            selectedAnalysis={selectedAnalysis}
          />

          <section className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 pt-8 pb-6 sm:px-6">
              {messages.length === 0 ? (
                isConversationLoading ? (
                  <ChatLoadingState />
                ) : (
                  <EmptyChat
                    mode={mode}
                    onPrompt={(prompt) => setDraft(prompt)}
                  />
                )
              ) : (
                <div className="flex flex-1 flex-col gap-6">
                  {isConversationLoading ? <ChatLoadingState compact /> : null}
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <ChatMessageRow
                        key={message.id}
                        message={message}
                        shouldReduceMotion={shouldReduceMotion}
                        transition={transition}
                      />
                    ))}
                  </AnimatePresence>
                  <div ref={scrollRef} />
                </div>
              )}
            </div>
          </section>

          <ChatComposer
            disabled={
              mutation.isPending ||
              !draft.trim() ||
              (mode === "analysis" && !selectedAnalysisId)
            }
            draft={draft}
            loading={mutation.isPending}
            onChange={setDraft}
            onSubmit={handleSubmit}
            textareaRef={textareaRef}
          />
        </main>
      </div>
    </div>
  )
}

function ChatSidebar({
  activeConversationId,
  conversations,
  history,
  historyLoading,
  mode,
  onClose,
  onModeChange,
  onNewChat,
  onSelectAnalysis,
  onSelectConversation,
  open,
  selectedAnalysisId,
  sessionsLoading,
  user,
}: {
  activeConversationId?: string
  conversations: JobseekerChatbotConversationSummary[]
  history: AnalysisHistoryItem[]
  historyLoading: boolean
  mode: JobseekerChatbotMode
  onClose: () => void
  onModeChange: (mode: JobseekerChatbotMode) => void
  onNewChat: () => void
  onSelectAnalysis: (analysisId: string) => void
  onSelectConversation: (conversationId: string) => void
  open: boolean
  selectedAnalysisId?: string
  sessionsLoading: boolean
  user?: {
    email?: string | null
    image?: string | null
    name?: string | null
  } | null
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-80 flex-col border-border border-r bg-card transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:z-auto lg:w-72 lg:max-w-none lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
      aria-label="Sidebar chatbot"
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-border border-b px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary">
            <BotIcon aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-sm">CareerMatch</p>
            <p className="truncate text-muted-foreground text-xs">Chatbot</p>
          </div>
        </div>
        <button
          aria-label="Tutup sidebar"
          className={cn(
            buttonVariants({ size: "icon-sm", variant: "ghost" }),
            "lg:hidden"
          )}
          onClick={onClose}
          type="button"
        >
          <XIcon aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-border border-b p-3">
        <Button
          aria-label="Chat baru"
          className="justify-start"
          onClick={onNewChat}
          variant="outline"
        >
          <MessageSquarePlusIcon aria-hidden="true" data-icon="inline-start" />
          <span>Chat baru</span>
        </Button>
        <Button
          nativeButton={false}
          render={<Link to="/jobseeker/dashboard" />}
          aria-label="Dashboard"
          className="justify-start"
          variant="ghost"
        >
          <LayoutDashboardIcon aria-hidden="true" data-icon="inline-start" />
          <span>Dashboard</span>
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <SidebarSection title="Mode">
          <ModeOption
            active={mode === "direct"}
            label="Chat langsung"
            onClick={() => onModeChange("direct")}
          />
          <ModeOption
            active={mode === "analysis"}
            label="Context CV"
            onClick={() => onModeChange("analysis")}
          />
        </SidebarSection>

        {mode === "analysis" ? (
          <SidebarSection title="Analisis CV">
            {historyLoading ? (
              <SidebarSkeleton />
            ) : history.length > 0 ? (
              history.map((item) => (
                <button
                  aria-pressed={item.analysisId === selectedAnalysisId}
                  className={cn(
                    "flex w-full min-w-0 flex-col rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
                    item.analysisId === selectedAnalysisId &&
                      "bg-primary/10 text-primary"
                  )}
                  key={item.analysisId}
                  onClick={() => onSelectAnalysis(item.analysisId)}
                  type="button"
                >
                  <span className="truncate font-medium">
                    {item.topRole || "Analisis CV"}
                  </span>
                  <span className="mt-0.5 truncate text-muted-foreground text-xs">
                    {item.topCompany || formatDate(item.createdAt)}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-2 text-muted-foreground text-xs leading-5">
                Belum ada analisis CV.
              </p>
            )}
          </SidebarSection>
        ) : null}

        <SidebarSection title="Riwayat chat">
          {sessionsLoading ? (
            <SidebarSkeleton />
          ) : conversations.length > 0 ? (
            conversations.map((conversation) => (
              <ConversationButton
                active={conversation.id === activeConversationId}
                conversation={conversation}
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))
          ) : (
            <p className="px-2 text-muted-foreground text-xs leading-5">
              Belum ada session tersimpan.
            </p>
          )}
        </SidebarSection>
      </div>

      <AccountFooter user={user} />
    </aside>
  )
}

function ChatHeader({
  activeConversation,
  mode,
  onOpenSidebar,
  selectedAnalysis,
}: {
  activeConversation?: JobseekerChatbotConversationSummary | null
  mode: JobseekerChatbotMode
  onOpenSidebar: () => void
  selectedAnalysis?: AnalysisHistoryItem
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-border border-b bg-background/95 px-3 backdrop-blur sm:px-4">
      <button
        aria-label="Buka sidebar chatbot"
        className={cn(
          buttonVariants({ size: "icon", variant: "ghost" }),
          "lg:hidden"
        )}
        onClick={onOpenSidebar}
        type="button"
      >
        <MenuIcon aria-hidden="true" className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm">
          {activeConversation?.title || "Chat baru"}
        </p>
        <p className="truncate text-muted-foreground text-xs">
          {mode === "analysis" && selectedAnalysis
            ? `Context: ${selectedAnalysis.topRole || selectedAnalysis.analysisId}`
            : "Chat langsung seputar CV, karier, job match, dan interview"}
        </p>
      </div>
    </header>
  )
}

function EmptyChat({
  mode,
  onPrompt,
}: {
  mode: JobseekerChatbotMode
  onPrompt: (prompt: string) => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10 text-center">
      <div className="flex max-w-2xl flex-col items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-xl border border-border bg-card text-primary">
          <SparklesIcon aria-hidden="true" className="size-5" />
        </span>
        <h1 className="font-heading text-3xl leading-tight sm:text-5xl">
          Apa yang ingin kamu siapkan?
        </h1>
        <p className="max-w-xl text-muted-foreground text-sm leading-6">
          Tanyakan CV, skill gap, job match, strategi karier, atau persiapan
          interview. Session akan tersimpan otomatis.
        </p>
      </div>
      <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-3">
        {QUICK_PROMPTS[mode].map((prompt) => (
          <button
            className="min-h-24 rounded-lg border border-border bg-card p-3 text-left text-sm leading-6 transition-colors hover:bg-muted"
            key={prompt}
            onClick={() => onPrompt(prompt)}
            type="button"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChatComposer({
  disabled,
  draft,
  loading,
  onChange,
  onSubmit,
  textareaRef,
}: {
  disabled: boolean
  draft: string
  loading: boolean
  onChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}) {
  return (
    <div className="shrink-0 bg-background px-3 pb-3 sm:px-4 sm:pb-4">
      <form
        className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-[0_16px_44px_-36px_rgba(59,39,27,0.45)]"
        onSubmit={onSubmit}
      >
        <label className="sr-only" htmlFor="chatbot-message">
          Pesan chatbot
        </label>
        <textarea
          className="max-h-44 min-h-11 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-muted-foreground"
          id="chatbot-message"
          maxLength={1200}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
          placeholder="Message CareerMatch..."
          ref={textareaRef}
          rows={1}
          value={draft}
        />
        <Button
          aria-label="Kirim pesan"
          className="size-10 rounded-xl"
          disabled={disabled}
          size="icon"
          type="submit"
        >
          {loading ? <LoadingDots /> : <SendIcon aria-hidden="true" />}
        </Button>
      </form>
      <p className="mx-auto mt-2 max-w-3xl text-center text-muted-foreground text-xs">
        CareerMatch Chatbot hanya menjawab konteks CV, job match, skill gap,
        karier, dan interview.
      </p>
    </div>
  )
}

function ChatLoadingState({ compact }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-2xl flex-col gap-4",
        !compact && "flex-1 justify-center"
      )}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-accent-foreground">
          <BotIcon aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card px-4 py-4">
          <div className="flex items-center gap-3 text-muted-foreground text-sm">
            <LoadingDots />
            <span>Memuat session chat...</span>
          </div>
          <Skeleton className="mt-4 h-3 w-5/6" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
      </div>
    </div>
  )
}

function ChatMessageRow({
  message,
  shouldReduceMotion,
  transition,
}: {
  message: LocalMessage
  shouldReduceMotion: boolean | null
  transition: {
    duration: number
    ease: readonly [number, number, number, number]
  }
}) {
  const isUser = message.role === "user"

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex min-w-0 gap-3", isUser && "justify-end")}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      transition={transition}
    >
      {!isUser ? <Avatar icon={BotIcon} /> : null}
      <div
        className={cn(
          "min-w-0 max-w-[min(100%,42rem)] rounded-2xl px-4 py-3 text-sm leading-7",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-card"
        )}
      >
        {message.pending ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <LoadingDots />
            <span>{message.content}</span>
          </div>
        ) : isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <SafeMarkdown value={message.content} />
        )}
      </div>
      {isUser ? <Avatar icon={UserRoundIcon} user /> : null}
    </motion.article>
  )
}

function AccountFooter({
  user,
}: {
  user?: {
    email?: string | null
    image?: string | null
    name?: string | null
  } | null
}) {
  const label = user?.name || user?.email || "Jobseeker"
  const email = user?.email || "CareerMatch account"
  const initials = getInitials(label)

  return (
    <div className="shrink-0 border-border border-t p-3">
      <div
        className={cn("flex min-w-0 items-center gap-3 rounded-lg px-2 py-2")}
      >
        {user?.image ? (
          <img
            alt={`Avatar ${label}`}
            className="size-9 shrink-0 rounded-full border border-border object-cover"
            src={user.image}
          />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 font-semibold text-primary text-xs">
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">{label}</p>
          <p className="truncate text-muted-foreground text-xs">{email}</p>
        </div>
      </div>
    </div>
  )
}

function Avatar({
  icon: Icon,
  user,
}: {
  icon: React.ComponentType<{ "aria-hidden": true; className?: string }>
  user?: boolean
}) {
  return (
    <span
      className={cn(
        "mt-1 flex size-8 shrink-0 items-center justify-center rounded-full border",
        user
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-accent-foreground"
      )}
    >
      <Icon aria-hidden={true} className="size-4" />
    </span>
  )
}

function SidebarSection({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <section className="mb-5 min-w-0">
      <h2 className="mb-2 px-2 font-medium text-muted-foreground text-xs uppercase">
        {title}
      </h2>
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
    </section>
  )
}

function ModeOption({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "flex min-h-10 w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted",
        active && "bg-primary/10 text-primary"
      )}
      onClick={onClick}
      type="button"
    >
      <FileSearchIcon aria-hidden="true" className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  )
}

function ConversationButton({
  active,
  conversation,
  onClick,
}: {
  active: boolean
  conversation: JobseekerChatbotConversationSummary
  onClick: () => void
}) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "flex w-full min-w-0 flex-col rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted",
        active && "bg-primary/10 text-primary"
      )}
      onClick={onClick}
      type="button"
    >
      <span className="truncate text-sm">{conversation.title}</span>
      <span className="mt-0.5 flex items-center gap-1 text-muted-foreground text-xs">
        <ClockIcon aria-hidden="true" className="size-3" />
        {formatDate(conversation.updatedAt)}
      </span>
    </button>
  )
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-2">
      {["one", "two", "three"].map((item) => (
        <div key={item}>
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

function LoadingDots() {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1">
      {["a", "b", "c"].map((item, index) => (
        <span
          className="size-1.5 animate-pulse rounded-full bg-current [animation-duration:800ms]"
          key={item}
          style={{ animationDelay: `${index * 140}ms` }}
        />
      ))}
    </span>
  )
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
}

function getInitials(value: string) {
  const source = value.includes("@") ? value.split("@")[0] : value
  const words = source.trim().split(/\s+/).filter(Boolean)

  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("")
  }

  return source.replace(/\s+/g, "").slice(0, 2).toUpperCase() || "JS"
}
