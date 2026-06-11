revoke all on table public.platform_settings from anon, authenticated;

create index if not exists idx_platform_settings_updated_by
on public.platform_settings(updated_by);
