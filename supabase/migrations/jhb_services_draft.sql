-- Draft/publish workflow for service pages — mirrors the jhb_home draft/published
-- split so editor saves never touch the live page until "Publish" is clicked.
--
--   • draft            — the working copy (full editable payload, content only).
--                        The existing content columns remain the PUBLISHED copy
--                        that the live website reads (gated by status='published').
--   • draft_updated_at — when the draft was last saved. A draft newer than
--                        content_updated_at means there are unpublished changes.
--
-- Save Draft writes ONLY `draft` (+ draft_updated_at); Publish copies the draft
-- into the live content columns and sets status='published'.
-- Idempotent and safe to run multiple times. Existing rows default to no draft.

ALTER TABLE jhb_services
  ADD COLUMN IF NOT EXISTS draft            jsonb,
  ADD COLUMN IF NOT EXISTS draft_updated_at timestamptz;

-- Make the new columns visible to the PostgREST API immediately.
NOTIFY pgrst, 'reload schema';
