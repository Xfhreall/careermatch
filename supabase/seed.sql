insert into public.companies (id, name, website, industry, status)
values
  ('11111111-1111-4111-8111-111111111111', 'Kalibrr', 'https://kalibrr.com', 'Recruitment technology', 'active'),
  ('22222222-2222-4222-8222-222222222222', 'Glints', 'https://glints.com', 'Talent marketplace', 'active'),
  ('33333333-3333-4333-8333-333333333333', 'Mekari', 'https://mekari.com', 'SaaS', 'active'),
  ('44444444-4444-4444-8444-444444444444', 'Nusantara Digital', 'https://nusadigital.example', 'Software services', 'pending'),
  ('55555555-5555-4555-8555-555555555555', 'Sagara Labs', 'https://sagara.example', 'Product studio', 'pending')
on conflict (id) do update
set
  name = excluded.name,
  website = excluded.website,
  industry = excluded.industry,
  status = excluded.status;

insert into public.users (id, email, email_verified, name, avatar_url, role, status, company_id)
values
  ('user_seed_jobseeker', 'jobseeker@careermatch.local', true, 'Ayu W.', null, 'jobseeker', 'active', null),
  ('user_seed_hrd', 'hrd@kalibrr.example', true, 'Bima R.', null, 'hrd', 'active', '11111111-1111-4111-8111-111111111111'),
  ('user_seed_superadmin', 'admin@careermatch.local', true, 'Nadia S.', null, 'superadmin', 'active', null)
on conflict (id) do update
set
  email = excluded.email,
  email_verified = excluded.email_verified,
  name = excluded.name,
  avatar_url = excluded.avatar_url,
  role = excluded.role,
  status = excluded.status,
  company_id = excluded.company_id;

insert into public.job_postings (
  id,
  company_id,
  created_by,
  title,
  description,
  required_skills,
  min_experience_years,
  status,
  embedding_status
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '11111111-1111-4111-8111-111111111111',
    'user_seed_hrd',
    'Frontend Engineer',
    'Membangun UI rekrutmen dengan React, TypeScript, dan performa produksi.',
    array['React', 'TypeScript', 'TanStack'],
    2,
    'active',
    'synced'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '22222222-2222-4222-8222-222222222222',
    'user_seed_hrd',
    'Product Analyst',
    'Menganalisis funnel produk, eksperimen, dan dashboard bisnis.',
    array['SQL', 'Dashboarding', 'Experimentation'],
    1,
    'active',
    'synced'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    '33333333-3333-4333-8333-333333333333',
    'user_seed_hrd',
    'Implementation Consultant',
    'Membantu klien SaaS mengimplementasikan solusi berbasis API.',
    array['SaaS', 'Client discovery', 'API'],
    3,
    'active',
    'synced'
  )
on conflict (id) do update
set
  company_id = excluded.company_id,
  created_by = excluded.created_by,
  title = excluded.title,
  description = excluded.description,
  required_skills = excluded.required_skills,
  min_experience_years = excluded.min_experience_years,
  status = excluded.status,
  embedding_status = excluded.embedding_status;

insert into public.analysis_jobs (
  id,
  jobseeker_id,
  original_filename,
  mime_type,
  file_size_bytes,
  cv_storage_path,
  status
)
values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'user_seed_jobseeker',
  'ayu-w-careermatch-cv.pdf',
  'application/pdf',
  740000,
  'seed/user_seed_jobseeker/ayu-w-careermatch-cv.pdf',
  'completed'
)
on conflict (id) do update
set
  original_filename = excluded.original_filename,
  mime_type = excluded.mime_type,
  file_size_bytes = excluded.file_size_bytes,
  cv_storage_path = excluded.cv_storage_path,
  status = excluded.status;

insert into public.analysis_results (
  id,
  analysis_job_id,
  analysis_id,
  jobseeker_id,
  overall_score,
  job_matches,
  skill_gap,
  career_coaching,
  response_payload,
  raw_response
)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'cm-seed-analysis-001',
  'user_seed_jobseeker',
  88,
  '[
    {"jobTitle":"Frontend Engineer","company":"Kalibrr","compatibilityScore":92,"matchedSkills":["React","TypeScript","TanStack"],"missingSkills":["Accessibility audit"],"reasoning":"Profil kuat untuk UI produksi dan ekosistem React."},
    {"jobTitle":"Product Analyst","company":"Glints","compatibilityScore":86,"matchedSkills":["SQL","Dashboarding"],"missingSkills":["Experiment design"],"reasoning":"Cocok untuk peran analitik produk dengan sedikit penguatan eksperimen."},
    {"jobTitle":"Implementation Consultant","company":"Mekari","compatibilityScore":81,"matchedSkills":["SaaS","API"],"missingSkills":["Stakeholder discovery"],"reasoning":"Pengalaman implementasi SaaS memberi modal kuat untuk peran konsultatif."}
  ]'::jsonb,
  '[
    {"skill":"Accessibility audit","priority":"medium","recommendation":"Latih audit WCAG dasar dan keyboard navigation."},
    {"skill":"Experiment design","priority":"medium","recommendation":"Pelajari desain A/B test dan metrik produk."}
  ]'::jsonb,
  'Fokuskan CV pada dampak terukur, susun portofolio berdasarkan masalah bisnis, dan siapkan jawaban STAR untuk proyek React berskala produksi.',
  '{
    "analysisId":"cm-seed-analysis-001",
    "overallScore":88,
    "jobMatches":[
      {"jobTitle":"Frontend Engineer","company":"Kalibrr","compatibilityScore":92,"matchedSkills":["React","TypeScript","TanStack"],"missingSkills":["Accessibility audit"],"reasoning":"Profil kuat untuk UI produksi dan ekosistem React."},
      {"jobTitle":"Product Analyst","company":"Glints","compatibilityScore":86,"matchedSkills":["SQL","Dashboarding"],"missingSkills":["Experiment design"],"reasoning":"Cocok untuk peran analitik produk dengan sedikit penguatan eksperimen."},
      {"jobTitle":"Implementation Consultant","company":"Mekari","compatibilityScore":81,"matchedSkills":["SaaS","API"],"missingSkills":["Stakeholder discovery"],"reasoning":"Pengalaman implementasi SaaS memberi modal kuat untuk peran konsultatif."}
    ],
    "skillGap":[
      {"skill":"Accessibility audit","priority":"medium","recommendation":"Latih audit WCAG dasar dan keyboard navigation."},
      {"skill":"Experiment design","priority":"medium","recommendation":"Pelajari desain A/B test dan metrik produk."}
    ],
    "careerCoaching":"Fokuskan CV pada dampak terukur, susun portofolio berdasarkan masalah bisnis, dan siapkan jawaban STAR untuk proyek React berskala produksi.",
    "rawResponse":{"source":"seed"}
  }'::jsonb,
  '{"source":"seed"}'::jsonb
)
on conflict (analysis_id) do update
set
  overall_score = excluded.overall_score,
  job_matches = excluded.job_matches,
  skill_gap = excluded.skill_gap,
  career_coaching = excluded.career_coaching,
  response_payload = excluded.response_payload,
  raw_response = excluded.raw_response;

insert into public.anonymous_candidate_matches (
  id,
  job_posting_id,
  analysis_result_id,
  candidate_code,
  role_title,
  match_score,
  matched_skills
)
values
  ('f1000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Candidate CM-1042', 'Frontend Engineer', 92, array['React', 'TypeScript']),
  ('f1000000-0000-4000-8000-000000000002', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Candidate CM-2210', 'Product Analyst', 86, array['SQL', 'Experimentation']),
  ('f1000000-0000-4000-8000-000000000003', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Candidate CM-1187', 'Implementation Consultant', 81, array['SaaS', 'API'])
on conflict (job_posting_id, candidate_code) do update
set
  analysis_result_id = excluded.analysis_result_id,
  role_title = excluded.role_title,
  match_score = excluded.match_score,
  matched_skills = excluded.matched_skills;

insert into public.hrd_approval_requests (id, company_id, company_name, email, status)
values
  ('CM-HRD-72', '44444444-4444-4444-8444-444444444444', 'Nusantara Digital', 'hrd@nusadigital.id', 'pending'),
  ('CM-HRD-73', '55555555-5555-4555-8555-555555555555', 'Sagara Labs', 'people@sagara.example', 'pending'),
  ('CM-HRD-74', null, 'Arunika Tech', 'talent@arunika.example', 'pending')
on conflict (id) do update
set
  company_id = excluded.company_id,
  company_name = excluded.company_name,
  email = excluded.email,
  status = excluded.status;

insert into public.workflow_metrics (key, title, value, label)
values
  ('n8n_success_rate', 'n8n workflow', '99.2%', 'success rate'),
  ('ai_cost_weekly', 'AI cost', '$42.80', 'this week'),
  ('error_rate_24h', 'Error rate', '0.8%', 'last 24h'),
  ('hrd_pending', 'HRD approvals', '3', 'pending review')
on conflict (key) do update
set
  title = excluded.title,
  value = excluded.value,
  label = excluded.label;

insert into public.scoring_configs (key, label, weight, updated_by)
values
  ('skill_match', 'Skill match', 70, 'user_seed_superadmin'),
  ('experience_match', 'Experience match', 30, 'user_seed_superadmin')
on conflict (key) do update
set
  label = excluded.label,
  weight = excluded.weight,
  updated_by = excluded.updated_by;

insert into public.model_configs (key, agent, model, purpose, updated_by)
values
  ('cv_analyzer', 'CV Analyzer', 'GPT-4o', 'Extract, anonymize, structure', 'user_seed_superadmin'),
  ('career_advisor', 'Career Advisor', 'GPT-4o', 'Skill gap and coaching', 'user_seed_superadmin'),
  ('interview_prep', 'Interview Prep', 'GPT-4o', 'STAR question generation', 'user_seed_superadmin')
on conflict (key) do update
set
  agent = excluded.agent,
  model = excluded.model,
  purpose = excluded.purpose,
  updated_by = excluded.updated_by;

insert into public.audit_events (id, actor_id, event, detail, created_at)
values
  ('a1000000-0000-4000-8000-000000000001', 'user_seed_superadmin', 'workflow.retry', 'n8n retry after timeout', now() - interval '50 minutes'),
  ('a1000000-0000-4000-8000-000000000002', 'user_seed_superadmin', 'hrd.approval.approved', 'Company profile approved by superadmin', now() - interval '1 hour 16 minutes'),
  ('a1000000-0000-4000-8000-000000000003', 'user_seed_superadmin', 'scoring.weight.updated', 'Skill 70 / Experience 30 applied', now() - interval '2 hours 34 minutes')
on conflict (id) do update
set
  actor_id = excluded.actor_id,
  event = excluded.event,
  detail = excluded.detail,
  created_at = excluded.created_at;
