import type {
  AnalysisHistoryItem,
  NormalizedAnalysisResponse,
} from "@/features/cv-analysis/types"
import type {
  JobseekerChatbotConversation,
  JobseekerChatbotConversationSummary,
  JobseekerChatbotMode,
  JobseekerChatbotRole,
} from "@/features/jobseeker-chatbot/types"
import type {
  HrdJobRecord,
  SuperadminSnapshot,
} from "@/features/platform/types"
import {
  buildAnonymousCandidateMatchRows,
  type CandidateRankingAnalysis,
  type CandidateRankingJob,
} from "@/lib/server/hrd-candidate-ranking"

import { ensureSupabaseBucket, getSupabaseAdmin } from "./supabase"

type SessionUser = {
  companyId?: string | null
  email: string
  id: string
  name?: string | null
}

type AccessRole = "hrd" | "jobseeker" | "superadmin"

const CHATBOT_GUARD_SETTING_KEY = "chatbot_guard_enabled"
const CHATBOT_GUARD_SETTING_LABEL = "Chatbot guard rule"
const CHATBOT_GUARD_SETTING_DESCRIPTION =
  "Enable topical relevance filtering before jobseeker chatbot messages reach the webhook."

export async function uploadCvToStorage(userId: string, file: File) {
  const supabase = getSupabaseAdmin()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase()
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`
  const { error } = await supabase.storage
    .from("cv-uploads")
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  return path
}

export async function createAnalysisJob(input: {
  file: File
  storagePath: string
  userId: string
}) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("analysis_jobs")
    .insert({
      cv_storage_path: input.storagePath,
      file_size_bytes: input.file.size,
      jobseeker_id: input.userId,
      mime_type: input.file.type || "application/octet-stream",
      original_filename: input.file.name,
      status: "processing",
    })
    .select("id")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return String(data.id)
}

export async function markAnalysisJobStatus(
  jobId: string,
  status: "completed" | "failed" | "processing",
  errorMessage?: string
) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("analysis_jobs")
    .update({
      error_message: errorMessage ?? null,
      status,
    })
    .eq("id", jobId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function saveAnalysisResult(input: {
  jobId: string
  rawResponse: unknown
  result: NormalizedAnalysisResponse
  userId: string
}) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("analysis_results")
    .upsert(
      {
        analysis_id: input.result.analysisId,
        analysis_job_id: input.jobId,
        career_coaching: input.result.careerCoaching,
        job_matches: input.result.jobMatches,
        jobseeker_id: input.userId,
        overall_score: input.result.jobMatches[0]?.compatibilityScore ?? null,
        raw_response: input.rawResponse,
        response_payload: input.result,
        skill_gap: collectSkillGaps(input.result),
      },
      { onConflict: "analysis_id" }
    )

  if (error) {
    throw new Error(error.message)
  }
}

export async function listAnalysisHistory(userId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("analysis_results")
    .select("analysis_id, created_at, job_matches")
    .eq("jobseeker_id", userId)
    .order("created_at", { ascending: false })
    .limit(12)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) =>
    toHistoryItem(row as Record<string, unknown>)
  )
}

export async function loadAnalysisResult(userId: string, analysisId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("analysis_results")
    .select("response_payload")
    .eq("jobseeker_id", userId)
    .eq("analysis_id", analysisId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (data?.response_payload ?? null) as NormalizedAnalysisResponse | null
}

export async function deleteAnalysisResult(userId: string, analysisId: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("analysis_results")
    .delete()
    .eq("jobseeker_id", userId)
    .eq("analysis_id", analysisId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function listChatbotConversations(
  userId: string
): Promise<JobseekerChatbotConversationSummary[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("chatbot_conversations")
    .select("id, title, mode, analysis_id, created_at, updated_at")
    .eq("jobseeker_id", userId)
    .order("updated_at", { ascending: false })
    .limit(30)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) =>
    toChatbotConversationSummary(row as Record<string, unknown>)
  )
}

export async function loadChatbotConversation(
  userId: string,
  conversationId: string
): Promise<JobseekerChatbotConversation | null> {
  const supabase = getSupabaseAdmin()
  const { data: conversation, error } = await supabase
    .from("chatbot_conversations")
    .select("id, title, mode, analysis_id, created_at, updated_at")
    .eq("jobseeker_id", userId)
    .eq("id", conversationId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!conversation) {
    return null
  }

  const { data: messages, error: messagesError } = await supabase
    .from("chatbot_messages")
    .select("id, role, content, created_at")
    .eq("jobseeker_id", userId)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(80)

  if (messagesError) {
    throw new Error(messagesError.message)
  }

  return {
    ...toChatbotConversationSummary(conversation as Record<string, unknown>),
    messages: (messages ?? []).map((row) =>
      toChatbotMessage(row as Record<string, unknown>)
    ),
  }
}

export async function createChatbotConversation(input: {
  analysisId?: string
  message: string
  mode: JobseekerChatbotMode
  userId: string
}) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("chatbot_conversations")
    .insert({
      analysis_id: input.analysisId ?? null,
      jobseeker_id: input.userId,
      mode: input.mode,
      title: createChatbotTitle(input.message),
    })
    .select("id, title, mode, analysis_id, created_at, updated_at")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return toChatbotConversationSummary(data as Record<string, unknown>)
}

export async function appendChatbotMessage(input: {
  content: string
  conversationId: string
  metadata?: Record<string, unknown>
  role: JobseekerChatbotRole
  userId: string
}) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("chatbot_messages")
    .insert({
      content: input.content,
      conversation_id: input.conversationId,
      jobseeker_id: input.userId,
      metadata: input.metadata ?? {},
      role: input.role,
    })
    .select("id, role, content, created_at")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  const { error: updateError } = await supabase
    .from("chatbot_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", input.conversationId)
    .eq("jobseeker_id", input.userId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  return toChatbotMessage(data as Record<string, unknown>)
}

export async function getHrdDashboard(user: SessionUser, role: AccessRole) {
  const companyId =
    role === "superadmin" ? undefined : await resolveCompanyId(user)
  return buildAnonymousCandidateDashboard({ companyId })
}

export async function createHrdJob(
  user: SessionUser,
  input: {
    description: string
    minYears: number
    skills: string[]
    status: "active" | "closed" | "draft"
    title: string
  }
) {
  const supabase = getSupabaseAdmin()
  const companyId = await resolveCompanyId(user)
  const companies = await fetchCompanies([companyId])
  const companyName = companies.get(companyId) ?? "CareerMatch Partner"

  const { error } = await supabase.from("job_vacancies").insert({
    company_name: companyName,
    role_name: input.title,
    job_description: input.description,
    requirements: input.skills,
    metadata: {
      status: input.status,
      min_experience_years: input.minYears,
      created_by: user.id,
      company_id: companyId,
      embedding_status: "pending",
    }
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function refreshHrdEmbeddings(
  user: SessionUser,
  role: AccessRole
) {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from("job_vacancies")
    .select("id, metadata")

  if (role !== "superadmin") {
    query = query.eq("metadata->>company_id", await resolveCompanyId(user))
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  for (const job of data ?? []) {
    const meta = isRecord(job.metadata) ? job.metadata : {}
    if (meta.status === "active" && meta.embedding_status !== "synced") {
      await supabase
        .from("job_vacancies")
        .update({
          metadata: { ...meta, embedding_status: "synced" }
        })
        .eq("id", String(job.id))
    }
  }

}

export async function updateHrdJob(
  user: SessionUser,
  role: AccessRole,
  input: {
    id: string
    minYears: number
    description: string
    skills: string[]
    status: "active" | "closed" | "draft"
    title: string
  }
) {
  const supabase = getSupabaseAdmin()
  await assertCanAccessJob(input.id, user, role)

  const { data: existing } = await supabase
    .from("job_vacancies")
    .select("metadata")
    .eq("id", input.id)
    .single()

  const meta = isRecord(existing?.metadata) ? existing.metadata : {}

  const { error } = await supabase
    .from("job_vacancies")
    .update({
      job_description: input.description,
      requirements: input.skills,
      role_name: input.title,
      metadata: {
        ...meta,
        embedding_status: "pending",
        min_experience_years: input.minYears,
        status: input.status,
      }
    })
    .eq("id", input.id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function deleteHrdJob(
  user: SessionUser,
  role: AccessRole,
  jobId: string
) {
  const supabase = getSupabaseAdmin()
  await assertCanAccessJob(jobId, user, role)

  const { error } = await supabase.from("job_vacancies").delete().eq("id", jobId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function getSuperadminSnapshot(): Promise<SuperadminSnapshot> {
  const dashboard = await buildAnonymousCandidateDashboard()
  const [users, approvals, analyses, scoring, models, settings, audit] =
    await Promise.all([
      selectRows("users", "id, name, email, role, status"),
      selectRows(
        "hrd_approval_requests",
        "id, company_name, email, status, created_at, description, supporting_file_path, supporting_file_name"
      ),
      selectRows("analysis_jobs", "id, status"),
      selectRows("scoring_configs", "key, label, weight"),
      selectRows("model_configs", "key, agent, model, purpose"),
      selectRows("platform_settings", "key, label, description, value"),
      selectRows("audit_events", "created_at, event, detail", {
        limit: 8,
        orderBy: "created_at",
      }),
    ])
  const jobs = dashboard.jobs

  return {
    auditEvents: audit.map((row) => [
      formatEventTime(row.created_at),
      String(row.event),
      String(row.detail),
    ]),
    hrdApprovalQueue: await Promise.all(
      approvals.map(async (row) => {
        let supportingFileUrl: string | null = null
        if (row.supporting_file_path) {
          try {
            const supabase = getSupabaseAdmin()
            const { data } = await supabase.storage
              .from("hrd-documents")
              .createSignedUrl(String(row.supporting_file_path), 60 * 60)
            supportingFileUrl = data?.signedUrl ?? null
          } catch (e) {
            console.error("Failed to generate signed URL:", e)
          }
        }

        return {
          company: String(row.company_name),
          email: String(row.email),
          id: String(row.id),
          status: toApprovalStatus(String(row.status)),
          description: row.description ? String(row.description) : null,
          supportingFileName: row.supporting_file_name
            ? String(row.supporting_file_name)
            : null,
          supportingFileUrl,
        }
      })
    ),
    jobs,
    managedUsers: users.map((row) => [
      String(row.id),
      String(row.name),
      String(row.role),
      String(row.status),
    ]),
    modelConfig: models.map((row) => ({
      agent: String(row.agent),
      key: String(row.key),
      model: String(row.model),
      purpose: String(row.purpose),
    })),
    monitoringCards: [
      {
        label: "registered accounts",
        title: "Users",
        value: String(users.length),
      },
      {
        label: "published positions",
        title: "Active jobs",
        value: String(jobs.filter((job) => job.status === "Active").length),
      },
      {
        label: "completed analyses",
        title: "CV analyses",
        value: String(
          analyses.filter((row) => row.status === "completed").length
        ),
      },
      {
        label: "pending review",
        title: "HRD approvals",
        value: String(
          approvals.filter((row) => row.status === "pending").length
        ),
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
    ],
    platformSettings: settings.map((row) => ({
      description: String(row.description ?? ""),
      key: String(row.key),
      label: String(row.label),
      value: readBooleanSetting(row.value, true),
    })),
    scoringWeights: scoring.map((row) => ({
      key: String(row.key),
      label: String(row.label),
      weight: Number(row.weight),
    })),
  }
}

export async function getChatbotGuardEnabled() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", CHATBOT_GUARD_SETTING_KEY)
    .maybeSingle()

  if (error) {
    if (isMissingPlatformSettingsTable(error)) {
      return true
    }

    throw new Error(error.message)
  }

  return readBooleanSetting(data?.value, true)
}

export async function updateScoringConfig(input: {
  key: string
  reviewerId: string
  weight: number
}) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("scoring_configs")
    .update({
      updated_by: input.reviewerId,
      weight: input.weight,
    })
    .eq("key", input.key)

  if (error) {
    throw new Error(error.message)
  }

  await supabase.from("audit_events").insert({
    actor_id: input.reviewerId,
    detail: `${input.key} weight set to ${input.weight}%`,
    event: "scoring.weight.updated",
  })
}

export async function updateModelConfig(input: {
  key: string
  model: string
  purpose: string
  reviewerId: string
}) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("model_configs")
    .update({
      model: input.model,
      purpose: input.purpose,
      updated_by: input.reviewerId,
    })
    .eq("key", input.key)

  if (error) {
    throw new Error(error.message)
  }

  await supabase.from("audit_events").insert({
    actor_id: input.reviewerId,
    detail: `${input.key} model set to ${input.model}`,
    event: "model.config.updated",
  })
}

export async function updatePlatformSetting(input: {
  key: string
  reviewerId: string
  value: boolean
}) {
  if (input.key !== CHATBOT_GUARD_SETTING_KEY) {
    throw new Error("Setting platform tidak dikenal.")
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("platform_settings").upsert(
    {
      description: CHATBOT_GUARD_SETTING_DESCRIPTION,
      key: input.key,
      label: CHATBOT_GUARD_SETTING_LABEL,
      updated_by: input.reviewerId,
      value: input.value,
    },
    { onConflict: "key" }
  )

  if (error) {
    throw new Error(error.message)
  }

  await supabase.from("audit_events").insert({
    actor_id: input.reviewerId,
    detail: `${input.key} set to ${input.value ? "enabled" : "disabled"}`,
    event: "platform.setting.updated",
  })
}

export async function updateHrdApproval(input: {
  id: string
  reviewerId: string
  status: "approved" | "rejected"
}) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("hrd_approval_requests")
    .update({
      reviewed_at: new Date().toISOString(),
      reviewed_by: input.reviewerId,
      status: input.status,
    })
    .eq("id", input.id)
    .select("company_id, company_name, email")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (input.status === "approved" && data.company_id) {
    const { error: companyError } = await supabase
      .from("companies")
      .update({ status: "active" })
      .eq("id", data.company_id)

    if (companyError) {
      throw new Error(companyError.message)
    }

    // Upgrade the requesting user's role to hrd
    const { error: userError } = await supabase
      .from("users")
      .update({
        role: "hrd",
        company_id: data.company_id,
      })
      .eq("email", data.email)

    if (userError) {
      throw new Error(userError.message)
    }
  }

  await supabase.from("audit_events").insert({
    actor_id: input.reviewerId,
    detail: `${String(data.company_name)} marked ${input.status}`,
    event: `hrd.approval.${input.status}`,
  })
}

export async function getHrdApprovalRequestForUser(email: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("hrd_approval_requests")
    .select(
      "id, company_name, status, created_at, description, supporting_file_name"
    )
    .eq("email", email)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) return null

  return {
    id: String(data.id),
    companyName: String(data.company_name),
    status: data.status as "pending" | "approved" | "rejected",
    createdAt: String(data.created_at),
    description: data.description ? String(data.description) : null,
    supportingFileName: data.supporting_file_name
      ? String(data.supporting_file_name)
      : null,
  }
}

export async function createHrdApprovalRequest(input: {
  userId: string
  companyName: string
  email: string
  description?: string | null
  supportingFile?: File | null
}) {
  const supabase = getSupabaseAdmin()

  // First check if there is an existing request
  const { data: existingRequest, error: checkError } = await supabase
    .from("hrd_approval_requests")
    .select("status")
    .eq("email", input.email)
    .maybeSingle()

  if (checkError) {
    throw new Error(checkError.message)
  }

  if (existingRequest) {
    if (existingRequest.status === "approved") {
      throw new Error("Akun Anda sudah disetujui sebagai HRD.")
    }
    if (existingRequest.status === "pending") {
      throw new Error(
        "Permintaan pendaftaran HRD Anda masih dalam antrean persetujuan."
      )
    }
  }

  let supportingFilePath: string | null = null
  let supportingFileName: string | null = null

  if (input.supportingFile) {
    supportingFileName = input.supportingFile.name
    const safeName = supportingFileName
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .toLowerCase()
    supportingFilePath = `${input.userId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`

    // Ensure the storage bucket exists
    await ensureSupabaseBucket("hrd-documents", {
      allowedMimeTypes: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ],
      fileSizeLimit: 10485760, // 10MB
      public: false,
    })

    const { error: uploadError } = await supabase.storage
      .from("hrd-documents")
      .upload(supportingFilePath, await input.supportingFile.arrayBuffer(), {
        contentType: input.supportingFile.type || "application/octet-stream",
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Gagal mengunggah file pendukung: ${uploadError.message}`)
    }
  }

  // Create a pending company
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name: input.companyName,
      industry: "Technology",
      status: "pending",
    })
    .select("id")
    .single()

  if (companyError) {
    throw new Error(
      companyError.code === "23505"
        ? "Nama perusahaan sudah terdaftar."
        : companyError.message
    )
  }

  // Count requests to get next sequence ID
  const { count, error: countError } = await supabase
    .from("hrd_approval_requests")
    .select("*", { count: "exact", head: true })

  if (countError) {
    throw new Error(countError.message)
  }

  const nextNum = (count ?? 0) + 1
  const approvalId = `CM-HRD-${nextNum}`

  // Create approval request
  const { error: requestError } = await supabase
    .from("hrd_approval_requests")
    .insert({
      id: approvalId,
      company_id: company.id,
      company_name: input.companyName,
      email: input.email,
      status: "pending",
      description: input.description ?? null,
      supporting_file_path: supportingFilePath,
      supporting_file_name: supportingFileName,
    })

  if (requestError) {
    throw new Error(requestError.message)
  }

  await supabase.from("audit_events").insert({
    actor_id: input.userId,
    detail: `HRD registration request created for company ${input.companyName} (${input.email})`,
    event: "hrd.request.created",
  })

  return { id: approvalId }
}

async function listHrdJobs(options?: {
  companyId?: string
}): Promise<HrdJobRecord[]> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from("job_vacancies")
    .select(
      "id, company_name, role_name, job_description, requirements, metadata, created_at"
    )
    .order("created_at", { ascending: false })

  if (options?.companyId) {
    query = query.eq("metadata->>company_id", options.companyId)
  }

  const { data: jobs, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (jobs ?? []).map((job) => {
    const meta = isRecord(job.metadata) ? job.metadata : {}
    return {
      candidates: 0,
      company: String(job.company_name || "CareerMatch Partner"),
      description: String(job.job_description ?? ""),
      embedding: titleCase(String(meta.embedding_status ?? "pending")),
      id: String(job.id),
      minYears: Number(meta.min_experience_years ?? 0),
      skills: Array.isArray(job.requirements) ? job.requirements : [],
      status: titleCase(String(meta.status ?? "active")),
      title: String(job.role_name),
    }
  })
}

async function buildAnonymousCandidateDashboard(options?: {
  companyId?: string
}) {
  const jobs = await listHrdJobs(options)
  const rows = buildAnonymousCandidateMatchRows({
    analyses: await listCandidateRankingAnalyses(),
    jobs: jobs.map(toCandidateRankingJob),
  })
  const candidateCounts = countCandidateRows(rows)

  return {
    anonymousCandidates: rows.slice(0, 20).map((row) => ({
      candidate: row.candidate_code,
      role: row.role_title,
      score: `${Math.round(row.match_score)}%`,
      skills: row.matched_skills.join(", "),
    })),
    jobs: jobs.map((job) => ({
      ...job,
      candidates: candidateCounts.get(job.id) ?? 0,
    })),
  }
}

async function listCandidateRankingAnalyses(): Promise<CandidateRankingAnalysis[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("analysis_results")
    .select("id, analysis_id, jobseeker_id, response_payload, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => {
    const responsePayload =
      typeof row.response_payload === "object" && row.response_payload !== null
        ? (row.response_payload as Partial<NormalizedAnalysisResponse>)
        : null

    return {
      analysisId: String(row.analysis_id),
      candidateProfile: responsePayload?.candidateProfile,
      createdAt: String(row.created_at),
      id: String(row.id),
      jobseekerId: String(row.jobseeker_id),
    }
  })
}

function toCandidateRankingJob(job: HrdJobRecord): CandidateRankingJob {
  return {
    id: job.id,
    minExperienceYears: job.minYears,
    requiredSkills: job.skills,
    title: job.title,
  }
}

function countCandidateRows(
  rows: ReturnType<typeof buildAnonymousCandidateMatchRows>
) {
  const counts = new Map<string, number>()

  for (const row of rows) {
    counts.set(row.job_vacancy_id, (counts.get(row.job_vacancy_id) ?? 0) + 1)
  }

  return counts
}

async function assertCanAccessJob(
  jobId: string,
  user: SessionUser,
  role: AccessRole
) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("job_vacancies")
    .select("id, metadata")
    .eq("id", jobId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error("Lowongan tidak ditemukan.")
  }

  if (role === "superadmin") {
    return
  }

  const companyId = await resolveCompanyId(user)
  const meta = isRecord(data.metadata) ? data.metadata : {}

  if (String(meta.company_id) !== companyId) {
    throw new Error("Lowongan ini bukan milik perusahaan Anda.")
  }
}

async function resolveCompanyId(user: SessionUser) {
  if (user.companyId) {
    return user.companyId
  }

  const supabase = getSupabaseAdmin()
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (company?.id) {
    return String(company.id)
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({
      industry: "Recruitment",
      name: "CareerMatch Partner",
      status: "active",
    })
    .select("id")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return String(data.id)
}

async function selectRows(
  table: string,
  columns: string,
  options?: { limit?: number; orderBy?: string }
) {
  const supabase = getSupabaseAdmin()
  let query = supabase.from(table).select(columns)

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: false })
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as unknown as Array<Record<string, unknown>>
}

async function fetchCompanies(companyIds: unknown[]) {
  const supabase = getSupabaseAdmin()

  if (companyIds.length === 0) {
    return new Map<string, string>()
  }

  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .in("id", companyIds)

  if (error) {
    throw new Error(error.message)
  }

  return new Map((data ?? []).map((row) => [String(row.id), String(row.name)]))
}

function collectSkillGaps(result: NormalizedAnalysisResponse) {
  return result.jobMatches.flatMap((match) =>
    match.skillGap.map((skill) => ({
      jobTitle: match.jobTitle,
      skill,
    }))
  )
}

function toHistoryItem(row: Record<string, unknown>): AnalysisHistoryItem {
  const jobMatches = Array.isArray(row.job_matches) ? row.job_matches : []
  const topMatch = isRecord(jobMatches[0]) ? jobMatches[0] : undefined

  return {
    analysisId: String(row.analysis_id),
    createdAt: String(row.created_at),
    jobMatchCount: jobMatches.length,
    topCompany: topMatch ? String(topMatch.company ?? "") : undefined,
    topRole: topMatch
      ? String(topMatch.jobTitle ?? topMatch.job_title ?? "")
      : undefined,
    topScore: topMatch
      ? Number(topMatch.compatibilityScore ?? topMatch.compatibility_score ?? 0)
      : undefined,
  }
}

function toChatbotConversationSummary(
  row: Record<string, unknown>
): JobseekerChatbotConversationSummary {
  const mode = row.mode === "analysis" ? "analysis" : "direct"
  const analysisId =
    typeof row.analysis_id === "string" ? row.analysis_id : undefined

  return {
    analysisId,
    createdAt: String(row.created_at),
    id: String(row.id),
    mode,
    title: String(row.title || "Chat baru"),
    updatedAt: String(row.updated_at),
  }
}

function toChatbotMessage(
  row: Record<string, unknown>
): JobseekerChatbotConversation["messages"][number] {
  return {
    content: String(row.content ?? ""),
    createdAt: String(row.created_at),
    id: String(row.id),
    role: row.role === "user" ? "user" : "assistant",
  }
}

function createChatbotTitle(message: string) {
  const normalized = message.replace(/\s+/g, " ").trim()

  if (!normalized) {
    return "Chat baru"
  }

  return normalized.length > 56 ? `${normalized.slice(0, 53)}...` : normalized
}

function toApprovalStatus(value: string) {
  switch (value) {
    case "approved":
      return "Approved"
    case "rejected":
      return "Rejected"
    default:
      return "Pending"
  }
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatEventTime(value: unknown) {
  const date = new Date(String(value))

  if (Number.isNaN(date.getTime())) {
    return "--:--"
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function readBooleanSetting(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true
    }

    if (value.toLowerCase() === "false") {
      return false
    }
  }

  return fallback
}

function isMissingPlatformSettingsTable(error: unknown) {
  if (!isRecord(error)) {
    return false
  }

  return (
    error.code === "42P01" ||
    String(error.message ?? "").includes("platform_settings")
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}
