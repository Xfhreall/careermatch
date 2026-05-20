# CareerMatch

> **AI-Powered CV Analysis & Job Matching Platform** — Upload CV, dapatkan analisis kecocokan dengan lowongan kerja, skill gap assessment, dan career coaching berbasis AI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TanStack Router, TanStack React Query, TanStack Table, TanStack Start |
| **Styling** | Tailwind CSS v4, shadcn/ui, Framer Motion, Lucide Icons |
| **Backend** | TanStack Start (SSR + API Routes) via Cloudflare Workers |
| **Database** | Supabase |
| **Auth** | Better Auth |
| **AI Pipeline** | n8n Webhook (external workflow untuk CV parsing & job matching) |
| **DB Client** | Supabase JS Client |
| **Validation** | Zod |
| **Deployment** | Cloudflare Workers + Wrangler |
| **Language** | TypeScript |
| **Package Manager** | Bun |
| **Linting/Formatting** | Biome |

---

## Folder Structure

```
careermatch/
├── public/                  # Static assets (favicon, manifest, robots.txt)
│
├── src/
│   ├── features/            # Feature-based modules
│   │   ├── auth/            # Auth components, routing, user queries
│   │   ├── cv-analysis/     # CV analysis (upload, normalize, results, types)
│   │   ├── dashboard/       # Dashboard layouts, HRD/Superadmin/Jobseeker containers
│   │   └── platform/        # Platform-level API client, types, components
│   │
│   ├── lib/                 # Shared utilities
│   │   ├── server/          # Server-only (Supabase admin, auth, repository)
│   │   ├── auth.ts          # Better Auth server configuration
│   │   ├── auth-client.ts   # Better Auth client configuration
│   │   └── password.ts      # Password utilities
│   │
│   ├── routes/              # TanStack Router file-based routing
│   │   ├── api/             # Server API routes
│   │   │   ├── account/     # Profile & password management
│   │   │   ├── auth/        # Better Auth endpoints
│   │   │   ├── cv/          # CV analysis, history, results
│   │   │   ├── hrd/         # HRD dashboard, jobs, embeddings
│   │   │   └── superadmin/  # Super admin snapshot, approvals, config
│   │   ├── hrd/             # HRD pages (portal, jobs, candidates, profile)
│   │   ├── jobseeker/       # Jobseeker pages (dashboard, analyze, history)
│   │   ├── superadmin/      # Superadmin pages (approvals, monitoring, config)
│   │   ├── interview/       # Interview coach page
│   │   ├── platform/        # Architecture page
│   │   ├── __root.tsx       # Root layout
│   │   ├── index.tsx        # Landing page
│   │   └── login.tsx        # Login page
│   │
│   ├── shared/              # Shared UI components
│   │   ├── components/      # DataTable, shadcn/ui components, Stepper
│   │   └── lib/             # Shared utilities
│   │
│   ├── start.ts             # TanStack Start instance (middleware, CSRF, roles)
│   ├── router.tsx           # Router configuration
│   ├── routeTree.gen.ts     # Auto-generated route tree
│   └── styles.css           # Tailwind + shadcn + fonts
│
├── supabase/
│   ├── migrations/          # Database migrations (SQL)
│   ├── seed.sql             # Seed data
│   └── README.md
│
├── .agents/                 # AI agent skill definitions (development aids)
├── wrangler.toml            # Cloudflare Workers configuration
├── vite.config.ts           # Vite build configuration
├── nitro.config.ts          # Nitro server configuration
├── tsconfig.json            # TypeScript configuration
├── biome.json               # Biome linter/formatter config
├── components.json          # shadcn/ui configuration
├── package.json
└── .env.example             # Environment variables template
```

---

## Setup & Development

### Prerequisites

- **Bun** (package manager & runtime) — [install](https://bun.sh)
- **Node.js** >= 22 (for wrangler)
- **Supabase project** — [supabase.com](https://supabase.com)
- **Google OAuth credentials** — for Better Auth Google login
- **n8n webhook URL** — for AI CV analysis pipeline (opsional untuk development)

### 1. Clone & Install Dependencies

```bash
bun install
```

### 2. Environment Variables

Salin `.env.example` ke `.env` dan isi konfigurasi:

```bash
cp .env.example .env
```

| Variable | Deskripsi |
|----------|-----------|
| `N8N_WEBHOOK_URL` | Webhook n8n untuk AI job matching pipeline |
| `BETTER_AUTH_URL` | URL aplikasi (http://localhost:3000 untuk dev) |
| `BETTER_AUTH_SECRET` | Secret key untuk Better Auth |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `DATABASE_URL` | PostgreSQL connection string (Supabase direct) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) |
| `SUPABASE_DB_PASSWORD` | Password Supabase database |

> **Catatan:** Nilai-nilai default sudah ada di `wrangler.toml` untuk production. Untuk development lokal, isi `.env` dengan credential yang sesuai.

### 3. Database Setup

CareerMatch menggunakan Supabase sebagai database. Migration SQL ada di:

```bash
supabase/migrations/20260518180000_careermatch_production.sql
```

Jalankan migration:

```bash
bun run db:push
```

Atau import langsung SQL file ke Supabase SQL Editor.

Seed data (opsional):

```bash
bun run db:seed
```

### 4. Development Server

```bash
bun run dev
```

Aplikasi akan berjalan di **http://localhost:3000**

### 5. Build & Deploy

**Build:**

```bash
bun run build
```

**Deploy ke Cloudflare Workers:**

```bash
npx wrangler deploy
```

Atau gunakan GitHub Actions (lihat `.github/workflows/deploy.yml`).

---

## Role & Akses

Aplikasi memiliki 3 role pengguna:

| Role | Akses |
|------|-------|
| **Jobseeker** | Upload CV, analisis kecocokan, lihat hasil + career coaching |
| **HRD** | Kelola lowongan kerja, lihat kandidat anonim yang cocok |
| **Superadmin** | Approve HRD, atur konfigurasi scoring/model, monitoring |

---

## Fitur Utama

### Untuk Jobseeker
- **Upload CV** — PDF, DOC, DOCX (max 10MB)
- **AI Job Matching** — CV dianalisis oleh AI pipeline (n8n), dicocokkan dengan lowongan yang tersedia
- **Compatibility Score** — Skor kecocokan dalam persentase (0-100%)
- **Skill Gap Analysis** — Skill yang cocok vs skill yang kurang
- **Experience Match** — Perbandingan tahun pengalaman kandidat dengan requirement
- **Career Coaching** — Rekomendasi karir & pertanyaan interview berbasis AI
- **Riwayat Analisis** — Semua hasil analisis tersimpan, bisa diexport
- **Export Laporan** — Download laporan hasil analisis (.txt)

### Untuk HRD
- **Kelola Lowongan** — CRUD job posting (title, description, skills, min experience)
- **Candidate Matching** — Lihat kandidat anonim yang cocok dengan lowongan (match score, matched skills)
- **Embedding Refresh** — Sinkronisasi embedding lowongan
- **Portal HRD** — Dashboard ringkasan lowongan & kandidat

### Untuk Superadmin
- **Approval HRD** — Setujui/tolak pendaftaran HRD baru
- **Scoring Config** — Atur bobot scoring untuk AI matching
- **Model Config** — Konfigurasi model AI per agent
- **Monitoring** — Metrik & audit events

---

## Arsitektur Analisis CV

```
User Upload CV (PDF/DOC)
        │
        ▼
TanStack Start API Route (/api/cv/analyze)
        │
        ├── Upload ke Supabase Storage
        ├── Buat analysis_job (status: processing)
        │
        ▼
Forward CV ke n8n Webhook (AI Pipeline)
        │
        ▼
n8n melakukan:
  ├── Parse CV (AI/LLM)
  ├── Cocokkan dengan job posting
  ├── Hitung compatibility score
  ├── Identifikasi skill gap
  └── Generate career coaching
        │
        ▼
Response dinormalisasi → disimpan ke Supabase
        │
        ▼
User melihat hasil (3 tab):
  ├── Job Matches (ranking + score)
  ├── Career Coach (rekomendasi)
  └── Full Report (raw response)
```

> **Catatan:** Logika AI matching ada di **n8n workflow eksternal**, bukan di kode aplikasi ini. Aplikasi bertugas sebagai middleware: menerima upload, mengirim ke n8n, menormalisasi response, dan menampilkan hasil.

---

## Scripts

| Script | Deskripsi |
|--------|-----------|
| `bun run dev` | Jalankan development server (port 3000) |
| `bun run build` | Build production |
| `bun run preview` | Preview production build |
| `bun run test` | Jalankan test (Vitest) |
| `bun run lint` | Lint dengan Biome |
| `bun run format` | Format kode dengan Biome |
| `bun run typecheck` | TypeScript type checking |
| `bun run db:push` | Push migrasi ke Supabase |
| `bun run db:seed` | Seed data ke Supabase |

---

## Deployment

Deployment otomatis via **GitHub Actions** (`.github/workflows/deploy.yml`) ke **Cloudflare Workers**.

Konfigurasi Worker ada di `wrangler.toml`:
- Runtime: `nodejs_compat`
- Binding: Hyperdrive (PostgreSQL via connection pooler), KV Namespace
- Observability: traces & logs enabled

---

## License

Proyek ini adalah capstone project.
