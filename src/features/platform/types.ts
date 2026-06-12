export type HrdJobRecord = {
  candidates: number
  company: string
  description: string
  embedding: string
  id: string
  minYears: number
  skills: string[]
  status: string
  title: string
}

export type AnonymousCandidateRecord = {
  candidate: string
  role: string
  score: string
  skills: string
}

export type ModelConfigRecord = {
  agent: string
  key: string
  model: string
  purpose: string
}

export type ScoringConfigRecord = {
  key: string
  label: string
  weight: number
}

export type PlatformSettingRecord = {
  description: string
  key: string
  label: string
  value: boolean
}

export type SuperadminSnapshot = {
  auditEvents: Array<[string, string, string]>
  hrdApprovalQueue: Array<{
    company: string
    email: string
    id: string
    status: "Approved" | "Pending" | "Rejected"
    description?: string | null
    supportingFileName?: string | null
    supportingFileUrl?: string | null
  }>
  jobs: HrdJobRecord[]
  managedUsers: Array<[string, string, string, string]>
  modelConfig: ModelConfigRecord[]
  monitoringCards: Array<{
    label: string
    title: string
    value: string
  }>
  platformSettings: PlatformSettingRecord[]
  scoringWeights: ScoringConfigRecord[]
}
