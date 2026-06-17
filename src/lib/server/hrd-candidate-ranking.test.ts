import { describe, expect, it } from "vitest"

import {
  buildAnonymousCandidateMatchRows,
  scoreCandidateForJob,
} from "./hrd-candidate-ranking"

describe("scoreCandidateForJob", () => {
  it("follows the PRD 70/30 scoring formula and experience thresholds", () => {
    const result = scoreCandidateForJob(
      {
        id: "job-frontend",
        minExperienceYears: 4,
        requiredSkills: ["React", "TypeScript", "GraphQL"],
        title: "Frontend Engineer",
      },
      {
        analysisId: "analysis-1",
        candidateProfile: {
          skills: ["React", "TypeScript", "Testing"],
          totalExperienceYears: 3,
        },
        createdAt: "2026-06-17T10:00:00.000Z",
        id: "analysis-row-1",
        jobseekerId: "user-1",
      }
    )

    expect(result.matchedSkills).toEqual(["React", "TypeScript"])
    expect(result.skillMatchScore).toBeCloseTo(66.67, 2)
    expect(result.experienceMatchScore).toBe(70)
    expect(result.compatibilityScore).toBeCloseTo(67.67, 2)
  })

  it("deduplicates repeated required skills before calculating the match score", () => {
    const result = scoreCandidateForJob(
      {
        id: "job-duplicate-skills",
        minExperienceYears: 2,
        requiredSkills: ["React", "React", "TypeScript"],
        title: "Frontend Engineer",
      },
      {
        analysisId: "analysis-duplicate-skills",
        candidateProfile: {
          skills: ["React", "TypeScript"],
          totalExperienceYears: 3,
        },
        createdAt: "2026-06-17T11:00:00.000Z",
        id: "analysis-row-duplicate-skills",
        jobseekerId: "user-6",
      }
    )

    expect(result.matchedSkills).toEqual(["React", "TypeScript"])
    expect(result.skillMatchScore).toBe(100)
    expect(result.compatibilityScore).toBe(100)
  })
})

describe("buildAnonymousCandidateMatchRows", () => {
  it("uses only the latest analysis per candidate and ranks against current jobs", () => {
    const rows = buildAnonymousCandidateMatchRows({
      analyses: [
        {
          analysisId: "analysis-old",
          candidateProfile: {
            skills: ["React"],
            totalExperienceYears: 1,
          },
          createdAt: "2026-06-16T08:00:00.000Z",
          id: "analysis-row-old",
          jobseekerId: "user-1",
        },
        {
          analysisId: "analysis-new",
          candidateProfile: {
            skills: ["React", "TypeScript", "Testing"],
            totalExperienceYears: 2,
          },
          createdAt: "2026-06-17T08:00:00.000Z",
          id: "analysis-row-new",
          jobseekerId: "user-1",
        },
        {
          analysisId: "analysis-backend",
          candidateProfile: {
            skills: ["Node.js", "PostgreSQL", "Redis"],
            totalExperienceYears: 5,
          },
          createdAt: "2026-06-17T09:00:00.000Z",
          id: "analysis-row-backend",
          jobseekerId: "user-2",
        },
      ],
      jobs: [
        {
          id: "job-frontend",
          minExperienceYears: 3,
          requiredSkills: ["React", "TypeScript"],
          title: "Frontend Engineer",
        },
        {
          id: "job-backend",
          minExperienceYears: 4,
          requiredSkills: ["Node.js", "PostgreSQL"],
          title: "Backend Engineer",
        },
        {
          id: "job-qa",
          minExperienceYears: 5,
          requiredSkills: ["Testing"],
          title: "QA Engineer",
        },
      ],
    })

    expect(rows).toEqual([
      {
        analysis_result_id: "analysis-row-backend",
        candidate_code: "Candidate ANBACKEND",
        job_vacancy_id: "job-backend",
        matched_skills: ["Node.js", "PostgreSQL"],
        match_score: 100,
        role_title: "Backend Engineer",
      },
      {
        analysis_result_id: "analysis-row-new",
        candidate_code: "Candidate ANNEW",
        job_vacancy_id: "job-frontend",
        matched_skills: ["React", "TypeScript"],
        match_score: 82,
        role_title: "Frontend Engineer",
      },
      {
        analysis_result_id: "analysis-row-new",
        candidate_code: "Candidate ANNEW",
        job_vacancy_id: "job-qa",
        matched_skills: ["Testing"],
        match_score: 70,
        role_title: "QA Engineer",
      },
    ])
  })

  it("skips analyses without a usable candidate profile", () => {
    const rows = buildAnonymousCandidateMatchRows({
      analyses: [
        {
          analysisId: "analysis-empty",
          candidateProfile: {
            skills: [],
            totalExperienceYears: 0,
          },
          createdAt: "2026-06-17T08:00:00.000Z",
          id: "analysis-row-empty",
          jobseekerId: "user-3",
        },
        {
          analysisId: "analysis-missing",
          createdAt: "2026-06-17T09:00:00.000Z",
          id: "analysis-row-missing",
          jobseekerId: "user-4",
        },
      ],
      jobs: [
        {
          id: "job-frontend",
          minExperienceYears: 3,
          requiredSkills: ["React", "TypeScript"],
          title: "Frontend Engineer",
        },
      ],
    })

    expect(rows).toEqual([])
  })

  it("keeps jobs with no required skills when the candidate meets the experience requirement", () => {
    const rows = buildAnonymousCandidateMatchRows({
      analyses: [
        {
          analysisId: "analysis-generalist",
          candidateProfile: {
            skills: ["Communication"],
            totalExperienceYears: 4,
          },
          createdAt: "2026-06-17T10:00:00.000Z",
          id: "analysis-row-generalist",
          jobseekerId: "user-5",
        },
      ],
      jobs: [
        {
          id: "job-generalist",
          minExperienceYears: 2,
          requiredSkills: [],
          title: "Generalist Recruiter",
        },
      ],
    })

    expect(rows).toEqual([
      {
        analysis_result_id: "analysis-row-generalist",
        candidate_code: "Candidate ANGENERALI",
        job_vacancy_id: "job-generalist",
        matched_skills: [],
        match_score: 100,
        role_title: "Generalist Recruiter",
      },
    ])
  })
})
