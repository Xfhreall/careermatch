import { describe, expect, it } from "vitest"

import {
  assessChatbotPrompt,
  CHATBOT_HISTORY_LIMIT,
  CHATBOT_MAX_MESSAGE_LENGTH,
  extractChatbotAnswer,
  sanitizeChatbotHistory,
} from "@/features/jobseeker-chatbot/chatbot-guard"

describe("jobseeker chatbot guard", () => {
  it("allows career and CV prompts above the relevance threshold", () => {
    const result = assessChatbotPrompt({
      hasAnalysisContext: false,
      message:
        "Tolong bantu saya memperbaiki CV untuk role frontend developer dan persiapan interview.",
    })

    expect(result.allowed).toBe(true)
    expect(result.score).toBeGreaterThanOrEqual(result.threshold)
  })

  it("allows short follow-up prompts when analysis context is selected", () => {
    const result = assessChatbotPrompt({
      hasAnalysisContext: true,
      message: "Jelaskan skill gap ini dengan prioritas belajar.",
    })

    expect(result.allowed).toBe(true)
  })

  it("allows interactive replies after a chatbot session has started", () => {
    expect(
      assessChatbotPrompt({
        hasAnalysisContext: false,
        hasConversationContext: true,
        message: "mulai",
      }).allowed
    ).toBe(true)

    const result = assessChatbotPrompt({
      hasAnalysisContext: false,
      hasConversationContext: true,
      message:
        "Di situasi seperti itu saya akan tetap tenang, menghubungi pihak terkait, lalu menyelesaikan tugas yang paling prioritas.",
    })

    expect(result.allowed).toBe(true)
    expect(result.score).toBeGreaterThanOrEqual(result.threshold)
  })

  it("allows work experience narratives during active interview practice", () => {
    const result = assessChatbotPrompt({
      hasAnalysisContext: false,
      hasConversationContext: true,
      message:
        "Saya pernah bertanggung jawab menyelesaikan tugas dengan deadline ketat bersama tim kecil, lalu membagi prioritas agar hasilnya tetap selesai tepat waktu.",
    })

    expect(result.allowed).toBe(true)
  })

  it("can disable topical guard while keeping basic input validation", () => {
    expect(
      assessChatbotPrompt({
        guardEnabled: false,
        hasAnalysisContext: false,
        message: "Berikan resep makan malam sederhana.",
      }).allowed
    ).toBe(true)

    expect(
      assessChatbotPrompt({
        guardEnabled: false,
        hasAnalysisContext: false,
        message: " ",
      }).allowed
    ).toBe(false)
  })

  it("blocks unrelated prompts before they reach the webhook", () => {
    const result = assessChatbotPrompt({
      hasAnalysisContext: false,
      message: "Berikan prediksi pertandingan sepak bola malam ini.",
    })

    expect(result.allowed).toBe(false)
    expect(result.reason).toContain("CareerMatch")
  })

  it("enforces message length and trims conversation history", () => {
    const longMessage = "a".repeat(CHATBOT_MAX_MESSAGE_LENGTH + 1)
    expect(
      assessChatbotPrompt({ hasAnalysisContext: false, message: longMessage })
        .allowed
    ).toBe(false)

    const history = Array.from(
      { length: CHATBOT_HISTORY_LIMIT + 4 },
      (_, i) => ({
        content: `message ${i}`,
        role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      })
    )

    expect(sanitizeChatbotHistory(history)).toHaveLength(CHATBOT_HISTORY_LIMIT)
    expect(sanitizeChatbotHistory(history)[0]?.content).toBe("message 4")
  })

  it("extracts assistant text from common webhook response shapes", () => {
    expect(extractChatbotAnswer({ answer: "Siapkan portfolio ringkas." })).toBe(
      "Siapkan portfolio ringkas."
    )
    expect(extractChatbotAnswer([{ output: "Latih STAR interview." }])).toBe(
      "Latih STAR interview."
    )
    expect(extractChatbotAnswer("Gunakan CV terbaru.")).toBe(
      "Gunakan CV terbaru."
    )
  })
})
