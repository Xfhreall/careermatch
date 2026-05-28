create table if not exists public.chatbot_conversations (
  id uuid primary key default extensions.gen_random_uuid(),
  jobseeker_id text not null references public.users(id) on delete cascade,
  title text not null default 'Chat baru',
  mode text not null default 'direct' check (mode in ('direct', 'analysis')),
  analysis_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chatbot_messages (
  id uuid primary key default extensions.gen_random_uuid(),
  conversation_id uuid not null references public.chatbot_conversations(id) on delete cascade,
  jobseeker_id text not null references public.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_chatbot_conversations_user_updated
  on public.chatbot_conversations(jobseeker_id, updated_at desc);

create index if not exists idx_chatbot_messages_conversation_created
  on public.chatbot_messages(conversation_id, created_at asc);

drop trigger if exists set_chatbot_conversations_updated_at
  on public.chatbot_conversations;

create trigger set_chatbot_conversations_updated_at
  before update on public.chatbot_conversations
  for each row execute function public.set_updated_at();

alter table public.chatbot_conversations enable row level security;
alter table public.chatbot_messages enable row level security;

drop policy if exists chatbot_conversations_service_role_all
  on public.chatbot_conversations;
drop policy if exists chatbot_messages_service_role_all
  on public.chatbot_messages;

create policy chatbot_conversations_service_role_all
  on public.chatbot_conversations
  for all to service_role
  using (true)
  with check (true);

create policy chatbot_messages_service_role_all
  on public.chatbot_messages
  for all to service_role
  using (true)
  with check (true);
