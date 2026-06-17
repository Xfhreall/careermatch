import { describe, expect, it } from "vitest"

import { normalizeAnalysisResponse } from "@/features/cv-analysis/normalize"
import { buildAnalyzeCvFormData } from "@/shared/repository/cv-analysis/action"

describe("CV analysis request payload", () => {
  it("includes the uploaded CV and applied job fields expected by the webhook", () => {
    const file = new File(["CV content"], "candidate.pdf", {
      type: "application/pdf",
    })

    const formData = buildAnalyzeCvFormData(
      {
        file,
        jobDescription: "Analyze customer dashboards and build weekly reports.",
        jobTitle: "Data Analyst",
      },
      "session-123"
    )

    expect(formData.get("cv")).toBe(file)
    expect(formData.get("cv_file")).toBe(file)
    expect(formData.get("filename")).toBe("candidate.pdf")
    expect(formData.get("job_title")).toBe("Data Analyst")
    expect(formData.get("job_description")).toBe(
      "Analyze customer dashboards and build weekly reports."
    )
    expect(formData.get("session_id")).toBe("session-123")
  })
})

describe("normalizeAnalysisResponse", () => {
  it("normalizes the single top_match shape used by the HTML webhook", () => {
    const result = normalizeAnalysisResponse({
      top_match: {
        company: "CareerMatch",
        compatibility_score: 91,
        experience_match_score: 76,
        job_title: "Backend Engineer",
        matched_skills: ["Node.js", "PostgreSQL"],
        required_years: 3,
        skill_gap: ["System design"],
        skill_match_score: 88,
      },
    })

    expect(result.jobMatches).toHaveLength(1)
    expect(result.jobMatches[0]).toMatchObject({
      company: "CareerMatch",
      compatibilityScore: 91,
      experienceMatchScore: 76,
      jobTitle: "Backend Engineer",
      matchedSkills: ["Node.js", "PostgreSQL"],
      requiredYears: 3,
      skillGap: ["System design"],
      skillMatchScore: 88,
    })
  })

  it("preserves the applied job context beside the webhook result", () => {
    const result = normalizeAnalysisResponse(
      {
        job_matches: [
          {
            company: "CareerMatch",
            compatibility_score: 86,
            job_title: "Data Analyst",
          },
        ],
      },
      {
        appliedJob: {
          jobDescription:
            "Analyze customer dashboards and build weekly reports.",
          jobTitle: "Data Analyst",
        },
      }
    )

    expect(result.appliedJob).toEqual({
      jobDescription: "Analyze customer dashboards and build weekly reports.",
      jobTitle: "Data Analyst",
    })
  })
})
