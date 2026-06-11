create table if not exists public.platform_settings (
  key text primary key,
  label text not null,
  description text not null default '',
  value jsonb not null,
  updated_by text references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_platform_settings_updated_at on public.platform_settings;
create trigger set_platform_settings_updated_at
before update on public.platform_settings
for each row execute function public.set_updated_at();

alter table public.platform_settings enable row level security;

drop policy if exists platform_settings_service_role_all on public.platform_settings;
create policy platform_settings_service_role_all
on public.platform_settings
for all
to service_role
using (true)
with check (true);

insert into public.platform_settings (key, label, description, value)
values (
  'chatbot_guard_enabled',
  'Chatbot guard rule',
  'Enable topical relevance filtering before jobseeker chatbot messages reach the webhook.',
  'true'::jsonb
)
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  value = public.platform_settings.value;
