-- Split hero heading for service pages — matches the lead + gradient-highlight
-- (+ optional tail) pattern used by the About hero and section headings sitewide.
--
--   • hero_heading  — the LEAD text (unchanged column; existing single-field
--                     values automatically become the lead, so nothing is lost).
--   • hero_highlight — the word(s) rendered in the brand gradient (grad-text).
--   • hero_tail      — optional trailing text after the highlight.
--
-- No data backfill needed: the existing hero_heading is already the lead.
-- The full draft payload (jhb_services.draft jsonb) also carries these fields
-- once a page is re-saved. Idempotent and safe to run multiple times.

ALTER TABLE jhb_services
  ADD COLUMN IF NOT EXISTS hero_highlight text,
  ADD COLUMN IF NOT EXISTS hero_tail      text;

-- Make the new columns visible to the PostgREST API immediately.
NOTIFY pgrst, 'reload schema';
