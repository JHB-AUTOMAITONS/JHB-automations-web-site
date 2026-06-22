-- Home Page SEO — extra columns on jhb_seo.
-- RUN ONCE in the Supabase SQL Editor for project ossvdnwcmsjbdlstldhh.
-- (path, title, description, keywords, og_image already exist.)

alter table public.jhb_seo
  add column if not exists meta_title       text,
  add column if not exists canonical        text,
  add column if not exists og_title         text,
  add column if not exists og_description   text,
  add column if not exists robots           text,
  add column if not exists structured_data  text,  -- JSON-LD (stored as text)
  add column if not exists seo_content      text,  -- rich HTML SEO content block
  add column if not exists slug             text;

-- Optional: a default Home SEO row (the admin upserts this on first save anyway).
insert into public.jhb_seo (path, slug)
values ('/', '/')
on conflict (path) do nothing;
