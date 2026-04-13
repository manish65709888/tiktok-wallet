-- Run this in Supabase SQL Editor
-- Table to enforce single active session per user

create table if not exists public.active_sessions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  session_token text not null,
  device_info text,
  updated_at timestamptz default now()
);

-- Only the authenticated user can read/write their own row
alter table public.active_sessions enable row level security;

create policy "User can manage own session"
  on public.active_sessions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
