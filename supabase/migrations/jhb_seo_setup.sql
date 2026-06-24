-- ============================================================================
-- jhb_seo — full, idempotent setup for Page SEO (incl. rich Home Page SEO).
-- Safe to run MULTIPLE times. Run ONCE in the Supabase SQL Editor for the
-- project that backs this site (NEXT_PUBLIC_SUPABASE_URL), then reload the
-- Admin → SEO page. The "Run Migration" button in Admin → SEO re-runs the
-- public.jhb_seo_run_migration() function this script installs.
--
-- Fixes:
--   • "Could not find the 'canonical' column of 'jhb_seo' in the schema cache"
--   • "column jhb_seo.meta_title does not exist"
-- by ensuring every column the app reads/writes exists, then reloading the
-- PostgREST schema cache.
-- ============================================================================

-- 1) Create the table if it doesn't exist at all (fresh project).
create table if not exists public.jhb_seo (
  path        text primary key,
  title       text,
  description text,
  keywords    text,
  og_image    text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

-- 2) Add every column the app uses (and the requested extras), idempotently.
alter table public.jhb_seo
  -- identity / bookkeeping
  add column if not exists id               uuid default gen_random_uuid(),
  add column if not exists page_type        text,            -- 'home' | 'page' | ... (optional)
  add column if not exists created_at       timestamptz not null default now(),
  add column if not exists updated_at       timestamptz not null default now(),
  -- titles / meta (the app's canonical fields)
  add column if not exists title            text,            -- internal page title
  add column if not exists meta_title       text,            -- <title>
  add column if not exists description      text,            -- meta description
  add column if not exists keywords         text,            -- meta keywords (comma list)
  add column if not exists canonical        text,            -- canonical URL
  -- Open Graph
  add column if not exists og_title         text,
  add column if not exists og_description   text,
  add column if not exists og_image         text,
  -- crawl + structured data + rich content
  add column if not exists robots           text,
  add column if not exists structured_data  text,            -- JSON-LD (stored as text)
  add column if not exists seo_content      text,            -- rich HTML SEO block
  add column if not exists slug             text,
  -- requested alias columns (kept for schema-completeness / external tools;
  -- the app reads/writes title/meta_title/description/keywords above).
  add column if not exists page_title       text,
  add column if not exists meta_description text,
  add column if not exists meta_keywords    text;

-- 3) Keep updated_at fresh on every write.
create or replace function public.jhb_seo_touch_updated_at()
  returns trigger
  language plpgsql
as $fn$
begin
  new.updated_at := now();
  return new;
end;
$fn$;

drop trigger if exists jhb_seo_set_updated_at on public.jhb_seo;
create trigger jhb_seo_set_updated_at
  before update on public.jhb_seo
  for each row execute function public.jhb_seo_touch_updated_at();

-- 4) Row Level Security (read for all, write for staff). Mirrors 01_schema.sql.
alter table public.jhb_seo enable row level security;

drop policy if exists jhb_seo_read on public.jhb_seo;
create policy jhb_seo_read on public.jhb_seo for select using (true);

drop policy if exists jhb_seo_write on public.jhb_seo;
create policy jhb_seo_write on public.jhb_seo for all
  using (public.jhb_role() = any (array['admin','editor','manager']))
  with check (public.jhb_role() = any (array['admin','editor','manager']));

-- 5) Seed a default Home SEO row so the editor always has something to load.
--    (The admin upserts richer values on first save.)
insert into public.jhb_seo (path, page_type, slug, meta_title, description, robots)
values (
  '/',
  'home',
  '/',
  'JHB Automations — Best IT Solutions & Digital Marketing Company in Salem',
  'JHB Automations offers IT Solutions, AI Automation, Web Development & Digital Marketing in Salem. Grow your business with data-driven strategies that deliver results.',
  'index, follow'
)
on conflict (path) do nothing;

-- 6) Self-service migration function called by the Admin → SEO "Run Migration"
--    button. SECURITY DEFINER so an authenticated admin can add columns + reload
--    the schema cache without superuser rights. Admin-gated inside the function.
create or replace function public.jhb_seo_run_migration()
  returns jsonb
  language plpgsql
  security definer
  set search_path to 'public'
as $fn$
declare
  cols jsonb;
begin
  -- Only a Super Admin may run schema repairs from the UI.
  if public.jhb_role() is distinct from 'admin' then
    raise exception 'Only a Super Admin can run the SEO migration.'
      using errcode = '42501';
  end if;

  -- Ensure the table exists, then ensure every column exists (idempotent).
  create table if not exists public.jhb_seo (
    path text primary key
  );

  alter table public.jhb_seo
    add column if not exists id               uuid default gen_random_uuid(),
    add column if not exists page_type        text,
    add column if not exists created_at       timestamptz not null default now(),
    add column if not exists updated_at       timestamptz not null default now(),
    add column if not exists title            text,
    add column if not exists meta_title       text,
    add column if not exists description      text,
    add column if not exists keywords         text,
    add column if not exists canonical        text,
    add column if not exists og_title         text,
    add column if not exists og_description   text,
    add column if not exists og_image         text,
    add column if not exists robots           text,
    add column if not exists structured_data  text,
    add column if not exists seo_content      text,
    add column if not exists slug             text,
    add column if not exists page_title       text,
    add column if not exists meta_description text,
    add column if not exists meta_keywords    text;

  insert into public.jhb_seo (path, page_type, slug, robots)
  values ('/', 'home', '/', 'index, follow')
  on conflict (path) do nothing;

  -- Reload PostgREST's schema cache so the new columns are visible immediately.
  notify pgrst, 'reload schema';

  select jsonb_agg(column_name order by ordinal_position)
    into cols
  from information_schema.columns
  where table_schema = 'public' and table_name = 'jhb_seo';

  return jsonb_build_object('ok', true, 'columns', cols);
end;
$fn$;

-- Let signed-in admins invoke it via supabase.rpc(); the function itself enforces
-- the admin check above.
grant execute on function public.jhb_seo_run_migration() to authenticated;

-- 7) Refresh the PostgREST schema cache now (for this one-time SQL run).
notify pgrst, 'reload schema';
