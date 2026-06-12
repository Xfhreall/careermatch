import { beforeEach, describe, expect, it, vi } from "vitest"

const { from, rowsByTable } = vi.hoisted(() => {
  const rows = new Map<string, Array<Record<string, unknown>>>()

  return {
    from: vi.fn((table: string) => createQuery(table, rows)),
    rowsByTable: rows,
  }
})

vi.mock("./supabase", () => ({
  getSupabaseAdmin: () => ({ from }),
}))

import { getSuperadminSnapshot } from "./careermatch-repository"

describe("getSuperadminSnapshot", () => {
  beforeEach(() => {
    from.mockClear()
    rowsByTable.clear()
    rowsByTable.set("job_postings", [
      createJob("job-1", "active"),
      createJob("job-2", "draft"),
      createJob("job-3", "active"),
    ])
    rowsByTable.set("companies", [
      {
        id: "company-1",
        name: "Company One",
      },
    ])
    rowsByTable.set("anonymous_candidate_matches", [])
    rowsByTable.set("users", [
      createUser("user-1"),
      createUser("user-2"),
      createUser("user-3"),
    ])
    rowsByTable.set("hrd_approval_requests", [
      createApproval("approval-1", "pending"),
      createApproval("approval-2", "approved"),
    ])
    rowsByTable.set("analysis_jobs", [
      { id: "analysis-1", status: "completed" },
      { id: "analysis-2", status: "failed" },
      { id: "analysis-3", status: "completed" },
    ])
    rowsByTable.set("workflow_metrics", [
      {
        key: "ai_cost_weekly",
        label: "this week",
        title: "AI cost",
        value: "$42.80",
      },
    ])
    rowsByTable.set("scoring_configs", [])
    rowsByTable.set("model_configs", [])
    rowsByTable.set("platform_settings", [])
    rowsByTable.set("audit_events", [])
  })

  it("derives monitoring cards from live platform records", async () => {
    const snapshot = await getSuperadminSnapshot()

    expect(snapshot.monitoringCards).toEqual([
      {
        label: "registered accounts",
        title: "Users",
        value: "3",
      },
      {
        label: "published positions",
        title: "Active jobs",
        value: "2",
      },
      {
        label: "completed analyses",
        title: "CV analyses",
        value: "2",
      },
      {
        label: "pending review",
        title: "HRD approvals",
        value: "1",
      },
    ])
    expect(from).not.toHaveBeenCalledWith("workflow_metrics")
  })
})

function createQuery(
  table: string,
  rows: Map<string, Array<Record<string, unknown>>>
) {
  const result = {
    data: rows.get(table) ?? [],
    error: null,
  }
  type Query = Promise<typeof result> & {
    in: ReturnType<typeof vi.fn>
    limit: ReturnType<typeof vi.fn>
    order: ReturnType<typeof vi.fn>
    select: ReturnType<typeof vi.fn>
  }
  const query = Promise.resolve(result) as Query
  query.in = vi.fn(() => query)
  query.limit = vi.fn(() => query)
  query.order = vi.fn(() => query)
  query.select = vi.fn(() => query)

  return query
}

function createJob(id: string, status: string) {
  return {
    company_id: "company-1",
    created_at: "2026-06-12T00:00:00.000Z",
    description: "Job description",
    embedding_status: "synced",
    id,
    min_experience_years: 1,
    required_skills: ["TypeScript"],
    status,
    title: `Job ${id}`,
  }
}

function createUser(id: string) {
  return {
    email: `${id}@example.com`,
    id,
    name: `User ${id}`,
    role: "jobseeker",
    status: "active",
  }
}

function createApproval(id: string, status: string) {
  return {
    company_name: `Company ${id}`,
    created_at: "2026-06-12T00:00:00.000Z",
    email: `${id}@example.com`,
    id,
    status,
  }
}
