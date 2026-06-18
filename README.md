# CareerMatch

> **AI-Powered CV Analysis & Job Matching Platform**
>
> Upload your CV and get AI-powered analysis of job compatibility, skill gaps, and personalized career coaching. Designed for jobseekers seeking the perfect career match and HR teams screening candidates efficiently.

**Core Features:**
- CV Upload and Parsing — Support PDF, DOC, DOCX formats
- AI Job Matching — Intelligent matching powered by n8n AI pipeline
- Compatibility Scoring — Percentage-based job fit analysis
- Skill Gap Analysis — Identify missing and matching skills
- Career Coaching — AI-generated interview prep and career recommendations
- Multi-role System — Jobseeker, HR, and Superadmin dashboards

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TanStack Router, TanStack React Query, TanStack Table |
| **Styling** | Tailwind CSS v4, shadcn/ui, Framer Motion, Lucide Icons |
| **Backend** | TanStack Start (SSR + API Routes) via Cloudflare Workers |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Better Auth with Google OAuth |
| **AI Pipeline** | n8n Webhook (external CV parsing and job matching workflow) |
| **DB Client** | Supabase JS Client |
| **Validation** | Zod |
| **Deployment** | Cloudflare Workers via Alchemy |
| **Language** | TypeScript |
| **Package Manager** | Bun |
| **Code Quality** | Biome (linting and formatting) |

---

## Project Structure

```
careermatch/
├── public/                  # Static assets (favicon, manifest, robots.txt)
│
├── src/
│   ├── features/            # Feature-based modules organized by domain
│   │   ├── auth/            # Authentication (login, signup, user queries)
│   │   ├── cv-analysis/     # CV upload, parsing, normalization, results display
│   │   ├── dashboard/       # Role-specific dashboards (Jobseeker, HRD, Superadmin)
│   │   └── platform/        # Platform utilities and shared API client
│   │
│   ├── hooks/               # Custom React hooks
│   │
│   ├── lib/                 # Shared utilities and configuration
│   │   ├── server/          # Server-only utilities (Supabase admin, auth, data access)
│   │   ├── auth.ts          # Better Auth server configuration
│   │   ├── auth-client.ts   # Better Auth client-side configuration
│   │   └── password.ts      # Password hashing and verification utilities
│   │
│   ├── routes/              # TanStack Router file-based routing structure
│   │   ├── api/             # Server API routes
│   │   │   ├── account/     # User profile and password management endpoints
│   │   │   ├── auth/        # Better Auth OAuth and session endpoints
│   │   │   ├── cv/          # CV analysis submission and result retrieval
│   │   │   ├── hrd/         # HRD job and candidate management endpoints
│   │   │   └── superadmin/  # Admin configuration and approval endpoints
│   │   ├── hrd/             # HRD role pages (dashboard, job listings, candidates)
│   │   ├── jobseeker/       # Jobseeker role pages (dashboard, CV analysis, history)
│   │   ├── superadmin/      # Superadmin role pages (approvals, monitoring)
│   │   ├── interview/       # Interview preparation and coaching page
│   │   ├── platform/        # Platform architecture documentation page
│   │   ├── __root.tsx       # Root layout wrapper
│   │   ├── index.tsx        # Landing page
│   │   └── login.tsx        # Authentication page
│   │
│   ├── shared/              # Shared UI components and utilities
│   │   ├── components/      # Reusable components (DataTable, Stepper, shadcn/ui)
│   │   └── lib/             # Shared utility functions
│   │
│   ├── start.ts             # TanStack Start server configuration
│   ├── router.tsx           # Router setup and configuration
│   ├── routeTree.gen.ts     # Auto-generated route tree (do not edit)
│   └── styles.css           # Global styles (Tailwind CSS, shadcn/ui, custom fonts)
│
├── supabase/                # Database migrations and seeding
│   ├── migrations/          # SQL migration files
│   ├── seed.sql             # Initial seed data
│   └── README.md
│
├── .agents/                 # AI agent skill definitions for development
├── alchemy.run.ts           # Cloudflare Workers deployment configuration
├── vite.config.ts           # Vite bundler configuration
├── nitro.config.ts          # Nitro server configuration for TanStack Start
├── tsconfig.json            # TypeScript compiler options
├── biome.json               # Biome code quality configuration
├── components.json          # shadcn/ui component registry
├── package.json             # Dependencies and scripts
└── .env.example             # Environment variables template
```

---

## Getting Started

### Prerequisites

- **Bun** (package manager and runtime) — [install](https://bun.sh)
- **Cloudflare account with API token** — for deploying via Alchemy
- **Supabase project** — [supabase.com](https://supabase.com)
- **Google OAuth credentials** — for Better Auth Google login
- **n8n webhook URL** — for AI CV analysis pipeline (optional for development)

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-----------|
| `N8N_WEBHOOK_URL` | Webhook URL for n8n AI job matching pipeline |
| `CHATBOT_URL` | Webhook URL for n8n interview and career coaching |
| `BETTER_AUTH_URL` | Application URL (http://localhost:3000 for development) |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth sessions |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID for social login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `DATABASE_URL` | PostgreSQL connection string for Hyperdrive origin |
| `SUPABASE_POOLER_URL` | Optional Supabase connection pooler URL |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase public anonymous key (client-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `SUPABASE_DB_PASSWORD` | Supabase database password |
| `ALCHEMY_PASSWORD` | Encryption password for Alchemy secrets (must be stable across deployments) |
| `ALCHEMY_STATE_TOKEN` | Alchemy persistent state token for Cloudflare (required for CI) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for deploying Alchemy |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `CLOUDFLARE_WORKER_NAME` | Production Worker name (optional, defaults to `careermatch-capstone`) |

Security note: Never commit `.env`, `.dev.vars`, `.alchemy`, or `wrangler.toml`. Store production secrets in GitHub Secrets, which are read by `alchemy.run.ts` via `process.env` and `alchemy.secret()`.

### 3. Database Setup

CareerMatch uses Supabase as the PostgreSQL database. Migrations are located in:

```
supabase/migrations/20260518180000_careermatch_production.sql
```

Run migrations:

```bash
bun run db:push
```

Alternatively, import the SQL file directly into Supabase SQL Editor.

Optional seed data:

```bash
bun run db:seed
```

### 4. Development Server

The development server runs via Alchemy. This command builds `.output` first, then starts the local Worker on port 3000:

```bash
bun run dev
```

The application will be available at **http://localhost:3000**

For Vite dev server without Cloudflare/Alchemy:

```bash
bun run dev:vite
```

### 5. Build and Deploy

Build for production:

```bash
bun run build
```

Deploy to Cloudflare Workers via Alchemy:

```bash
bun run deploy:build
```

For automated deployment, use GitHub Actions (see `.github/workflows/deploy.yml`). Ensure all production variables are set as GitHub Secrets, not in the repository.

---

## User Roles and Access Control

The application has three user roles with different access levels:

| Role | Permissions |
|------|-------------|
| **Jobseeker** | Upload CV, analyze job compatibility, view results and career coaching recommendations |
| **HR** | Manage job postings, view anonymized matching candidates, refresh job embeddings |
| **Superadmin** | Approve new HR registrations, configure scoring weights and AI models, monitor system metrics |

---

## Core Features

### For Jobseekers

- **CV Upload and Parsing** — Support for PDF, DOC, DOCX formats (max 10MB)
- **AI-Powered Job Matching** — CV analyzed by n8n AI pipeline and matched against available job postings
- **Compatibility Scoring** — Numerical job fit score (0-100%) for each matched position
- **Skill Gap Analysis** — Detailed comparison of candidate skills vs job requirements
- **Experience Matching** — Years of experience alignment between candidate and job
- **Career Coaching** — AI-generated interview preparation questions and career recommendations
- **Analysis History** — Persistent storage of all previous analyses for reference
- **Report Export** — Download analysis results as text files for offline review

### For HR Teams

- **Job Posting Management** — Create, read, update, and delete job listings with detailed specifications
- **Candidate Matching** — View anonymized candidates ranked by compatibility with specific jobs
- **Embedding Synchronization** — Refresh and update job embeddings for accurate matching
- **HR Dashboard** — Centralized overview of posted jobs and candidate pipeline

### For Superadmin

- **HR Registration Approval** — Review and approve or reject new HR account registrations
- **Scoring Configuration** — Adjust weights and parameters for AI matching algorithm
- **AI Model Configuration** — Configure and manage AI models used by different agents
- **System Monitoring** — View system metrics, audit logs, and performance analytics

---

## CV Analysis Architecture

```
User uploads CV (PDF/DOC)
        |
        v
TanStack Start API Route (/api/cv/analyze)
        |
        +-- Upload file to Supabase Storage
        +-- Create analysis_job record (status: processing)
        |
        v
Forward CV to n8n Webhook (External AI Pipeline)
        |
        v
n8n performs:
  +-- Parse and extract CV data
  +-- Match against job postings
  +-- Calculate compatibility scores
  +-- Identify skill gaps
  +-- Generate career coaching recommendations
        |
        v
Normalize response and save to Supabase
        |
        v
User views results in three tabs:
  +-- Job Matches (ranked by score)
  +-- Career Coaching (recommendations)
  +-- Full Report (raw analysis data)
```

Note: The AI matching logic resides in the external n8n workflow, not in this application code. This application serves as middleware: it receives uploads, forwards them to n8n, normalizes responses, and displays results to users.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Build and start local Worker via Alchemy on port 3000 |
| `bun run dev:alchemy` | Same as `dev`; explicitly uses Alchemy |
| `bun run dev:vite` | Run Vite dev server without Alchemy or Cloudflare |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build locally |
| `bun run deploy` | Deploy built output to Cloudflare via Alchemy using Node runtime |
| `bun run deploy:build` | Build and deploy to Cloudflare via Alchemy in one command |
| `bun run test` | Run test suite with Vitest |
| `bun run lint` | Lint code with Biome |
| `bun run format` | Format code with Biome |
| `bun run typecheck` | Run TypeScript type checking |
| `bun run db:push` | Push database migrations to Supabase |
| `bun run db:seed` | Seed initial data into Supabase |

---

## Deployment

Automated deployment occurs via **GitHub Actions** (`.github/workflows/deploy.yml`) to **Cloudflare Workers** using **Alchemy**.

Worker configuration is defined in `alchemy.run.ts`:
- **Runtime:** nodejs_compat
- **Assets:** .output/public (static files)
- **Entrypoint:** .output/server/index.mjs
- **Bindings:** Hyperdrive database, AUTH_KV store, and environment secrets via `alchemy.secret()`
- **Observability:** Traces and logs enabled

Deployment secrets are not stored in the repository. For CI/CD, set the following GitHub Secrets:

```
ALCHEMY_PASSWORD
ALCHEMY_STATE_TOKEN
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
N8N_WEBHOOK_URL
CHATBOT_URL
BETTER_AUTH_URL
BETTER_AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
DATABASE_URL
SUPABASE_POOLER_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_PASSWORD
```

Optional: `CLOUDFLARE_WORKER_NAME` to override the default Worker name.

Both `ALCHEMY_PASSWORD` and `ALCHEMY_STATE_TOKEN` must be long random values that remain stable across deployments. Generate locally with:

```bash
openssl rand -hex 32
```

Save the output as the GitHub Secret `ALCHEMY_STATE_TOKEN`.

---

## Development Workflow

### Local Development

1. Start the development server:
   ```bash
   bun run dev
   ```

2. Open http://localhost:3000 in your browser

3. Create a test account or use existing credentials to explore features

4. Make changes to source files; the dev server will hot-reload

### Testing

Run the test suite:

```bash
bun run test
```

Run tests in watch mode:

```bash
bun run test --watch
```

### Code Quality

Lint code:

```bash
bun run lint
```

Format code:

```bash
bun run format
```

Check TypeScript types:

```bash
bun run typecheck
```

---

## Troubleshooting

### Port 3000 Already in Use

If port 3000 is already in use, modify the Alchemy configuration in `alchemy.run.ts` or set the `PORT` environment variable before running `bun run dev`.

### Database Connection Issues

Ensure your `DATABASE_URL` and Supabase credentials are correct in `.env`. Test the connection by running `bun run db:push`.

### Authentication Failing

Verify that `BETTER_AUTH_URL` matches your application URL and that Google OAuth credentials are correctly set in `.env`.

### n8n Webhook Errors

If CV analysis fails, check that `N8N_WEBHOOK_URL` is accessible and the n8n workflow is active and properly configured.

---

## Contributing

When contributing to CareerMatch:

1. Create a feature branch from `main`
2. Make your changes and test locally
3. Run linting and formatting: `bun run format && bun run lint`
4. Run tests to ensure nothing breaks: `bun run test`
5. Create a pull request with a clear description of changes

---

## License

This project is a capstone project.
