-- Resolve the current authenticated admin session without exposing admin_users
-- through direct browser-side table selects.

create function public.get_current_admin_session()
returns table (
  id uuid,
  role public.admin_role,
  status public.admin_status,
  name text,
  email text
)
language sql
stable
security definer
set search_path = public
as $$
  select au.id, au.role, au.status, au.name, au.email
  from public.admin_users au
  where au.user_id = auth.uid()
    and au.status = 'active'
    and au.role = any(array['super_admin', 'operator', 'viewer']::public.admin_role[])
  limit 1;
$$;

revoke all on function public.get_current_admin_session() from public;
revoke all on function public.get_current_admin_session() from anon;
grant execute on function public.get_current_admin_session() to authenticated;
