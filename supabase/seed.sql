insert into public.scoring_configs (key, label, weight, updated_by)
values
  ('skill_match', 'Skill match', 70, null),
  ('experience_match', 'Experience match', 30, null)
on conflict (key) do update
set
  label = excluded.label,
  weight = excluded.weight,
  updated_by = excluded.updated_by;

insert into public.model_configs (key, agent, model, purpose, updated_by)
values
  ('cv_analyzer', 'CV Analyzer', 'GPT-4o', 'Extract, anonymize, structure', null),
  ('career_advisor', 'Career Advisor', 'GPT-4o', 'Skill gap and coaching', null),
  ('interview_prep', 'Interview Prep', 'GPT-4o', 'STAR question generation', null)
on conflict (key) do update
set
  agent = excluded.agent,
  model = excluded.model,
  purpose = excluded.purpose,
  updated_by = excluded.updated_by;

insert into public.platform_settings (key, label, description, value, updated_by)
values (
  'chatbot_guard_enabled',
  'Chatbot guard rule',
  'Enable topical relevance filtering before jobseeker chatbot messages reach the webhook.',
  'true'::jsonb,
  null
)
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  value = public.platform_settings.value,
  updated_by = excluded.updated_by;
