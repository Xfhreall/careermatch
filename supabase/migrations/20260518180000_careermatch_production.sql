create extension if not exists pgcrypto with schema extensions;
create extension if not exists vector with schema extensions;

create table if not exists public.companies (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null unique,
  website text,
  industry text,
  status text not null default 'active' check (status in ('pending', 'active', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id text primary key,
  email text not null unique,
  email_verified boolean not null default false,
  name text not null,
  avatar_url text,
  role text not null default 'jobseeker' check (role in ('jobseeker', 'hrd', 'superadmin')),
  status text not null default 'active' check (status in ('pending', 'active', 'rejected', 'suspended')),
  company_id uuid references public.companies(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id text primary key,
  expires_at timestamptz not null,
  token text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  user_id text not null references public.users(id) on delete cascade
);

create table if not exists public.accounts (
  id text primary key,
  account_id text not null,
  provider_id text not null,
  user_id text not null references public.users(id) on delete cascade,
  access_token text,
  refresh_token text,
  id_token text,
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  scope text,
  password text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_id, account_id)
);

create table if not exists public.verifications (
  id text primary key,
  identifier text not null,
  value text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_postings (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by text references public.users(id) on delete set null,
  title text not null,
  description text,
  required_skills text[] not null default '{}',
  min_experience_years integer not null default 0 check (min_experience_years >= 0),
  status text not null default 'active' check (status in ('draft', 'active', 'closed')),
  embedding_status text not null default 'pending' check (embedding_status in ('pending', 'synced', 'failed')),
  embedding extensions.vector(1536),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analysis_jobs (
  id uuid primary key default extensions.gen_random_uuid(),
  jobseeker_id text not null references public.users(id) on delete cascade,
  original_filename text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0),
  cv_storage_path text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analysis_results (
  id uuid primary key default extensions.gen_random_uuid(),
  analysis_job_id uuid not null references public.analysis_jobs(id) on delete cascade,
  analysis_id text not null unique,
  jobseeker_id text not null references public.users(id) on delete cascade,
  overall_score numeric(5, 2),
  job_matches jsonb not null default '[]'::jsonb,
  skill_gap jsonb not null default '[]'::jsonb,
  career_coaching text,
  report_storage_path text,
  response_payload jsonb not null,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.anonymous_candidate_matches (
  id uuid primary key default extensions.gen_random_uuid(),
  job_posting_id uuid not null references public.job_postings(id) on delete cascade,
  analysis_result_id uuid references public.analysis_results(id) on delete set null,
  candidate_code text not null,
  role_title text not null,
  match_score numeric(5, 2) not null check (match_score >= 0 and match_score <= 100),
  matched_skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (job_posting_id, candidate_code)
);

create table if not exists public.hrd_approval_requests (
  id text primary key,
  company_id uuid references public.companies(id) on delete set null,
  company_name text not null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by text references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_metrics (
  key text primary key,
  title text not null,
  value text not null,
  label text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.scoring_configs (
  key text primary key,
  label text not null,
  weight integer not null check (weight >= 0 and weight <= 100),
  updated_by text references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.model_configs (
  key text primary key,
  agent text not null,
  model text not null,
  purpose text not null,
  updated_by text references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_id text references public.users(id) on delete set null,
  event text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user_id on public.sessions(user_id);
create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_job_postings_company_status on public.job_postings(company_id, status);
create index if not exists idx_analysis_jobs_jobseeker_created on public.analysis_jobs(jobseeker_id, created_at desc);
create index if not exists idx_analysis_results_jobseeker_created on public.analysis_results(jobseeker_id, created_at desc);
create index if not exists idx_candidate_matches_job_score on public.anonymous_candidate_matches(job_posting_id, match_score desc);
create index if not exists idx_audit_events_created on public.audit_events(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'companies',
    'users',
    'sessions',
    'accounts',
    'verifications',
    'job_postings',
    'analysis_jobs',
    'hrd_approval_requests',
    'workflow_metrics',
    'scoring_configs',
    'model_configs'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end $$;

do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'companies',
    'users',
    'sessions',
    'accounts',
    'verifications',
    'job_postings',
    'analysis_jobs',
    'analysis_results',
    'anonymous_candidate_matches',
    'hrd_approval_requests',
    'workflow_metrics',
    'scoring_configs',
    'model_configs',
    'audit_events'
  ]
  loop
    policy_name := table_name || '_service_role_all';
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    execute format(
      'create policy %I on public.%I for all to service_role using (true) with check (true)',
      policy_name,
      table_name
    );
  end loop;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cv-uploads', 'cv-uploads', false, 10485760, array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]),
  ('analysis-reports', 'analysis-reports', false, 10485760, array[
    'application/json',
    'application/pdf',
    'text/plain'
  ])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists cv_uploads_service_role_all on storage.objects;
create policy cv_uploads_service_role_all
on storage.objects
for all
to service_role
using (bucket_id = 'cv-uploads')
with check (bucket_id = 'cv-uploads');

drop policy if exists analysis_reports_service_role_all on storage.objects;
create policy analysis_reports_service_role_all
on storage.objects
for all
to service_role
using (bucket_id = 'analysis-reports')
with check (bucket_id = 'analysis-reports');
