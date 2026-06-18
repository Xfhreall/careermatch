import { beforeEach, describe, expect, it, vi } from "vitest"

const { from, insertCalls, rowsByTable } = vi.hoisted(() => {
  const rows = new Map<string, Array<Record<string, unknown>>>()
  const inserts: Array<{
    payload: Record<string, unknown>
    table: string
  }> = []

  return {
    from: vi.fn((table: string) => createQuery(table, rows, inserts)),
    insertCalls: inserts,
    rowsByTable: rows,
  }
})

vi.mock("@/lib/server/supabase", () => ({
  getSupabaseAdmin: () => ({ from }),
}))

import {
  createHrdJob,
  getHrdDashboard,
  getSuperadminSnapshot,
} from "@/shared/repository/careermatch/action"

describe("getSuperadminSnapshot", () => {
  beforeEach(() => {
    from.mockClear()
    insertCalls.length = 0
    rowsByTable.clear()
    rowsByTable.set("job_vacancies", [
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
      {
        label: "n8n workflow success rate",
        title: "n8n success rate",
        value: "98.4%",
      },
      {
        label: "tokens spent today",
        title: "Token spent",
        value: "1.2M",
      },
      {
        label: "total AI usage cost",
        title: "AI cost",
        value: "$24.50",
      },
    ])
    expect(from).not.toHaveBeenCalledWith("workflow_metrics")
  })

  it("surfaces matched candidate contact details on the HRD dashboard", async () => {
    rowsByTable.set("job_vacancies", [createJob("job-1", "active")])
    rowsByTable.set("analysis_results", [
      {
        analysis_id: "analysis-1",
        created_at: "2026-06-17T10:00:00.000Z",
        id: "analysis-row-1",
        jobseeker_id: "user-1",
        response_payload: {
          candidateProfile: {
            skills: ["React", "TypeScript"],
            totalExperienceYears: 3,
          },
        },
      },
    ])
    rowsByTable.set("users", [
      {
        email: "candidate@example.com",
        id: "user-1",
        name: "Candidate One",
      },
    ])

    const dashboard = await getHrdDashboard(
      {
        companyId: "company-1",
        email: "hrd@example.com",
        id: "hrd-1",
      },
      "hrd"
    )

    expect(dashboard.anonymousCandidates).toEqual([
      {
        candidate: "Candidate AN1",
        email: "candidate@example.com",
        jobId: "job-1",
        matchedSkills: ["TypeScript"],
        name: "Candidate One",
        role: "Job job-1",
        score: "100%",
        scoreValue: 100,
        skills: "TypeScript",
      },
    ])
  })

  it("surfaces nested raw webhook candidate profiles on the HRD dashboard", async () => {
    rowsByTable.set("job_vacancies", [createJob("job-1", "active")])
    rowsByTable.set("analysis_results", [
      {
        analysis_id: "analysis-raw-profile",
        created_at: "2026-06-17T10:00:00.000Z",
        id: "analysis-row-raw-profile",
        jobseeker_id: "user-1",
        response_payload: {
          rawResponse: {
            candidate_profile: {
              skills: ["TypeScript", "React"],
              total_experience_years: 3,
            },
            unblinded_cv: {
              email: "raw-profile@example.com",
              name: "Raw Profile Candidate",
            },
          },
        },
      },
    ])
    rowsByTable.set("users", [])

    const dashboard = await getHrdDashboard(
      {
        companyId: "company-1",
        email: "hrd@example.com",
        id: "hrd-1",
      },
      "hrd"
    )

    expect(dashboard.anonymousCandidates).toEqual([
      {
        candidate: "Candidate ANPROFILE",
        email: "raw-profile@example.com",
        jobId: "job-1",
        matchedSkills: ["TypeScript"],
        name: "Raw Profile Candidate",
        role: "Job job-1",
        score: "100%",
        scoreValue: 100,
        skills: "TypeScript",
      },
    ])
  })

  it("surfaces top-level raw webhook candidate profiles on the HRD dashboard", async () => {
    rowsByTable.set("job_vacancies", [createJob("job-1", "active")])
    rowsByTable.set("analysis_results", [
      {
        analysis_id: "analysis-top-level-profile",
        created_at: "2026-06-17T10:00:00.000Z",
        id: "analysis-row-top-level-profile",
        jobseeker_id: "user-1",
        response_payload: {
          candidate_profile: {
            skills: "TypeScript, React",
            total_experience_years: "3",
          },
          unblinded_cv: {
            email: "top-level@example.com",
            name: "Top Level Candidate",
          },
        },
      },
    ])
    rowsByTable.set("users", [])

    const dashboard = await getHrdDashboard(
      {
        companyId: "company-1",
        email: "hrd@example.com",
        id: "hrd-1",
      },
      "hrd"
    )

    expect(dashboard.anonymousCandidates).toEqual([
      {
        candidate: "Candidate ANPROFILE",
        email: "top-level@example.com",
        jobId: "job-1",
        matchedSkills: ["TypeScript"],
        name: "Top Level Candidate",
        role: "Job job-1",
        score: "100%",
        scoreValue: 100,
        skills: "TypeScript",
      },
    ])
  })

  it("stores job content from the description when creating a lowongan", async () => {
    rowsByTable.set("companies", [
      {
        id: "company-1",
        name: "Company One",
      },
    ])

    await createHrdJob(
      {
        companyId: "company-1",
        email: "hrd@example.com",
        id: "hrd-1",
      },
      {
        description: "  Build better hiring tools  ",
        minYears: 2,
        skills: ["React", "TypeScript"],
        status: "active",
        title: "Frontend Engineer",
      }
    )

    expect(insertCalls).toHaveLength(1)
    expect(insertCalls[0]).toEqual({
      payload: expect.objectContaining({
        company_name: "Company One",
        content: "Build better hiring tools",
        job_description: "Build better hiring tools",
        metadata: expect.objectContaining({
          company_id: "company-1",
          company_name: "Company One",
          created_by: "hrd-1",
          embedding_status: "pending",
          job_id: expect.stringMatching(/^JOB-\d+$/),
          min_experience_years: 2,
          min_years_experience: 2,
          required_skills: ["React", "TypeScript"],
          role_name: "Frontend Engineer",
          status: "active",
        }),
        requirements: ["React", "TypeScript"],
        role_name: "Frontend Engineer",
      }),
      table: "job_vacancies",
    })
  })
})

function createQuery(
  table: string,
  rows: Map<string, Array<Record<string, unknown>>>,
  insertCalls: Array<{ payload: Record<string, unknown>; table: string }>
) {
  const result = {
    data: rows.get(table) ?? [],
    error: null,
  }
  type Query = Promise<typeof result> & {
    insert: ReturnType<typeof vi.fn>
    eq: ReturnType<typeof vi.fn>
    in: ReturnType<typeof vi.fn>
    limit: ReturnType<typeof vi.fn>
    order: ReturnType<typeof vi.fn>
    select: ReturnType<typeof vi.fn>
  }
  const query = Promise.resolve(result) as Query
  query.insert = vi.fn((payload: Record<string, unknown>) => {
    insertCalls.push({ payload, table })
    return Promise.resolve({ data: null, error: null })
  })
  query.in = vi.fn(() => query)
  query.eq = vi.fn(() => query)
  query.limit = vi.fn(() => query)
  query.order = vi.fn(() => query)
  query.select = vi.fn(() => query)

  return query
}

function createJob(id: string, status: string) {
  return {
    company_name: "Company One",
    created_at: "2026-06-12T00:00:00.000Z",
    job_description: "Job description",
    id,
    requirements: ["TypeScript"],
    role_name: `Job ${id}`,
    metadata: {
      company_id: "company-1",
      embedding_status: "synced",
      min_experience_years: 1,
      status,
    },
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
