// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { HrdDashboardPayload } from "@/shared/repository/platform/action"

const { createHrdJob, fetchHrdDashboard, refreshHrdEmbeddings } = vi.hoisted(
  () => ({
    createHrdJob: vi.fn(),
    fetchHrdDashboard: vi.fn(),
    refreshHrdEmbeddings: vi.fn(),
  })
)

vi.mock("@/shared/repository/platform/action", () => ({
  createHrdJob,
  fetchHrdDashboard,
  refreshHrdEmbeddings,
}))

vi.mock("sonner", () => ({ toast: { info: vi.fn(), success: vi.fn() } }))

import { HrdPortalContainer } from "@/features/dashboard/hrd/containers/PortalContainer"

describe("HrdPortalContainer candidate matches", () => {
  beforeEach(() => {
    createHrdJob.mockReset()
    fetchHrdDashboard.mockReset()
    refreshHrdEmbeddings.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it("shows matched candidate summary and role-level signals", async () => {
    fetchHrdDashboard.mockResolvedValue({
      anonymousCandidates: [
        {
          candidate: "Candidate ANPROFILE",
          email: "candidate@example.com",
          jobId: "job-frontend",
          matchedSkills: ["React", "TypeScript"],
          name: "Candidate One",
          role: "Frontend Engineer",
          score: "100%",
          scoreValue: 100,
          skills: "React, TypeScript",
        },
      ],
      jobs: [
        {
          candidates: 1,
          company: "Company One",
          description: "Build product UI",
          embedding: "Synced",
          id: "job-frontend",
          minYears: 2,
          skills: ["React", "TypeScript"],
          status: "Active",
          title: "Frontend Engineer",
        },
      ],
    } satisfies HrdDashboardPayload)

    renderPortal()

    expect(await screen.findByText("1 kandidat cocok")).toBeTruthy()
    expect(screen.getAllByText("Top match 100%")).toHaveLength(2)
    expect(screen.getByText("Candidate One")).toBeTruthy()
    expect(screen.getAllByText("React").length).toBeGreaterThan(0)
    expect(screen.getAllByText("TypeScript").length).toBeGreaterThan(0)
  })
})

function renderPortal() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <HrdPortalContainer />
    </QueryClientProvider>
  )

  return queryClient
}
