# JHB — Netlify Deployment Guide (Website + Admin, one account)

Deploy **two separate Netlify sites** from this one monorepo, both under the same
Netlify account, both talking to the **same existing Supabase project**
(`ossvdnwcmsjbdlstldhh`). No Supabase changes are required.

| Site | Base directory | Config file | Build | Publish |
|------|----------------|-------------|-------|---------|
| **Website** (public) | repo root | root [`netlify.toml`](../netlify.toml) | `npm run build:website` | `apps/website/.next` |
| **Admin** (login-gated) | `apps/admin` | [`apps/admin/netlify.toml`](../apps/admin/netlify.toml) | `npm run build` | `.next` |

Both run on the **`@netlify/plugin-nextjs`** runtime (SSR + ISR + middleware), so
admin edits appear on the website automatically (every content route revalidates
every **30s** — no rebuild needed).

Status of the code side (verified locally on branch `static-export-hostinger`):
- ✅ `npm run build:website` — succeeds, 0 errors.
- ✅ `npm run build:admin` — succeeds, 0 errors (all routes dynamic + auth middleware).

---

## Step 0 — Push the branch first (Netlify deploys from git)

Netlify builds from a pushed git branch. Your local branch is **4 commits ahead of
the remote** and has an uncommitted edit, so push everything first:

```bash
git add -A
git commit -m "Blog banner: remove branding block; deploy prep"
git push origin static-export-hostinger
```

Deploy both sites from the **`static-export-hostinger`** branch (your source of truth).

---

## Step 1 — Website site

Netlify → **Add new site → Import an existing project** → pick this repo.

| Setting | Value |
|---------|-------|
| Branch to deploy | `static-export-hostinger` |
| **Base directory** | *(leave blank = repo root)* |
| Build command | `npm run build:website` |
| Publish directory | `apps/website/.next` |

> The root `netlify.toml` already sets the build command, publish dir, `NODE_VERSION=20`,
> the Next.js plugin, and the SEO 301 redirects. Netlify auto-detects it, so the fields
> above are mostly confirmation.

### Website environment variables — **REQUIRED**
The Supabase credentials live in a **git-ignored** `apps/website/.env.local`, so they
are **not** in the repo and Netlify will not have them. Add them in
**Site settings → Environment variables**:

```
NEXT_PUBLIC_SUPABASE_URL       = https://ossvdnwcmsjbdlstldhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = sb_publishable_g5cfiCfFMfCzjSdHPrK2iw_6sIbp0Cy
```

Already committed in `apps/website/.env.production` (no need to re-add, but you may
override): `STATIC_EXPORT=true` (keeps the public Supabase client cookieless so ISR
caching works) and `NEXT_PUBLIC_SITE_URL=https://jhbautomations.com`.

> ⚠️ `NEXT_PUBLIC_SITE_URL` is baked to `https://jhbautomations.com` (used for canonical
> tags, Open Graph, `sitemap.xml`, `robots.txt`). If you are launching on the temporary
> `*.netlify.app` URL and **not** attaching the custom domain yet, add an env-var
> override `NEXT_PUBLIC_SITE_URL = https://<your-site>.netlify.app` so SEO tags match the
> live URL. Once the custom domain is attached, remove the override.

Deploy. Note the resulting URL (e.g. `https://jhb-website.netlify.app`).

---

## Step 2 — Admin site

Add a **second** new site from the **same** repo.

| Setting | Value |
|---------|-------|
| Branch to deploy | `static-export-hostinger` |
| **Base directory** | `apps/admin` |
| Build command | `npm run build` |
| Publish directory | `.next` *(resolves to `apps/admin/.next`)* |

> Setting Base directory to `apps/admin` makes Netlify read `apps/admin/netlify.toml`.
> `npm install` still runs from the repo root (npm workspaces) so `@jhb/shared` resolves.

### Admin environment variables — **none required**
`apps/admin/.env.production` already commits the public Supabase URL/anon key and
`NEXT_PUBLIC_WEBSITE_URL=https://jhbautomations.com`, so the admin site builds with no
dashboard env vars.

Optional:
- `ANTHROPIC_API_KEY` — only if you want the AI SEO Assistant in **API mode**. It runs
  in Manual mode by default, so leave unset otherwise.
- `NEXT_PUBLIC_WEBSITE_URL` — override to the website's `*.netlify.app` URL if you are
  not using the custom domain yet (controls admin "view on site" links).

Deploy. Note the resulting URL (e.g. `https://jhb-admin.netlify.app`).

---

## Step 3 — Supabase auth / origin settings (admin login only)

Supabase's anon key needs **no CORS allowlist** for the website's public reads or for
image uploads/storage — those are governed by RLS, not origin. The only origin setting
that matters is **admin login redirect URLs**.

Supabase dashboard → **Authentication → URL Configuration**:
- **Site URL:** your admin production URL (custom domain preferred, else the
  `*.netlify.app` URL) — e.g. `https://admin.jhbautomations.com`
- **Redirect URLs:** add both
  - `https://admin.jhbautomations.com/**` (or the admin `*.netlify.app` URL + `/**`)
  - `https://jhbautomations.com/**` (or the website `*.netlify.app` URL + `/**`)

Do **not** change tables, storage, RLS, or existing keys.

---

## Step 4 — Custom domains (optional but recommended)

For each Netlify site → **Domain management → Add a custom domain**, then point DNS:
- Website → `jhbautomations.com` (+ `www`)
- Admin → `admin.jhbautomations.com`

Netlify issues Let's Encrypt SSL automatically. After attaching the domains, remove any
temporary `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_WEBSITE_URL` overrides so the committed
production URLs apply, and re-check the Supabase redirect URLs above.

---

## Step 5 — Verify (go-live checklist)

**Website**
- [ ] Home page loads with real content pulled from Supabase.
- [ ] A service page (`/[slug]`), a blog post (`/blog/[slug]`), testimonials, partners render.
- [ ] Contact form submits → new row in Supabase `jhb_leads` (visible in Admin → Leads).
- [ ] Images (logos, media) load from Supabase storage.

**Admin**
- [ ] Admin URL redirects to `/login`.
- [ ] Login with the admin user works (session persists).
- [ ] Edit + save content (e.g. Home or a Service page) succeeds.
- [ ] Upload an image in Media → it appears.

**End-to-end (CRUD reflected on website)**
- [ ] Edit content in Admin → within ~30s (ISR revalidate) it appears on the website.
- [ ] SEO/meta (title, canonical, OG) render correctly on the website.

---

## Deliverables (fill in after deploying)

1. **Website URL:** `__________`
2. **Admin Panel URL:** `__________`
3. **Deployment status:** `__________`
4. **Env vars added/updated:**
   - Website: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ optional `NEXT_PUBLIC_SITE_URL` override)
   - Admin: none (optional `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_WEBSITE_URL` override)
5. **Fixes made:** builds verified clean (0 errors); no code fixes required.
