-- Letterbox initial schema: users, spaces, letters + RLS
-- See CONTEXT.md for the full product spec these tables implement.

create extension if not exists pgcrypto;

create type space_status as enum ('active', 'deletion_pending', 'deleted');
create type letter_status as enum ('sealed', 'unlocked', 'opened');

-- ---------------------------------------------------------------------------
-- users
-- One row per authenticated person. id mirrors auth.users.id (1:1 with Supabase Auth).
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  username text unique,
  push_token text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users can view their own row"
  on public.users for select
  using (auth.uid() = id);

create policy "users can insert their own row"
  on public.users for insert
  with check (auth.uid() = id);

create policy "users can update their own row"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Resolves a username to a user id without exposing email/push_token to other users.
-- SECURITY DEFINER so callers don't need direct SELECT on public.users to look up a recipient.
create or replace function public.resolve_username(lookup_username text)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from public.users where username = lookup_username;
$$;

revoke all on function public.resolve_username(text) from public;
grant execute on function public.resolve_username(text) to authenticated;

-- ---------------------------------------------------------------------------
-- spaces (Couples Space)
-- ---------------------------------------------------------------------------
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_a_id uuid not null references public.users (id) on delete cascade,
  user_b_id uuid references public.users (id) on delete cascade,
  status space_status not null default 'active',
  deletion_requested_by uuid references public.users (id),
  deletion_requested_at timestamptz,
  created_at timestamptz not null default now(),
  constraint space_members_distinct check (user_a_id is distinct from user_b_id)
);

alter table public.spaces enable row level security;

create policy "members can view their space"
  on public.spaces for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "a user can create a space as user_a"
  on public.spaces for insert
  with check (auth.uid() = user_a_id);

-- Joining via code and mutual-consent deletion are handled by dedicated
-- SECURITY DEFINER functions (added when that feature is built), not by a
-- general update policy — this keeps the single-use/lock-in and 48h
-- consent rules out of reach of a direct client-side UPDATE.

-- ---------------------------------------------------------------------------
-- letters
-- ---------------------------------------------------------------------------
create table public.letters (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users (id) on delete cascade,
  recipient_id uuid references public.users (id) on delete cascade,
  space_id uuid references public.spaces (id) on delete cascade,
  content text not null,
  unlock_date date not null,
  status letter_status not null default 'sealed',
  is_anonymous boolean not null default false,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.letters enable row level security;

create policy "sender can insert their own letter"
  on public.letters for insert
  with check (auth.uid() = sender_id);

create policy "sender can view letters they sent"
  on public.letters for select
  using (auth.uid() = sender_id);

-- Recipients only see non-anonymous letters directly through this table, so
-- sender identity for anonymous letters never reaches a recipient via any
-- direct query. Anonymous-letter inbox reads go through get_inbox() below.
create policy "recipient can view non-anonymous letters addressed to them"
  on public.letters for select
  using (auth.uid() = recipient_id and is_anonymous = false);

create policy "recipient can mark their letter opened"
  on public.letters for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- Recipient-safe inbox read: strips sender_id whenever is_anonymous is true,
-- and only returns letters that are already unlocked or opened (never sealed).
create or replace function public.get_inbox()
returns table (
  id uuid,
  sender_id uuid,
  content text,
  unlock_date date,
  status letter_status,
  is_anonymous boolean,
  opened_at timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    l.id,
    case when l.is_anonymous then null else l.sender_id end as sender_id,
    l.content,
    l.unlock_date,
    l.status,
    l.is_anonymous,
    l.opened_at,
    l.created_at
  from public.letters l
  where l.recipient_id = auth.uid()
    and l.status in ('unlocked', 'opened');
$$;

revoke all on function public.get_inbox() from public;
grant execute on function public.get_inbox() to authenticated;

create index letters_recipient_status_idx on public.letters (recipient_id, status);
create index letters_sender_idx on public.letters (sender_id);
create index letters_unlock_date_idx on public.letters (unlock_date) where status = 'sealed';
