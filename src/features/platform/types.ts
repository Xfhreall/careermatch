export type HrdJobRecord = {
  candidates: number
  company: string
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

export type SuperadminSnapshot = {
  auditEvents: Array<[string, string, string]>
  hrdApprovalQueue: Array<{
    company: string
    email: string
    id: string
    status: "Approved" | "Pending" | "Rejected"
  }>
  jobs: HrdJobRecord[]
  managedUsers: Array<[string, string, string, string]>
  modelConfig: Array<[string, string, string]>
  monitoringCards: Array<{
    label: string
    title: string
    value: string
  }>
  scoringWeights: Array<[string, number]>
}
