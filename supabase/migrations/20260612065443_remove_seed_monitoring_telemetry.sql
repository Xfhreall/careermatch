delete from public.workflow_metrics
where key in (
  'n8n_success_rate',
  'ai_cost_weekly',
  'error_rate_24h',
  'hrd_pending'
);

delete from public.audit_events
where id in (
  'a1000000-0000-4000-8000-000000000001',
  'a1000000-0000-4000-8000-000000000002',
  'a1000000-0000-4000-8000-000000000003'
);

delete from public.hrd_approval_requests
where id in ('CM-HRD-72', 'CM-HRD-73', 'CM-HRD-74');

delete from public.users
where id in (
  'user_seed_jobseeker',
  'user_seed_hrd',
  'user_seed_superadmin'
);

delete from public.companies
where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333',
  '44444444-4444-4444-8444-444444444444',
  '55555555-5555-4555-8555-555555555555'
);
