# JHB → new Supabase project migration runbook

Target project: **`ossvdnwcmsjbdlstldhh`** (`https://ossvdnwcmsjbdlstldhh.supabase.co`)
Source (leave untouched): **JK FINSTRIDE** (`wzvzzcuennotfutklulh`) — also runs a separate CRM app.

Everything here is reversible: if anything looks wrong, flip the two `.env.local` files back to the old URL/key and restart.

---

## Step 1 — Create the schema
1. Open the **new** project dashboard → **SQL Editor** → **New query**.
2. Paste the entire contents of [`01_schema.sql`](01_schema.sql) and click **Run**.
   - Creates 18 `jhb_*` tables, `jhb_role()` + `jhb_handle_new_user()`, the auth trigger, all RLS policies, and the public `jhb-media` storage bucket + its object policies.
   - Safe to re-run.

## Step 2 — Load the content
1. New query → paste all of [`02_data.sql`](02_data.sql) → **Run**.
   - Loads 135 rows across 13 content tables (services, SEO, testimonials, posts, partners, client logos, media library, site content/settings, etc.).
   - Logs/analytics/version-history/leads are intentionally **not** copied (they're historical, not content). They start empty.
   - If you ever re-run this, `TRUNCATE` those 13 tables first to avoid duplicate-key errors.

## Step 3 — Create the admin login
Auth users don't transfer via SQL, so create the admin fresh:
1. New project dashboard → **Authentication** → **Users** → **Add user** → **Create new user**.
   - Email: `<your-admin-email>`
   - Password: (choose one)
   - **Tick "Auto Confirm User"** so the email is confirmed immediately.
2. The `jhb_on_auth_user_created` trigger auto-inserts the matching `jhb_profiles` row (role defaults to `editor`).
3. Promote to admin — run in SQL Editor:
   ```sql
   update public.jhb_profiles set role = 'admin' where email = '<your-admin-email>';
   ```
4. (Optional) verify:
   ```sql
   select id, email, role from public.jhb_profiles;
   ```

> If you later add editors/managers, repeat Add User and set their role the same way.

## Step 4 — Point the apps at the new project (already done in code)
Both env files were already updated to the new URL + key:
- `apps/admin/.env.local`
- `apps/website/.env.local`

**Restart the dev servers** (Next.js reads `.env.local` only at startup):
```
# in each app, stop the running dev server and start again
npm run dev
```

## Step 5 — Verify
- Visit the public site → home, /services, a service page, testimonials, partners, blog should render with content.
- Log into `/admin` with the new credentials → confirm you can read and save (e.g. edit a setting).
- Submit the contact form → a row should appear in `jhb_leads` (Admin → Leads).

---

## Known follow-ups (not blocking)

### Media images still served from the OLD project
The `jhb_media` rows and any image URLs in content point at
`https://wzvzzcuennotfutklulh.supabase.co/storage/v1/object/public/jhb-media/...`.
The **image files physically live in the old project's storage** — SQL can't move binaries.

- **For now (recommended):** leave it. The old project stays alive (it runs the CRM), so those URLs keep working. Nothing breaks.
- **Later, if you want full independence:** download the 26 files from the old `jhb-media` bucket, upload them to the new project's `jhb-media` bucket (same paths), then find/replace the host in `jhb_media.url` and any content URLs:
  ```sql
  -- example, run only after files are re-uploaded:
  update public.jhb_media
  set url = replace(url, 'wzvzzcuennotfutklulh.supabase.co', 'ossvdnwcmsjbdlstldhh.supabase.co');
  ```
  (Content stored as JSONB in `jhb_content` / `jhb_services` may also contain old-host URLs — search those too.)

### Old project cleanup (optional, do only after the new one is verified)
The 18 `jhb_*` tables still exist in JK FINSTRIDE. Once you're confident the new project works, they can be dropped from the old project to declutter — **without touching the CRM tables**. Ask and I'll generate a scoped `DROP` script. Do **not** delete the whole JK FINSTRIDE project; it hosts the separate CRM (2,940 clients).
