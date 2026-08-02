-- Lightweight unread count so pages other than /inbox (e.g. /write) can show
-- a badge without fetching full letter content.
create function public.get_unread_count()
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*)
  from public.letters l
  where (l.recipient_id = auth.uid() or (l.recipient_id is null and l.sender_id = auth.uid()))
    and l.status = 'unlocked';
$$;

revoke all on function public.get_unread_count() from public;
grant execute on function public.get_unread_count() to authenticated;
