-- Contacts: users you follow by username
create table public.contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  contact_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, contact_id),
  check (user_id <> contact_id)
);

alter table public.contacts enable row level security;

create policy "contacts: owner all"
  on public.contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Returns your contacts with how many non-anonymous letters they sent you
create function public.get_contacts()
returns table(
  contact_id uuid,
  username text,
  letters_from_them bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.contact_id,
    u.username,
    count(l.id) as letters_from_them
  from public.contacts c
  join public.users u on u.id = c.contact_id
  left join public.letters l on (
    l.sender_id = c.contact_id
    and (
      l.recipient_id = auth.uid()
      or (l.recipient_id is null and l.sender_id = auth.uid())
    )
    and l.is_anonymous = false
  )
  where c.user_id = auth.uid()
  group by c.contact_id, u.username
  order by letters_from_them desc, u.username;
$$;

revoke all on function public.get_contacts() from public;
grant execute on function public.get_contacts() to authenticated;

-- Adds a contact by username; returns their uuid or null if not found
create function public.add_contact(lookup_username text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contact_id uuid;
begin
  select id into v_contact_id
  from public.users
  where username = lookup_username;

  if v_contact_id is null or v_contact_id = auth.uid() then
    return null;
  end if;

  insert into public.contacts (user_id, contact_id)
  values (auth.uid(), v_contact_id)
  on conflict (user_id, contact_id) do nothing;

  return v_contact_id;
end;
$$;

revoke all on function public.add_contact(text) from public;
grant execute on function public.add_contact(text) to authenticated;
