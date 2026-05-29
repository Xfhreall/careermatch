import type {
  AppliedJob,
  CandidateProfile,
  JobMatch,
  NormalizedAnalysisResponse,
} from "./types"

const JOB_MATCH_KEYS = [
  "job_matches",
  "jobMatches",
  "matches",
  "jobs",
  "results",
  "output",
]

const COACHING_KEYS = [
  "career_coaching",
  "careerCoaching",
  "coaching",
  "coach",
  "interview_questions",
  "interviewQuestions",
]

const TEXT_KEYS = ["text", "content", "message", "response", "output", "result"]

type NormalizeAnalysisOptions = {
  appliedJob?: AppliedJob
}

export function normalizeAnalysisResponse(
  input: unknown,
  options: NormalizeAnalysisOptions = {}
): NormalizedAnalysisResponse {
  const parsedInput = parseMaybeJson(input)

  if (isNormalizedRecord(parsedInput)) {
    return {
      analysisId: parsedInput.analysisId,
      appliedJob:
        normalizeAppliedJob(parsedInput.appliedJob) ?? options.appliedJob,
      candidateProfile: normalizeExistingCandidateProfile(
        parsedInput.candidateProfile
      ),
      careerCoaching: stringFrom(parsedInput.careerCoaching) ?? "",
      jobMatches: parsedInput.jobMatches.map(normalizeJobMatch),
      rawResponse: parsedInput.rawResponse ?? parsedInput,
    }
  }

  const root = isRecord(parsedInput) ? parsedInput : undefined
  const analysisId =
    firstString(root, ["analysis_id", "analysisId", "id"]) ?? createAnalysisId()
  const appliedJob =
    options.appliedJob ?? normalizeAppliedJobFromRoot(root ?? {})

  return {
    analysisId,
    appliedJob,
    candidateProfile: normalizeCandidateProfile(root),
    jobMatches: findFirstJobMatches(parsedInput).map(normalizeJobMatch),
    careerCoaching: normalizeCareerCoaching(parsedInput),
    rawResponse: input,
  }
}

function isNormalizedRecord(value: unknown): value is Record<
  string,
  unknown
> & {
  analysisId: string
  jobMatches: unknown[]
} {
  return (
    isRecord(value) &&
    typeof value.analysisId === "string" &&
    Array.isArray(value.jobMatches)
  )
}

function normalizeExistingCandidateProfile(
  value: unknown
): CandidateProfile | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  return {
    raw: value.raw ?? value,
    skills: stringArrayFrom(value.skills),
    summary: stringFrom(value.summary),
    totalExperienceYears: numberFrom(value.totalExperienceYears),
  }
}

function normalizeAppliedJob(value: unknown): AppliedJob | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  const jobTitle = stringFrom(
    firstValue(value, ["jobTitle", "job_title", "position", "role", "title"])
  )
  const jobDescription = stringFrom(
    firstValue(value, [
      "jobDescription",
      "job_description",
      "description",
      "jobDesc",
    ])
  )

  if (!jobTitle || !jobDescription) {
    return undefined
  }

  return {
    jobDescription,
    jobTitle,
  }
}

function normalizeAppliedJobFromRoot(
  root: Record<string, unknown>
): AppliedJob | undefined {
  const nestedValue = firstValue(root, [
    "appliedJob",
    "applied_job",
    "targetJob",
    "target_job",
    "jobContext",
    "job_context",
  ])
  const nestedJob = normalizeAppliedJob(nestedValue)

  if (nestedJob) {
    return nestedJob
  }

  const jobTitle = stringFrom(
    firstValue(root, [
      "appliedJobTitle",
      "applied_job_title",
      "targetJobTitle",
      "target_job_title",
      "positionApplied",
      "position_applied",
    ])
  )
  const jobDescription = stringFrom(
    firstValue(root, [
      "appliedJobDescription",
      "applied_job_description",
      "targetJobDescription",
      "target_job_description",
      "jobDescription",
      "job_description",
    ])
  )

  if (!jobTitle || !jobDescription) {
    return undefined
  }

  return {
    jobDescription,
    jobTitle,
  }
}

function normalizeCandidateProfile(
  root: Record<string, unknown> | undefined
): CandidateProfile | undefined {
  if (!root) {
    return undefined
  }

  const profileValue = firstValue(root, [
    "candidate_profile",
    "candidateProfile",
    "candidate",
    "profile",
  ])

  if (!isRecord(profileValue)) {
    return undefined
  }

  return {
    skills: stringArrayFrom(firstValue(profileValue, ["skills", "skill_set"])),
    totalExperienceYears: numberFrom(
      firstValue(profileValue, [
        "total_experience_years",
        "totalExperienceYears",
        "experience_years",
      ])
    ),
    summary: stringFrom(firstValue(profileValue, ["summary", "headline"])),
    raw: profileValue,
  }
}

function normalizeJobMatch(value: unknown): JobMatch {
  const record = isRecord(value) ? value : {}

  return {
    jobId: stringFrom(firstValue(record, ["job_id", "jobId", "id"])),
    jobTitle:
      stringFrom(
        firstValue(record, [
          "job_title",
          "jobTitle",
          "title",
          "position",
          "role",
        ])
      ) ?? "Posisi Tidak Diketahui",
    company:
      stringFrom(
        firstValue(record, [
          "company",
          "company_name",
          "companyName",
          "organization",
        ])
      ) ?? "Perusahaan",
    compatibilityScore: numberFrom(
      firstValue(record, [
        "compatibility_score",
        "compatibilityScore",
        "match_score",
        "matchScore",
        "score",
      ])
    ),
    skillMatchScore: numberFrom(
      firstValue(record, ["skill_match_score", "skillMatchScore"])
    ),
    experienceMatchScore: numberFrom(
      firstValue(record, ["experience_match_score", "experienceMatchScore"])
    ),
    matchedSkills: stringArrayFrom(
      firstValue(record, [
        "matched_skills",
        "matchedSkills",
        "skills_match",
        "skillsMatch",
        "matching_skills",
      ])
    ),
    skillGap: stringArrayFrom(
      firstValue(record, [
        "skill_gap",
        "skillGap",
        "gaps",
        "missing_skills",
        "missingSkills",
      ])
    ),
    requiredYears: numberFrom(
      firstValue(record, ["required_years", "requiredYears", "min_years"])
    ),
    candidateYears: numberFrom(
      firstValue(record, ["candidate_years", "candidateYears", "years"])
    ),
    reasoning: stringFrom(
      firstValue(record, ["reasoning", "reason", "rationale"])
    ),
    raw: value,
  }
}

function findFirstJobMatches(value: unknown, depth = 0): unknown[] {
  if (depth > 5) {
    return []
  }

  const parsedValue = parseMaybeJson(value)

  if (Array.isArray(parsedValue)) {
    return parsedValue.some(isJobLike) ? parsedValue : []
  }

  if (!isRecord(parsedValue)) {
    return []
  }

  const topMatch = firstValue(parsedValue, ["top_match", "topMatch"])

  if (isJobLike(topMatch)) {
    return [topMatch]
  }

  for (const key of JOB_MATCH_KEYS) {
    if (key in parsedValue) {
      const candidate = findFirstJobMatches(parsedValue[key], depth + 1)

      if (candidate.length > 0) {
        return candidate
      }
    }
  }

  for (const child of Object.values(parsedValue)) {
    const candidate = findFirstJobMatches(child, depth + 1)

    if (candidate.length > 0) {
      return candidate
    }
  }

  return []
}

function normalizeCareerCoaching(value: unknown) {
  const coachingValue = findFirstValueByKeys(value, COACHING_KEYS)

  if (coachingValue === undefined) {
    return ""
  }

  return coachingToMarkdown(coachingValue)
}

function coachingToMarkdown(value: unknown): string {
  const parsedValue = parseMaybeJson(value)

  if (typeof parsedValue === "string") {
    return parsedValue
  }

  if (Array.isArray(parsedValue)) {
    return interviewQuestionsToMarkdown(parsedValue)
  }

  if (isRecord(parsedValue)) {
    const nestedText = firstValue(parsedValue, TEXT_KEYS)

    if (nestedText !== undefined && nestedText !== parsedValue) {
      return coachingToMarkdown(nestedText)
    }

    return JSON.stringify(parsedValue, null, 2)
  }

  return String(parsedValue)
}

function interviewQuestionsToMarkdown(value: unknown[]) {
  if (value.length === 0) {
    return ""
  }

  return [
    "## Pertanyaan Interview",
    "",
    ...value.map((item, index) => {
      if (isRecord(item)) {
        const question =
          stringFrom(firstValue(item, ["question", "text", "prompt"])) ??
          JSON.stringify(item)
        const focus = stringFrom(firstValue(item, ["focus", "topic"]))

        return `${index + 1}. ${question}${focus ? `\n   Fokus: ${focus}` : ""}`
      }

      return `${index + 1}. ${String(item)}`
    }),
  ].join("\n")
}

function findFirstValueByKeys(
  value: unknown,
  keys: readonly string[],
  depth = 0
): unknown {
  if (depth > 5) {
    return undefined
  }

  const parsedValue = parseMaybeJson(value)

  if (Array.isArray(parsedValue)) {
    for (const item of parsedValue) {
      const nestedValue = findFirstValueByKeys(item, keys, depth + 1)

      if (nestedValue !== undefined) {
        return nestedValue
      }
    }
  }

  if (!isRecord(parsedValue)) {
    return undefined
  }

  const directValue = firstValue(parsedValue, keys)

  if (directValue !== undefined) {
    return directValue
  }

  for (const child of Object.values(parsedValue)) {
    const nestedValue = findFirstValueByKeys(child, keys, depth + 1)

    if (nestedValue !== undefined) {
      return nestedValue
    }
  }

  return undefined
}

function isJobLike(value: unknown) {
  if (!isRecord(value)) {
    return false
  }

  return [
    "job_title",
    "jobTitle",
    "title",
    "position",
    "company",
    "compatibility_score",
    "score",
    "matched_skills",
  ].some((key) => key in value)
}

function firstValue(
  record: Record<string, unknown>,
  keys: readonly string[]
): unknown {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key]
    }
  }

  return undefined
}

function firstString(
  record: Record<string, unknown> | undefined,
  keys: readonly string[]
) {
  if (!record) {
    return undefined
  }

  return stringFrom(firstValue(record, keys))
}

function stringFrom(value: unknown) {
  if (typeof value === "string" && value.trim().length > 0) {
    return value
  }

  if (typeof value === "number") {
    return String(value)
  }

  return undefined
}

function numberFrom(value: unknown) {
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

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== "string") {
    return value
  }

  const trimmed = value.trim()

  if (
    !(trimmed.startsWith("{") && trimmed.endsWith("}")) &&
    !(trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    return value
  }

  try {
    return JSON.parse(trimmed)
  } catch {
    return value
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function createAnalysisId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `analysis-${Date.now()}`
}
