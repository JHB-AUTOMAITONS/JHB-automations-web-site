-- ============================================================================
-- JHB Automations — schema migration for NEW Supabase project
-- Target project: ossvdnwcmsjbdlstldhh.supabase.co
-- Source project: JK FINSTRIDE (wzvzzcuennotfutklulh) — jhb_* objects only
--
-- HOW TO RUN:
--   1. Open the NEW project's dashboard -> SQL Editor -> New query
--   2. Paste this whole file, click RUN.  (creates tables, functions, RLS,
--      triggers, storage bucket + policies)
--   3. Then run 02_data.sql to load content.
--   4. Then follow 03_runbook.md to create the admin user.
--
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

create table if not exists public.jhb_profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'editor' check (role = any (array['admin','editor','manager'])),
  created_at timestamptz not null default now()
);

create table if not exists public.jhb_content (
  key        text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists public.jhb_settings (
  key        text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists public.jhb_media (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  path              text not null,
  url               text not null,
  size              integer,
  mime              text,
  created_at        timestamptz not null default now(),
  uploaded_by       uuid,
  alt_text          text,
  alt_updated_at    timestamptz,
  image_title       text,
  updated_at        timestamptz,
  image_caption     text,
  image_description text,
  image_keywords    text[] not null default '{}'::text[],
  image_filename    text,
  og_title          text,
  og_description    text
);

create table if not exists public.jhb_activity_log (
  id         bigint generated always as identity primary key,
  user_id    uuid,
  user_email text,
  action     text not null,
  detail     text,
  created_at timestamptz not null default now()
);

create table if not exists public.jhb_leads (
  id         bigint generated always as identity primary key,
  name       text,
  company    text,
  email      text,
  phone      text,
  message    text,
  source     text not null default 'contact',
  status     text not null default 'new' check (status = any (array['new','contacted','closed'])),
  created_at timestamptz not null default now()
);

create table if not exists public.jhb_pageviews (
  id         bigint generated always as identity primary key,
  path       text not null,
  referrer   text,
  created_at timestamptz not null default now()
);

create table if not exists public.jhb_seo (
  path        text primary key,
  title       text,
  description text,
  keywords    text,
  og_image    text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

create table if not exists public.jhb_services (
  key                text primary key,
  slug               text unique not null,
  meta_title         text,
  meta_description   text,
  meta_keywords      text,
  sort_order         integer not null default 0,
  updated_at         timestamptz not null default now(),
  updated_by         uuid,
  status             text not null default 'draft' check (status = any (array['draft','published'])),
  hero_heading       text,
  hero_description   text,
  features           jsonb not null default '[]'::jsonb,
  whats_included     jsonb not null default '{}'::jsonb,
  faq                jsonb not null default '[]'::jsonb,
  cta                jsonb,
  image_url          text,
  image_alt          text,
  content_updated_at timestamptz,
  image_title        text,
  hero_link          text
);

create table if not exists public.jhb_home (
  key        text primary key check (key = any (array['draft','published'])),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists public.jhb_posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  title            text not null,
  excerpt          text,
  content_html     text,
  cover_image      text,
  category         text,
  tags             text[] not null default '{}'::text[],
  author           text not null default 'JHB Automations',
  status           text not null default 'draft' check (status = any (array['draft','published'])),
  meta_title       text,
  meta_description text,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  updated_by       uuid
);

create table if not exists public.jhb_service_faqs (
  id          uuid primary key default gen_random_uuid(),
  service_key text not null,
  question    text not null,
  answer      text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

create table if not exists public.jhb_service_links (
  id          uuid primary key default gen_random_uuid(),
  service_key text not null,
  anchor_text text not null,
  url         text not null,
  type        text not null default 'internal' check (type = any (array['internal','external'])),
  new_tab     boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  link_type   text not null default 'dofollow' check (link_type = any (array['dofollow','nofollow'])),
  sponsored   boolean not null default false,
  ugc         boolean not null default false
);

create table if not exists public.jhb_testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text not null default ''::text,
  company    text not null default ''::text,
  quote      text not null,
  rating     integer not null default 5 check (rating >= 1 and rating <= 5),
  photo_url  text,
  sort_order integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists public.jhb_home_faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  sort_order integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists public.jhb_partners (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  logo_alt    text,
  website_url text,
  description text,
  sort_order  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid,
  card_style  text not null default 'default'
);

create table if not exists public.jhb_client_logos (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  alt_text    text,
  image_title text,
  sort_order  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  updated_by  uuid
);

create table if not exists public.jhb_versions (
  id             uuid primary key default gen_random_uuid(),
  module         text not null,
  label          text,
  version_number integer not null default 1,
  data           jsonb not null,
  summary        text,
  user_id        uuid,
  user_email     text,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FUNCTIONS  (verbatim from source)
-- ---------------------------------------------------------------------------

create or replace function public.jhb_role()
  returns text
  language sql
  security definer
  set search_path to 'public'
as $function$
  select role from public.jhb_profiles where id = auth.uid();
$function$;

create or replace function public.jhb_handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $function$
begin
  insert into public.jhb_profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $function$;

-- Auto-create a jhb_profiles row whenever a new auth user is created
drop trigger if exists jhb_on_auth_user_created on auth.users;
create trigger jhb_on_auth_user_created
  after insert on auth.users
  for each row execute function public.jhb_handle_new_user();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.jhb_profiles      enable row level security;
alter table public.jhb_content       enable row level security;
alter table public.jhb_settings      enable row level security;
alter table public.jhb_media         enable row level security;
alter table public.jhb_activity_log  enable row level security;
alter table public.jhb_leads         enable row level security;
alter table public.jhb_pageviews     enable row level security;
alter table public.jhb_seo           enable row level security;
alter table public.jhb_services      enable row level security;
alter table public.jhb_home          enable row level security;
alter table public.jhb_posts         enable row level security;
alter table public.jhb_service_faqs  enable row level security;
alter table public.jhb_service_links enable row level security;
alter table public.jhb_testimonials  enable row level security;
alter table public.jhb_home_faqs     enable row level security;
alter table public.jhb_partners      enable row level security;
alter table public.jhb_client_logos  enable row level security;
alter table public.jhb_versions      enable row level security;

-- profiles
drop policy if exists jhb_profiles_self_read on public.jhb_profiles;
create policy jhb_profiles_self_read on public.jhb_profiles for select
  using ((id = auth.uid()) or (jhb_role() = 'admin'));
drop policy if exists jhb_profiles_admin_write on public.jhb_profiles;
create policy jhb_profiles_admin_write on public.jhb_profiles for all
  using (jhb_role() = 'admin') with check (jhb_role() = 'admin');

-- content
drop policy if exists jhb_content_read on public.jhb_content;
create policy jhb_content_read on public.jhb_content for select using (true);
drop policy if exists jhb_content_write on public.jhb_content;
create policy jhb_content_write on public.jhb_content for all
  using (jhb_role() = any (array['admin','editor','manager']))
  with check (jhb_role() = any (array['admin','editor','manager']));

-- settings
drop policy if exists jhb_settings_read on public.jhb_settings;
create policy jhb_settings_read on public.jhb_settings for select using (true);
drop policy if exists jhb_settings_write on public.jhb_settings;
create policy jhb_settings_write on public.jhb_settings for all
  using (jhb_role() = any (array['admin','editor','manager']))
  with check (jhb_role() = any (array['admin','editor','manager']));

-- media
drop policy if exists jhb_media_read on public.jhb_media;
create policy jhb_media_read on public.jhb_media for select using (true);
drop policy if exists jhb_media_write on public.jhb_media;
create policy jhb_media_write on public.jhb_media for all
  using (jhb_role() = any (array['admin','editor','manager']))
  with check (jhb_role() = any (array['admin','editor','manager']));

-- activity_log
drop policy if exists jhb_activity_read on public.jhb_activity_log;
create policy jhb_activity_read on public.jhb_activity_log for select
  using (jhb_role() = any (array['admin','editor','manager']));
drop policy if exists jhb_activity_insert on public.jhb_activity_log;
create policy jhb_activity_insert on public.jhb_activity_log for insert
  with check (jhb_role() = any (array['admin','editor','manager']));

-- leads
drop policy if exists jhb_leads_insert on public.jhb_leads;
create policy jhb_leads_insert on public.jhb_leads for insert with check (true);
drop policy if exists jhb_leads_read on public.jhb_leads;
create policy jhb_leads_read on public.jhb_leads for select
  using (jhb_role() = any (array['admin','editor','manager']));
drop policy if exists jhb_leads_update on public.jhb_leads;
create policy jhb_leads_update on public.jhb_leads for update
  using (jhb_role() = any (array['admin','editor','manager']));
drop policy if exists jhb_leads_delete on public.jhb_leads;
create policy jhb_leads_delete on public.jhb_leads for delete
  using (jhb_role() = any (array['admin','editor','manager']));

-- pageviews
drop policy if exists jhb_pageviews_insert on public.jhb_pageviews;
create policy jhb_pageviews_insert on public.jhb_pageviews for insert with check (true);
drop policy if exists jhb_pageviews_read on public.jhb_pageviews;
create policy jhb_pageviews_read on public.jhb_pageviews for select
  using (jhb_role() = any (array['admin','editor','manager']));

-- seo
drop policy if exists jhb_seo_read on public.jhb_seo;
create policy jhb_seo_read on public.jhb_seo for select using (true);
drop policy if exists jhb_seo_write on public.jhb_seo;
create policy jhb_seo_write on public.jhb_seo for all
  using (jhb_role() = any (array['admin','editor','manager']))
  with check (jhb_role() = any (array['admin','editor','manager']));

-- services
drop policy if exists jhb_services_read on public.jhb_services;
create policy jhb_services_read on public.jhb_services for select using (true);
drop policy if exists jhb_services_write on public.jhb_services;
create policy jhb_services_write on public.jhb_services for all
  using (jhb_role() = any (array['admin','editor','manager']))
  with check (jhb_role() = any (array['admin','editor','manager']));

-- home
drop policy if exists jhb_home_public_read on public.jhb_home;
create policy jhb_home_public_read on public.jhb_home for select
  using ((key = 'published') or (jhb_role() = 'admin'));
drop policy if exists jhb_home_admin_all on public.jhb_home;
create policy jhb_home_admin_all on public.jhb_home for all
  using (jhb_role() = 'admin') with check (jhb_role() = 'admin');

-- posts
drop policy if exists jhb_posts_read on public.jhb_posts;
create policy jhb_posts_read on public.jhb_posts for select
  using ((status = 'published') or (jhb_role() = any (array['admin','editor','manager'])));
drop policy if exists jhb_posts_write on public.jhb_posts;
create policy jhb_posts_write on public.jhb_posts for all
  using (jhb_role() = any (array['admin','editor','manager']))
  with check (jhb_role() = any (array['admin','editor','manager']));

-- service_faqs
drop policy if exists jhb_service_faqs_read on public.jhb_service_faqs;
create policy jhb_service_faqs_read on public.jhb_service_faqs for select using (true);
drop policy if exists jhb_service_faqs_write on public.jhb_service_faqs;
create policy jhb_service_faqs_write on public.jhb_service_faqs for all
  using (jhb_role() = any (array['admin','editor','manager']))
  with check (jhb_role() = any (array['admin','editor','manager']));

-- service_links
drop policy if exists jhb_service_links_read on public.jhb_service_links;
create policy jhb_service_links_read on public.jhb_service_links for select using (true);
drop policy if exists jhb_service_links_write on public.jhb_service_links;
create policy jhb_service_links_write on public.jhb_service_links for all
  using (jhb_role() = any (array['admin','editor','manager']))
  with check (jhb_role() = any (array['admin','editor','manager']));

-- testimonials
drop policy if exists jhb_testimonials_read on public.jhb_testimonials;
create policy jhb_testimonials_read on public.jhb_testimonials for select
  using ((active = true) or (jhb_role() = any (array['admin','editor','manager'])));
drop policy if exists jhb_testimonials_write on public.jhb_testimonials;
create policy jhb_testimonials_write on public.jhb_testimonials for all
  using (jhb_role() = 'admin') with check (jhb_role() = 'admin');

-- home_faqs
drop policy if exists jhb_home_faqs_read on public.jhb_home_faqs;
create policy jhb_home_faqs_read on public.jhb_home_faqs for select
  using ((active = true) or (jhb_role() = any (array['admin','editor','manager'])));
drop policy if exists jhb_home_faqs_write on public.jhb_home_faqs;
create policy jhb_home_faqs_write on public.jhb_home_faqs for all
  using (jhb_role() = 'admin') with check (jhb_role() = 'admin');

-- partners
drop policy if exists jhb_partners_read on public.jhb_partners;
create policy jhb_partners_read on public.jhb_partners for select
  using ((active = true) or (jhb_role() = any (array['admin','editor','manager'])));
drop policy if exists jhb_partners_write on public.jhb_partners;
create policy jhb_partners_write on public.jhb_partners for all
  using (jhb_role() = 'admin') with check (jhb_role() = 'admin');

-- client_logos
drop policy if exists jhb_client_logos_read on public.jhb_client_logos;
create policy jhb_client_logos_read on public.jhb_client_logos for select
  using ((active = true) or (jhb_role() = any (array['admin','editor','manager'])));
drop policy if exists jhb_client_logos_write on public.jhb_client_logos;
create policy jhb_client_logos_write on public.jhb_client_logos for all
  using (jhb_role() = 'admin') with check (jhb_role() = 'admin');

-- versions
drop policy if exists jhb_versions_read on public.jhb_versions;
create policy jhb_versions_read on public.jhb_versions for select
  using (jhb_role() = any (array['admin','editor','manager']));
drop policy if exists jhb_versions_insert on public.jhb_versions;
create policy jhb_versions_insert on public.jhb_versions for insert
  with check (jhb_role() = any (array['admin','editor','manager']));
drop policy if exists jhb_versions_delete on public.jhb_versions;
create policy jhb_versions_delete on public.jhb_versions for delete
  using (jhb_role() = 'admin');

-- ---------------------------------------------------------------------------
-- STORAGE  (public bucket + object policies)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('jhb-media', 'jhb-media', true)
on conflict (id) do nothing;

drop policy if exists jhb_media_obj_read on storage.objects;
create policy jhb_media_obj_read on storage.objects for select
  using ((bucket_id = 'jhb-media') and (jhb_role() = any (array['admin','editor','manager'])));
drop policy if exists jhb_media_obj_insert on storage.objects;
create policy jhb_media_obj_insert on storage.objects for insert
  with check ((bucket_id = 'jhb-media') and (jhb_role() = any (array['admin','editor','manager'])));
drop policy if exists jhb_media_obj_update on storage.objects;
create policy jhb_media_obj_update on storage.objects for update
  using ((bucket_id = 'jhb-media') and (jhb_role() = any (array['admin','editor','manager'])));
drop policy if exists jhb_media_obj_delete on storage.objects;
create policy jhb_media_obj_delete on storage.objects for delete
  using ((bucket_id = 'jhb-media') and (jhb_role() = any (array['admin','editor','manager'])));

-- Done. Now run 02_data.sql.
