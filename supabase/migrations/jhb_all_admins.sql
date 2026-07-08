-- jhb_all_admins.sql
-- Goal: collapse the role system to a single tier. Every account that can log in
-- gets FULL admin control — no editor/manager distinction.
--
-- Why this is a DB change and not a code change: the admin app's middleware, the
-- sidebar, every per-page "Super Admin only" guard, AND all RLS write policies key
-- off role = 'admin'. Making every profile 'admin' grants full control everywhere
-- at once. (A code-only change could NOT work: RLS runs in the database and would
-- still block saves for a non-admin session.)
--
-- Apply manually in the Supabase SQL editor — project ossvdnwcmsjbdlstldhh is not
-- reachable from the connected MCP. Safe to run more than once.

-- 1) Promote every existing user to admin.
update public.jhb_profiles
set role = 'admin'
where role is distinct from 'admin';

-- 2) New profiles default to admin at the column level.
alter table public.jhb_profiles
  alter column role set default 'admin';

-- 3) The signup trigger explicitly stamps role = 'admin' on every new auth user,
--    so anybody you create an email + password login for gets full control.
create or replace function public.jhb_handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $function$
begin
  insert into public.jhb_profiles (id, email, role)
  values (new.id, new.email, 'admin')
  on conflict (id) do nothing;
  return new;
end; $function$;
