-- AI SEO Assistant — generation history / audit trail.
-- Every AI tool run (page SEO, image SEO, keyword research, blog, etc.) is logged
-- here for review under Admin → AI SEO Assistant → AI History.
-- The logging is best-effort: AI tools work fine even if this table is absent.
-- Idempotent and safe to run multiple times.

CREATE TABLE IF NOT EXISTS jhb_ai_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool text NOT NULL,
  input jsonb,
  output jsonb,
  user_id uuid,
  user_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jhb_ai_history_created_idx ON jhb_ai_history (created_at DESC);

ALTER TABLE jhb_ai_history ENABLE ROW LEVEL SECURITY;

-- Internal admin tool: any authenticated staff session may read/write. The
-- server actions additionally enforce the Super Admin role before inserting.
DROP POLICY IF EXISTS "ai_history_authenticated" ON jhb_ai_history;
CREATE POLICY "ai_history_authenticated" ON jhb_ai_history
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
