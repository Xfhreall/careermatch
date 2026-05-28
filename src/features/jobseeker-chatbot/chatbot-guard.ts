export const CHATBOT_HISTORY_LIMIT = 8
export const CHATBOT_MAX_MESSAGE_LENGTH = 1200
export const CHATBOT_DIRECT_THRESHOLD = 0.18
export const CHATBOT_CONTEXT_THRESHOLD = 0.12

export type ChatbotMessageRole = "assistant" | "user"

export type ChatbotHistoryMessage = {
  content: string
  role: ChatbotMessageRole
}

export type ChatbotPromptAssessment = {
  allowed: boolean
  reason?: string
  score: number
  threshold: number
}

const CAREER_TERMS = [
  "analisis",
  "application",
  "apply",
  "career",
  "career coaching",
  "certification",
  "cv",
  "developer",
  "experience",
  "frontend",
  "hrd",
  "interview",
  "job",
  "karier",
  "kandidat",
  "kerja",
  "lamaran",
  "linkedin",
  "lowongan",
  "match",
  "pekerjaan",
  "pengalaman",
  "portfolio",
  "posisi",
  "project",
  "recruiter",
  "resume",
  "role",
  "salary",
  "skill",
  "skill gap",
  "star",
  "wawancara",
]

const CONTEXT_FOLLOW_UP_TERMS = [
  "apa",
  "bagaimana",
  "berdasarkan",
  "detail",
  "ini",
  "jelaskan",
  "kenapa",
  "prioritas",
  "rekomendasi",
  "saran",
  "tersebut",
  "tolong",
]

const BLOCKED_TOPIC_TERMS = [
  "crypto",
  "judi",
  "politik",
  "prediksi pertandingan",
  "resep",
  "saham",
  "sepak bola",
  "taruhan",
]

const RESPONSE_KEYS = [
  "answer",
  "assistant",
  "assistant_response",
  "assistantResponse",
  "chatbot_response",
  "chatbotResponse",
  "message",
  "output",
  "response",
  "text",
] as const

export function assessChatbotPrompt({
  hasAnalysisContext,
  message,
}: {
  hasAnalysisContext: boolean
  message: string
}): ChatbotPromptAssessment {
  const normalized = normalizeText(message)
  const threshold = hasAnalysisContext
    ? CHATBOT_CONTEXT_THRESHOLD
    : CHATBOT_DIRECT_THRESHOLD

  if (!normalized) {
    return {
      allowed: false,
      reason: "Tulis pertanyaan terlebih dahulu.",
      score: 0,
      threshold,
    }
  }

  if (message.length > CHATBOT_MAX_MESSAGE_LENGTH) {
    return {
      allowed: false,
      reason: `Pertanyaan terlalu panjang. Maksimal ${CHATBOT_MAX_MESSAGE_LENGTH} karakter.`,
      score: 0,
      threshold,
    }
  }

  if (containsAny(normalized, BLOCKED_TOPIC_TERMS)) {
    return {
      allowed: false,
      reason:
        "Chatbot CareerMatch hanya membantu topik CV, job match, skill gap, karier, dan interview.",
      score: 0,
      threshold,
    }
  }

  const careerScore = scoreTerms(normalized, CAREER_TERMS)
  const followUpScore = hasAnalysisContext
    ? scoreTerms(normalized, CONTEXT_FOLLOW_UP_TERMS) * 0.7
    : 0
  const score = Math.min(1, careerScore + followUpScore)

  return {
    allowed: score >= threshold,
    reason:
      score >= threshold
        ? undefined
        : "Pertanyaan di luar konteks CareerMatch. Tanyakan seputar CV, job match, skill gap, karier, atau interview.",
    score,
    threshold,
  }
}

export function sanitizeChatbotHistory(
  history: ChatbotHistoryMessage[]
): ChatbotHistoryMessage[] {
  return history
    .filter(
      (item) =>
        (item.role === "assistant" || item.role === "user") &&
        item.content.trim().length > 0
    )
    .slice(-CHATBOT_HISTORY_LIMIT)
    .map((item) => ({
      content: item.content.trim().slice(0, CHATBOT_MAX_MESSAGE_LENGTH),
      role: item.role,
    }))
}

export function extractChatbotAnswer(payload: unknown): string {
  const readable = findReadableResponse(payload)

  if (readable) {
    return readable
  }

  if (typeof payload === "string") {
    return payload.trim()
  }

  return ""
}

function findReadableResponse(value: unknown): string {
  if (typeof value === "string") {
    return value.trim()
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = findReadableResponse(item)
      if (nested) {
        return nested
      }
    }

    return ""
  }

  if (!value || typeof value !== "object") {
    return ""
  }

  const record = value as Record<string, unknown>

  for (const key of RESPONSE_KEYS) {
    const nested = findReadableResponse(record[key])
    if (nested) {
      return nested
    }
  }

  return ""
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim()
}

function containsAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term))
}

function scoreTerms(value: string, terms: string[]) {
  const matched = terms.filter((term) => value.includes(term)).length
  const wordCount = Math.max(1, value.split(" ").length)

  return Math.min(1, matched / Math.min(8, wordCount))
}
