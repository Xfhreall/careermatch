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
  AnonymousCandidateRecord,
  HrdJobRecord,
  SuperadminSnapshot,
} from "@/features/platform/types"

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
  const { data, error } = await supabase
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
    .select("id")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await syncAnonymousCandidateMatches(String(data.id), input.result)
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
  const jobs = await listHrdJobs({ companyId })

  return {
    anonymousCandidates: await listAnonymousCandidates({
      jobIds: jobs.map((job) => job.id),
    }),
    jobs,
  }
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
  const { error } = await supabase.from("job_postings").insert({
    company_id: companyId,
    created_by: user.id,
    description: input.description,
    embedding_status: "pending",
    min_experience_years: input.minYears,
    required_skills: input.skills,
    status: input.status,
    title: input.title,
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
    .from("job_postings")
    .update({ embedding_status: "synced" })
    .eq("status", "active")

  if (role !== "superadmin") {
    query = query.eq("company_id", await resolveCompanyId(user))
  }

  const { error } = await query

  if (error) {
    throw new Error(error.message)
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

  const { error } = await supabase
    .from("job_postings")
    .update({
      description: input.description,
      embedding_status: "pending",
      min_experience_years: input.minYears,
      required_skills: input.skills,
      status: input.status,
      title: input.title,
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

  const { error } = await supabase.from("job_postings").delete().eq("id", jobId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function getSuperadminSnapshot(): Promise<SuperadminSnapshot> {
  const [jobs, users, approvals, analyses, scoring, models, settings, audit] =
    await Promise.all([
      listHrdJobs(),
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
    .from("job_postings")
    .select(
      "id, company_id, title, description, required_skills, min_experience_years, status, embedding_status, created_at"
    )
    .order("created_at", { ascending: false })

  if (options?.companyId) {
    query = query.eq("company_id", options.companyId)
  }

  const { data: jobs, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  const companyIds = [...new Set((jobs ?? []).map((job) => job.company_id))]
  const jobIds = (jobs ?? []).map((job) => job.id)
  const [companies, candidateCounts] = await Promise.all([
    fetchCompanies(companyIds),
    fetchCandidateCounts(jobIds),
  ])

  return (jobs ?? []).map((job) => ({
    candidates: candidateCounts.get(String(job.id)) ?? 0,
    company: companies.get(String(job.company_id)) ?? "CareerMatch Partner",
    description: String(job.description ?? ""),
    embedding: titleCase(String(job.embedding_status ?? "pending")),
    id: String(job.id),
    minYears: Number(job.min_experience_years ?? 0),
    skills: Array.isArray(job.required_skills) ? job.required_skills : [],
    status: titleCase(String(job.status ?? "active")),
    title: String(job.title),
  }))
}

async function listAnonymousCandidates(options?: {
  jobIds?: string[]
}): Promise<AnonymousCandidateRecord[]> {
  if (options?.jobIds && options.jobIds.length === 0) {
    return []
  }

  const supabase = getSupabaseAdmin()
  let query = supabase
    .from("anonymous_candidate_matches")
    .select("candidate_code, role_title, match_score, matched_skills")
    .order("match_score", { ascending: false })
    .limit(20)

  if (options?.jobIds) {
    query = query.in("job_posting_id", options.jobIds)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => ({
    candidate: String(row.candidate_code),
    role: String(row.role_title),
    score: `${Math.round(Number(row.match_score ?? 0))}%`,
    skills: Array.isArray(row.matched_skills)
      ? row.matched_skills.join(", ")
      : "",
  }))
}

async function syncAnonymousCandidateMatches(
  resultId: string,
  result: NormalizedAnalysisResponse
) {
  const supabase = getSupabaseAdmin()
  const jobs = await listHrdJobs()
  const rows = result.jobMatches
    .slice(0, 8)
    .map((match, index) => {
      const job = jobs.find(
        (item) =>
          item.title.toLowerCase() === match.jobTitle.toLowerCase() ||
          item.id === match.jobId
      )

      if (!job) {
        return null
      }

      return {
        analysis_result_id: resultId,
        candidate_code: `Candidate ${result.analysisId.slice(0, 10)}-${index + 1}`,
        job_posting_id: job.id,
        match_score: match.compatibilityScore ?? 0,
        matched_skills: match.matchedSkills,
        role_title: match.jobTitle,
      }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)

  if (rows.length === 0) {
    return
  }

  const { error } = await supabase
    .from("anonymous_candidate_matches")
    .upsert(rows, { onConflict: "job_posting_id,candidate_code" })

  if (error) {
    throw new Error(error.message)
  }
}

async function assertCanAccessJob(
  jobId: string,
  user: SessionUser,
  role: AccessRole
) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("job_postings")
    .select("id, company_id")
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

  if (String(data.company_id) !== companyId) {
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

async function fetchCandidateCounts(jobIds: unknown[]) {
  const supabase = getSupabaseAdmin()

  if (jobIds.length === 0) {
    return new Map<string, number>()
  }

  const { data, error } = await supabase
    .from("anonymous_candidate_matches")
    .select("job_posting_id")
    .in("job_posting_id", jobIds)

  if (error) {
    throw new Error(error.message)
  }

  const counts = new Map<string, number>()

  for (const row of data ?? []) {
    const id = String(row.job_posting_id)
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  return counts
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
