-- Per-blog-post FAQ section.
-- Adds two columns on jhb_posts:
--   * faqs          — ordered jsonb array of { id, question, answer, visible }
--                     (answer is rich-text HTML). Array order = display order.
--   * faqs_enabled  — section-level on/off toggle for the whole FAQ block.
-- FAQs are blog-specific: each post owns its own independent list. There is no
-- global/shared FAQ store for the blog.
-- Idempotent and safe to run multiple times. Existing rows default to []/true.

ALTER TABLE jhb_posts
  ADD COLUMN IF NOT EXISTS faqs jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE jhb_posts
  ADD COLUMN IF NOT EXISTS faqs_enabled boolean NOT NULL DEFAULT true;

-- Make the new columns visible to the PostgREST API immediately.
NOTIFY pgrst, 'reload schema';
