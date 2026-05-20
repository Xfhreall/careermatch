import {
  BotIcon,
  BriefcaseBusinessIcon,
  DatabaseIcon,
  LockKeyholeIcon,
  SparklesIcon,
} from "lucide-react"

export const platformNavItems = [
  { label: "Jobseeker", to: "/jobseeker/dashboard" },
  { label: "HRD", to: "/hrd/portal" },
  { label: "Interview Coach", to: "/interview/coach" },
  { label: "Superadmin", to: "/superadmin/monitoring" },
  { label: "Architecture", to: "/platform/architecture" },
] as const

export const implementationMilestones = [
  {
    area: "CV Matching",
    title: "Jobseeker dashboard",
    status: "Implemented",
    items: [
      "Upload CV dari dashboard jobseeker",
      "Validasi PDF, DOC, DOCX dan batas 10MB",
      "File diproses aman lewat server CareerMatch",
      "Status proses dan error handling",
      "Hasil berisi score, job match, coaching, dan full report",
    ],
  },
  {
    area: "Persistence",
    title: "Analysis history",
    status: "Implemented",
    items: [
      "Riwayat analisis tersimpan di Supabase Postgres",
      "Hasil dapat dibuka ulang dari dashboard",
      "Report dapat diekspor dari detail analisis",
      "Reset analisis menghapus hasil dari riwayat user",
    ],
  },
  {
    area: "HRD",
    title: "Recruiter dashboard",
    status: "Implemented",
    items: [
      "Kelola lowongan aktif",
      "Definisikan required skills dan minimum experience",
      "Lihat kandidat anonim berdasarkan skor",
      "Ekspor laporan kandidat anonim",
    ],
  },
  {
    area: "Coaching",
    title: "STAR interview coach",
    status: "Implemented",
    items: [
      "Pertanyaan interview berbasis STAR",
      "Simulasi jawaban interaktif",
      "Feedback per komponen Situation, Task, Action, Result",
      "Ringkasan sesi untuk latihan berikutnya",
    ],
  },
  {
    area: "Admin",
    title: "Superadmin console",
    status: "Implemented",
    items: [
      "Approve atau reject akun HRD",
      "Monitoring workflow, AI cost, latency, dan error rate",
      "Kelola user dan lowongan lintas role",
      "Konfigurasi scoring weight dan model AI",
    ],
  },
] as const

export const implementationDecisions = [
  {
    decision: "Nama produk",
    value: "CareerMatch dipakai sebagai nama aplikasi dan metadata.",
  },
  {
    decision: "Endpoint analisis",
    value:
      "Browser mengirim CV ke /api/cv/analyze, server menyimpan file ke Supabase Storage, lalu meneruskan ke n8n.",
  },
  {
    decision: "Format file",
    value: "PDF, DOC, dan DOCX diterima dengan batas ukuran 10MB.",
  },
  {
    decision: "Role default",
    value: "Role pengguna default adalah jobseeker.",
  },
  {
    decision: "Scoring default",
    value:
      "Compatibility score memakai 70% skill match dan 30% experience match.",
  },
  {
    decision: "Privasi CV",
    value: "CV asli tidak pernah ditampilkan ke HRD; kandidat tampil anonim.",
  },
] as const

export const engineeringNotes = [
  "Frontend dan backend memakai batas CV 10MB.",
  "Webhook n8n tidak dipanggil langsung dari browser.",
  "Response backend dinormalisasi defensif di frontend.",
  "Copy, enum, dan route memakai jobseeker, bukan user.",
  "Dashboard jobseeker, HRD, superadmin, STAR coach, dan report export memakai data server-side.",
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
      ["Better Auth", "Session manager"],
      ["Google OAuth", "Login provider"],
      ["Postgres sessions", "Supabase-backed Better Auth tables"],
      ["Role redirect", "Dashboard routing for jobseeker, hrd, superadmin"],
    ],
  },
  {
    title: "Backend & AI",
    icon: BotIcon,
    rows: [
      ["TanStack API route", "Internal proxy"],
      ["n8n", "AI workflow orchestration"],
      ["OpenAI GPT-4o", "CV analysis and coaching"],
      ["n8n extraction nodes", "PDF, DOC, DOCX text extraction"],
    ],
  },
  {
    title: "Database & Storage",
    icon: DatabaseIcon,
    rows: [
      ["Supabase Postgres", "Persistence model"],
      ["pgvector", "Similarity search"],
      ["Supabase Storage", "Private CV and report files"],
      ["Signed URL", "Private report access"],
    ],
  },
] as const

export const roleMatrix = [
  ["Upload CV", "jobseeker", "superadmin"],
  ["View own analysis", "jobseeker", "superadmin"],
  ["View job match", "jobseeker", "superadmin"],
  ["View career coaching", "jobseeker", "superadmin"],
  ["Manage jobs", "hrd", "superadmin"],
  ["View anonymous candidates", "hrd", "superadmin"],
  ["View real candidate identity", "superadmin"],
  ["Approve HRD", "superadmin"],
  ["Monitor workflow", "superadmin"],
  ["Configure scoring/model", "superadmin"],
] as const

export const roleDashboardSummaries = [
  {
    title: "Jobseeker dashboard",
    body: "Upload CV, baca score overview, job matches, skill gap, coaching, full report, dan riwayat analisis.",
    status: "Implemented",
    to: "/jobseeker/dashboard",
  },
  {
    title: "HRD dashboard",
    body: "Kelola lowongan, required skills, minimum years, ranking kandidat anonim, dan ekspor laporan.",
    status: "Implemented",
    to: "/hrd/portal",
  },
  {
    title: "Superadmin dashboard",
    body: "Kelola user, approval HRD, lowongan, monitoring workflow, biaya AI, error rate, scoring, dan model.",
    status: "Implemented",
    to: "/superadmin/monitoring",
  },
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

export { BriefcaseBusinessIcon }
