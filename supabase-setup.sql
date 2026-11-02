-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
create table if not exists public.app_store (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

alter table public.app_store enable row level security;

drop policy if exists "test app access" on public.app_store;
create policy "test app access" on public.app_store
  for all to anon using (true) with check (true);

grant select, insert, update, delete on public.app_store to anon;
