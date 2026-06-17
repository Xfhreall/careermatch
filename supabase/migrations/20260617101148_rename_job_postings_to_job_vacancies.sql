DROP TABLE IF EXISTS public.job_postings CASCADE;

create table public.job_vacancies (
  id uuid not null default extensions.uuid_generate_v4 (),
  role_name text null,
  company_name text null,
  job_description text null,
  requirements text[] null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  content text null,
  metadata jsonb null,
  embedding extensions.vector(1536) null,
  constraint job_vacancies_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists job_vacancies_embedding_idx on public.job_vacancies using ivfflat (embedding extensions.vector_cosine_ops)
with
  (lists = '100') TABLESPACE pg_default;

alter table public.job_vacancies enable row level security;
create policy job_vacancies_service_role_all on public.job_vacancies for all to service_role using (true) with check (true);

ALTER TABLE public.anonymous_candidate_matches RENAME COLUMN job_posting_id TO job_vacancy_id;

ALTER TABLE public.anonymous_candidate_matches 
  ADD CONSTRAINT anonymous_candidate_matches_job_vacancy_id_fkey 
  FOREIGN KEY (job_vacancy_id) REFERENCES public.job_vacancies(id) ON DELETE CASCADE;

DROP INDEX IF EXISTS idx_candidate_matches_job_score;
create index if not exists idx_candidate_matches_job_score on public.anonymous_candidate_matches(job_vacancy_id, match_score desc);
