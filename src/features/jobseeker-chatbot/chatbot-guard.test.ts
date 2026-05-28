import { describe, expect, it } from "vitest"

import {
  assessChatbotPrompt,
  CHATBOT_HISTORY_LIMIT,
  CHATBOT_MAX_MESSAGE_LENGTH,
  extractChatbotAnswer,
  sanitizeChatbotHistory,
} from "./chatbot-guard"

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
