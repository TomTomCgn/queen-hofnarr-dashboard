-- Queen & Hofnarr Dashboard: Grundschema

create extension if not exists pgcrypto;

create table public.queen_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null unique,
  emotionality smallint not null check (emotionality between 1 and 10),
  fool_is_reason smallint not null check (fool_is_reason between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.fool_entries (
  id uuid primary key default gen_random_uuid(),
  entry_date date not null unique,
  joe_annoyance smallint not null check (joe_annoyance between 1 and 10),
  topic_variety smallint not null check (topic_variety between 1 and 10),
  need_for_rest smallint not null check (need_for_rest between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  created_by text not null check (created_by in ('queen', 'hofnarr')),
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_done_created_at_idx on public.events (done, created_at desc);

-- updated_at automatisch pflegen
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger queen_entries_set_updated_at
  before update on public.queen_entries
  for each row execute function public.set_updated_at();

create trigger fool_entries_set_updated_at
  before update on public.fool_entries
  for each row execute function public.set_updated_at();

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- Row Level Security: Browser (anon) darf nur lesen, geschrieben wird
-- ausschließlich serverseitig mit dem Service-Role-Key (umgeht RLS).
alter table public.queen_entries enable row level security;
alter table public.fool_entries enable row level security;
alter table public.events enable row level security;

create policy "anon_select_queen_entries" on public.queen_entries
  for select to anon using (true);
create policy "anon_select_fool_entries" on public.fool_entries
  for select to anon using (true);
create policy "anon_select_events" on public.events
  for select to anon using (true);

revoke insert, update, delete, truncate on public.queen_entries, public.fool_entries, public.events
  from anon, authenticated;

-- Realtime
alter publication supabase_realtime add table public.queen_entries;
alter publication supabase_realtime add table public.fool_entries;
alter publication supabase_realtime add table public.events;
