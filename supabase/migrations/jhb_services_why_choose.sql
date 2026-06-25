-- "Why Choose Us" editable containers for service pages.
-- Adds a jsonb column on jhb_services that stores an ordered array of
-- WhyChooseContainer objects (see packages/shared/src/servicePages.ts).
-- Idempotent and safe to run multiple times. Existing rows default to [].

ALTER TABLE jhb_services
  ADD COLUMN IF NOT EXISTS why_choose jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Make the new column visible to the PostgREST API immediately.
NOTIFY pgrst, 'reload schema';
