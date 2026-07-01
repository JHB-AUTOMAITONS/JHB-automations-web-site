-- "What's Included" editable section chrome for service pages.
-- Adds a jsonb column on jhb_services that stores a single WhatsIncludedContent
-- object (badge, heading, highlight, description, columns, button, styling — see
-- packages/shared/src/servicePages.ts). The cards themselves remain in the
-- existing `features` column, so existing content is preserved automatically.
-- Idempotent and safe to run multiple times. Existing rows default to {} and
-- fall back to the seeded defaults until edited.

ALTER TABLE jhb_services
  ADD COLUMN IF NOT EXISTS whats_included jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Make the new column visible to the PostgREST API immediately.
NOTIFY pgrst, 'reload schema';
