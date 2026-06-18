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
  candidateEmail?: string | null
  candidateName?: string | null
  createdAt: string
  id: string
  jobseekerId: string
  responsePayload?: Record<string, unknown> | null
}

export type AnonymousCandidateMatchRow = {
  analysis_result_id: string
  candidate_code: string
  candidate_email: string
  candidate_name: string
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
            candidate_email: candidateProfile.candidateEmail,
            candidate_name: candidateProfile.candidateName,
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
  const responsePayload = analysis.responsePayload
  const rawResponse = isRecord(responsePayload?.rawResponse)
    ? responsePayload.rawResponse
    : null
  const profile =
    analysis.candidateProfile ??
    readCandidateProfileValue(responsePayload) ??
    readCandidateProfileValue(rawResponse)

  if (!profile) {
    return null
  }

  const skills = normalizeSkills(profile.skills ?? [])

  if (skills.length === 0) {
    return null
  }

  const contact = readCandidateContact(analysis)

  return {
    candidateEmail: contact.email,
    candidateName: contact.name,
    skills,
    totalExperienceYears: Number(profile.totalExperienceYears ?? 0),
  }
}

function readCandidateProfileValue(value: unknown): CandidateProfile | null {
  if (!isRecord(value)) {
    return null
  }

  const profileValue =
    value.candidate_profile ?? value.candidateProfile ?? value.candidate

  if (!isRecord(profileValue)) {
    return null
  }

  return {
    raw: profileValue,
    skills: stringArrayFrom(profileValue.skills ?? profileValue.skill_set),
    totalExperienceYears: numberFrom(
      profileValue.total_experience_years ??
        profileValue.totalExperienceYears ??
        profileValue.experience_years
    ),
  }
}

function readCandidateContact(analysis: CandidateRankingAnalysis) {
  const responsePayload = analysis.responsePayload
  const rawResponse = isRecord(responsePayload?.rawResponse)
    ? responsePayload.rawResponse
    : null
  const unblindedCv =
    readUnblindedCv(responsePayload) ?? readUnblindedCv(rawResponse)

  const candidateName =
    analysis.candidateName ??
    firstString(unblindedCv, ["name", "full_name", "candidate_name"]) ??
    null
  const candidateEmail =
    analysis.candidateEmail ??
    firstString(unblindedCv, ["email", "candidate_email"]) ??
    null

  return {
    email: candidateEmail ?? "No Email Provided",
    name: candidateName ?? "Anonymous Candidate",
  }
}

function readUnblindedCv(value: unknown) {
  if (!isRecord(value)) {
    return null
  }

  const unblindedCv = value.unblinded_cv ?? value.unblindedCv

  return isRecord(unblindedCv) ? unblindedCv : null
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

function firstString(value: unknown, keys: string[]): string | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  for (const key of keys) {
    const candidate = value[key]

    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim()
    }
  }

  return undefined
}

function numberFrom(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace("%", ""))

    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

function stringArrayFrom(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  if (typeof value === "string") {
    return value
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
