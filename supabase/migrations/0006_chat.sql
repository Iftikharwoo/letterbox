-- Conversations: unique pair of users (user_a < user_b enforces no duplicates)
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  user_a uuid references public.users(id) on delete cascade not null,
  user_b uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  check (user_a < user_b),
  unique(user_a, user_b)
);

alter table public.conversations enable row level security;

create policy "conversations: participants can view"
  on public.conversations for select
  using (auth.uid() = user_a or auth.uid() = user_b);

create policy "conversations: participants can create"
  on public.conversations for insert
  with check (auth.uid() = user_a or auth.uid() = user_b);

-- Messages
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz default now() not null
);

alter table public.messages enable row level security;

create policy "messages: participants can read"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

create policy "messages: sender can insert"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- Enable realtime on messages
alter publication supabase_realtime add table public.messages;

-- Get or create a conversation; returns conversation id
create function public.get_or_create_conversation(other_username text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_other_id uuid;
  v_conv_id uuid;
  v_user_a uuid;
  v_user_b uuid;
begin
  select id into v_other_id from public.users where username = other_username;
  if v_other_id is null or v_other_id = auth.uid() then
    return null;
  end if;

  if auth.uid() < v_other_id then
    v_user_a := auth.uid(); v_user_b := v_other_id;
  else
    v_user_a := v_other_id; v_user_b := auth.uid();
  end if;

  insert into public.conversations (user_a, user_b)
  values (v_user_a, v_user_b)
  on conflict (user_a, user_b) do nothing;

  select id into v_conv_id from public.conversations
  where user_a = v_user_a and user_b = v_user_b;

  return v_conv_id;
end;
$$;

revoke all on function public.get_or_create_conversation(text) from public;
grant execute on function public.get_or_create_conversation(text) to authenticated;

-- List conversations with last message preview
create function public.get_conversations()
returns table(
  conversation_id uuid,
  other_username text,
  other_id uuid,
  last_message text,
  last_message_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select * from (
    select
      c.id,
      case when c.user_a = auth.uid() then ub.username else ua.username end as other_username,
      case when c.user_a = auth.uid() then c.user_b else c.user_a end as other_id,
      (select m.content from public.messages m where m.conversation_id = c.id order by m.created_at desc limit 1) as last_message,
      (select m.created_at from public.messages m where m.conversation_id = c.id order by m.created_at desc limit 1) as last_message_at
    from public.conversations c
    join public.users ua on ua.id = c.user_a
    join public.users ub on ub.id = c.user_b
    where c.user_a = auth.uid() or c.user_b = auth.uid()
  ) sub
  order by last_message_at desc nulls last;
$$;

revoke all on function public.get_conversations() from public;
grant execute on function public.get_conversations() to authenticated;
