import {
  ActivityIcon,
  BotIcon,
  BriefcaseBusinessIcon,
  DatabaseIcon,
  FileArchiveIcon,
  FileTextIcon,
  GaugeIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react"

export const platformNavItems = [
  { label: "Analyze", to: "/jobseeker/analyze" },
  { label: "Dashboard", to: "/jobseeker/dashboard" },
  { label: "HRD", to: "/hrd/portal" },
  { label: "Coach", to: "/interview/coach" },
  { label: "Admin", to: "/superadmin/monitoring" },
  { label: "Architecture", to: "/platform/architecture" },
] as const

export const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Stabilize MVP",
    status: "Built",
    items: [
      "n8n response normalizer",
      "File extension and size validation",
      "Server proxy for webhook",
      "Telemetry events",
      "Safe Markdown renderer",
    ],
  },
  {
    phase: "Phase 2",
    title: "Persistence & Auth",
    status: "Scaffolded",
    items: [
      "Google login path",
      "Default jobseeker role",
      "Analysis history dashboard",
      "Saved report surface",
      "PDF export slot",
    ],
  },
  {
    phase: "Phase 3",
    title: "HRD Portal",
    status: "Scaffolded",
    items: [
      "HRD approval state",
      "Job posting workspace",
      "Embedding refresh status",
      "Anonymous candidate ranking",
    ],
  },
  {
    phase: "Phase 4",
    title: "Interview Coach",
    status: "Scaffolded",
    items: [
      "STAR questions",
      "Interview simulation surface",
      "STAR component feedback",
      "Resume session slot",
    ],
  },
  {
    phase: "Phase 5",
    title: "Admin & Monitoring",
    status: "Scaffolded",
    items: [
      "Workflow health",
      "AI cost tracking",
      "Error rate",
      "Scoring weights",
      "Audit log",
    ],
  },
] as const

export const openQuestions = [
  {
    question: "Nama produk final?",
    assumption: "CareerMatch tetap dipakai sampai brand decision final.",
  },
  {
    question: "n8n atau TanStack Start backend?",
    assumption: "MVP tetap n8n via server proxy; migration slot disiapkan.",
  },
  {
    question: "DOC tetap didukung?",
    assumption:
      "PDF, DOC, DOCX diterima; extraction tetap tanggung jawab backend.",
  },
  {
    question: "Sumber job database?",
    assumption: "Supabase pgvector menjadi target fase persistence.",
  },
  {
    question: "Bahasa career coaching?",
    assumption: "Ikuti bahasa response backend; UI siap bahasa Indonesia.",
  },
  {
    question: "Score integer atau decimal?",
    assumption: "UI menampilkan integer percent untuk scan cepat.",
  },
  {
    question: "Batas ukuran CV final?",
    assumption: "10MB konsisten dengan prototype dan validator.",
  },
  {
    question: "CV boleh disimpan?",
    assumption: "MVP transient; storage private masuk fase auth/persistence.",
  },
] as const

export const engineeringNotes = [
  "Frontend dan backend memakai batas CV 10MB.",
  "Webhook n8n tidak dipanggil langsung dari browser.",
  "Response backend tetap dinormalisasi defensif di frontend.",
  "Copy, enum, dan route memakai jobseeker, bukan user.",
  "Auth, HRD, superadmin, STAR chatbot, dan PDF kini dibuat sebagai scaffold sprint, bukan core MVP blocker.",
] as const

export const techStackGroups = [
  {
    title: "Frontend & Fullstack",
    icon: SparklesIcon,
    rows: [
      ["TanStack Start", "SSR/API layer"],
      ["TanStack Router", "Type-safe multipage routes"],
      ["TanStack Query", "Mutation and server state"],
      ["TanStack Form", "CV upload validation"],
      ["TanStack Table", "Job match grid"],
      ["Lenis", "Smooth scrolling"],
    ],
  },
  {
    title: "Auth & Session",
    icon: LockKeyholeIcon,
    rows: [
      ["Better Auth", "Future app session manager"],
      ["Google OAuth", "Future login provider"],
      ["HTTP-only cookie", "Future production session"],
      ["RBAC middleware", "Future role guard"],
    ],
  },
  {
    title: "Backend & AI",
    icon: BotIcon,
    rows: [
      ["TanStack API route", "Internal proxy"],
      ["n8n", "MVP AI workflow"],
      ["OpenAI GPT-4o", "PRD target model"],
      ["pdf-parse / mammoth", "Future server extraction"],
    ],
  },
  {
    title: "Database & Storage",
    icon: DatabaseIcon,
    rows: [
      ["Supabase Postgres", "Future persistence"],
      ["pgvector", "Future similarity search"],
      ["Supabase Storage", "Private CV and report files"],
      ["Signed URL", "Future report access"],
    ],
  },
] as const

export const roleMatrix = [
  ["Upload CV", "jobseeker", "superadmin"],
  ["View own analysis", "jobseeker", "superadmin"],
  ["Manage jobs", "hrd", "superadmin"],
  ["View anonymous candidates", "hrd", "superadmin"],
  ["Approve HRD", "superadmin"],
  ["Monitor workflow", "superadmin"],
] as const

export const dashboardCards = [
  {
    title: "Google login",
    body: "Better Auth slot siap untuk OAuth. Role default tetap jobseeker.",
    icon: UserCheckIcon,
    status: "Auth-ready",
  },
  {
    title: "Analysis history",
    body: "Browser history index baca hasil yang dibuat di sesi lokal.",
    icon: FileArchiveIcon,
    status: "Local scaffold",
  },
  {
    title: "PDF report",
    body: "Report action slot tersedia; generator PDF masuk fase storage.",
    icon: FileTextIcon,
    status: "Queued",
  },
] as const

export const hrdJobs = [
  {
    title: "Frontend Engineer",
    skills: ["React", "TypeScript", "TanStack"],
    candidates: 18,
    embedding: "Synced",
  },
  {
    title: "Product Analyst",
    skills: ["SQL", "Dashboarding", "Experimentation"],
    candidates: 11,
    embedding: "Queued",
  },
  {
    title: "Implementation Consultant",
    skills: ["SaaS", "Client discovery", "API"],
    candidates: 9,
    embedding: "Synced",
  },
] as const

export const anonymousCandidates = [
  ["Candidate CM-1042", "Frontend Engineer", "92%"],
  ["Candidate CM-2210", "Product Analyst", "86%"],
  ["Candidate CM-1187", "Implementation Consultant", "81%"],
] as const

export const coachQuestions = [
  {
    question:
      "Ceritakan situasi saat kamu memperbaiki performa aplikasi React yang lambat.",
    focus: "Situation + Task",
  },
  {
    question:
      "Langkah teknis apa yang kamu ambil untuk mengukur dan memperbaiki masalah itu?",
    focus: "Action",
  },
  {
    question:
      "Apa hasil terukur dari perubahan tersebut, dan apa yang kamu pelajari?",
    focus: "Result",
  },
] as const

export const monitoringCards = [
  {
    title: "n8n workflow",
    value: "99.2%",
    label: "success rate",
    icon: ActivityIcon,
  },
  {
    title: "AI cost",
    value: "$42.80",
    label: "this week",
    icon: GaugeIcon,
  },
  {
    title: "Error rate",
    value: "0.8%",
    label: "last 24h",
    icon: ShieldCheckIcon,
  },
  {
    title: "HRD approvals",
    value: "6",
    label: "pending",
    icon: UsersIcon,
  },
] as const

export const scoringWeights = [
  ["Skills", 45],
  ["Experience", 30],
  ["Seniority", 15],
  ["Career direction", 10],
] as const

export const auditEvents = [
  ["22:14", "workflow.retry", "n8n retry after timeout"],
  ["21:48", "hrd.approval.pending", "Company profile awaiting review"],
  ["20:30", "scoring.weight.viewed", "Superadmin opened scoring config"],
] as const

export { BriefcaseBusinessIcon }
