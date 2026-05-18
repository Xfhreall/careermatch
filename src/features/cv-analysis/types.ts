export type CandidateProfile = {
  skills?: string[]
  totalExperienceYears?: number
  summary?: string
  raw?: unknown
}

export type JobMatch = {
  jobId?: string
  jobTitle: string
  company: string
  compatibilityScore?: number
  skillMatchScore?: number
  experienceMatchScore?: number
  matchedSkills: string[]
  skillGap: string[]
  requiredYears?: number
  candidateYears?: number
  reasoning?: string
  raw?: unknown
}

export type NormalizedAnalysisResponse = {
  analysisId: string
  candidateProfile?: CandidateProfile
  jobMatches: JobMatch[]
  careerCoaching: string
  rawResponse: unknown
}

export type AnalysisResult = NormalizedAnalysisResponse

export type AnalysisHistoryItem = {
  analysisId: string
  createdAt: string
  jobMatchCount: number
  topCompany?: string
  topRole?: string
  topScore?: number
}
