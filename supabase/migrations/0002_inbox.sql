-- Sealed inbox support: enforce that letters always start sealed (flipping to
-- unlocked immediately only for same-day "deliver now" letters), close the
-- early-read gaps in the letters RLS policies, and extend get_inbox() to
-- surface self-letters and sealed metadata (existence + unlock date only).

-- ---------------------------------------------------------------------------
-- Always start sealed; auto-unlock only when unlock_date has already arrived.
-- Prevents a client from inserting a letter as pre-unlocked.
-- ---------------------------------------------------------------------------
create or replace function public.letters_set_initial_status()
returns trigger
language plpgsql
as $$
begin
  if new.unlock_date <= current_date then
    new.status := 'unlocked';
  else
    new.status := 'sealed';
  end if;
  new.opened_at := null;
  return new;
end;
$$;

create trigger letters_before_insert
  before insert on public.letters
  for each row execute function public.letters_set_initial_status();

-- ---------------------------------------------------------------------------
-- Close early-read gaps.
-- ---------------------------------------------------------------------------

-- Sender could otherwise read their own future-self letter's content anytime
-- via a direct table query, defeating the seal. Letters to other users are
-- still readable by the sender at any time (harmless — they wrote it).
drop policy "sender can view letters they sent" on public.letters;

create policy "sender can view letters they sent to others"
  on public.letters for select
  using (auth.uid() = sender_id and recipient_id is not null);

-- This policy let a recipient read a sealed non-anonymous letter's content
-- early via direct table query. All recipient/self reads now go through
-- get_inbox(), which enforces the seal.
drop policy "recipient can view non-anonymous letters addressed to them" on public.letters;

-- Self-letters have recipient_id null, so the original mark-opened policy
-- (auth.uid() = recipient_id) never matched them.
drop policy "recipient can mark their letter opened" on public.letters;

create policy "recipient can mark their letter opened"
  on public.letters for update
  using (auth.uid() = recipient_id or (recipient_id is null and auth.uid() = sender_id))
  with check (auth.uid() = recipient_id or (recipient_id is null and auth.uid() = sender_id));

-- ---------------------------------------------------------------------------
-- get_inbox(): every letter addressed to the caller, including self-letters.
-- Content is nulled while sealed so the UI can show "exists, unlocks on X"
-- without exposing the text early. Sender identity/username nulled for
-- anonymous letters.
-- ---------------------------------------------------------------------------
drop function if exists public.get_inbox();

create function public.get_inbox()
returns table (
  id uuid,
  sender_id uuid,
  sender_username text,
  content text,
  unlock_date date,
  status letter_status,
  is_anonymous boolean,
  is_self boolean,
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
    case when l.is_anonymous then null else su.username end as sender_username,
    case when l.status = 'sealed' then null else l.content end as content,
    l.unlock_date,
    l.status,
    l.is_anonymous,
    (l.recipient_id is null) as is_self,
    l.opened_at,
    l.created_at
  from public.letters l
  left join public.users su on su.id = l.sender_id
  where l.recipient_id = auth.uid()
     or (l.recipient_id is null and l.sender_id = auth.uid())
  order by l.created_at desc;
$$;

revoke all on function public.get_inbox() from public;
grant execute on function public.get_inbox() to authenticated;
