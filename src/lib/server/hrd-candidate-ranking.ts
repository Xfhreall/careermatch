import type { CandidateProfile } from "@/features/cv-analysis/types"

export type CandidateRankingJob = {
  id: string
  minExperienceYears: number
  requiredSkills: string[]
  title: string
}

export type CandidateRankingAnalysis = {
  analysisId: string
  candidateProfile?: CandidateProfile
  createdAt: string
  id: string
  jobseekerId: string
}

export type AnonymousCandidateMatchRow = {
  analysis_result_id: string
  candidate_code: string
  job_vacancy_id: string
  matched_skills: string[]
  match_score: number
  role_title: string
}

type CandidateJobScore = {
  compatibilityScore: number
  experienceMatchScore: number
  matchedSkills: string[]
  skillMatchScore: number
}

export function buildAnonymousCandidateMatchRows(input: {
  analyses: CandidateRankingAnalysis[]
  jobs: CandidateRankingJob[]
}) {
  const latestAnalyses = selectLatestAnalyses(input.analyses)

  return latestAnalyses
    .flatMap((analysis) => {
      const candidateProfile = readCandidateProfile(analysis)

      if (!candidateProfile) {
        return []
      }

      return input.jobs
        .map((job) => {
          const score = scoreCandidateForJob(job, analysis)

          return {
            analysis_result_id: analysis.id,
            candidate_code: createCandidateCode(analysis.analysisId),
            job_vacancy_id: job.id,
            required_skills_count: job.requiredSkills.length,
            matched_skills: score.matchedSkills,
            match_score: Math.round(score.compatibilityScore),
            role_title: job.title,
          }
        })
        .filter(
          (row) =>
            row.matched_skills.length > 0 || row.required_skills_count === 0
        )
        .sort((left, right) => {
          if (right.match_score !== left.match_score) {
            return right.match_score - left.match_score
          }

          return left.role_title.localeCompare(right.role_title)
        })
        .map(({ required_skills_count: _requiredSkillsCount, ...row }) => row)
        .slice(0, 3)
    })
    .sort((left, right) => {
      if (right.match_score !== left.match_score) {
        return right.match_score - left.match_score
      }

      if (left.candidate_code !== right.candidate_code) {
        return left.candidate_code.localeCompare(right.candidate_code)
      }

      return left.role_title.localeCompare(right.role_title)
    })
}

export function scoreCandidateForJob(
  job: CandidateRankingJob,
  analysis: CandidateRankingAnalysis
): CandidateJobScore {
  const candidateProfile = readCandidateProfile(analysis)

  if (!candidateProfile) {
    return {
      compatibilityScore: 0,
      experienceMatchScore: 0,
      matchedSkills: [],
      skillMatchScore: 0,
    }
  }

  const candidateSkills = normalizeSkills(candidateProfile.skills ?? [])
  const requiredSkills = uniqueJobSkills(job.requiredSkills)
  const matchedSkills = requiredSkills.filter((skill) =>
    candidateSkills.includes(normalizeSkill(skill))
  )
  const skillMatchScore =
    requiredSkills.length === 0
      ? 100
      : (matchedSkills.length / requiredSkills.length) * 100
  const experienceMatchScore = calculateExperienceScore(
    candidateProfile.totalExperienceYears ?? 0,
    job.minExperienceYears
  )

  return {
    compatibilityScore: skillMatchScore * 0.7 + experienceMatchScore * 0.3,
    experienceMatchScore,
    matchedSkills,
    skillMatchScore,
  }
}

function selectLatestAnalyses(analyses: CandidateRankingAnalysis[]) {
  const latestByJobseeker = new Map<string, CandidateRankingAnalysis>()

  for (const analysis of analyses) {
    const previous = latestByJobseeker.get(analysis.jobseekerId)

    if (!previous || analysis.createdAt > previous.createdAt) {
      latestByJobseeker.set(analysis.jobseekerId, analysis)
    }
  }

  return [...latestByJobseeker.values()]
}

function readCandidateProfile(analysis: CandidateRankingAnalysis) {
  const profile = analysis.candidateProfile

  if (!profile) {
    return null
  }

  const skills = normalizeSkills(profile.skills ?? [])

  if (skills.length === 0) {
    return null
  }

  return {
    skills,
    totalExperienceYears: Number(profile.totalExperienceYears ?? 0),
  }
}

function calculateExperienceScore(
  candidateYears: number,
  requiredYears: number
): number {
  if (requiredYears <= 0) {
    return 100
  }

  if (candidateYears >= requiredYears) {
    return 100
  }

  if (candidateYears >= requiredYears * 0.75) {
    return 70
  }

  if (candidateYears >= requiredYears * 0.5) {
    return 40
  }

  return 0
}

function normalizeSkills(skills: string[]) {
  return [...new Set(skills.map(normalizeSkill).filter(Boolean))]
}

function normalizeSkill(skill: string) {
  return skill.trim().toLowerCase()
}

function uniqueJobSkills(skills: string[]) {
  const seen = new Set<string>()

  return skills.filter((skill) => {
    const normalized = normalizeSkill(skill)

    if (!normalized || seen.has(normalized)) {
      return false
    }

    seen.add(normalized)
    return true
  })
}

function createCandidateCode(analysisId: string) {
  const tokens = analysisId
    .split(/[^a-zA-Z0-9]+/)
    .map((token) => token.trim().toUpperCase())
    .filter(Boolean)
  const lastToken = tokens.at(-1) ?? analysisId.replace(/[^a-zA-Z0-9]/g, "")

  return `Candidate AN${lastToken.slice(0, 8)}`
}
