# JHB — Go-Live Deployment Guide

Frontend on **Hostinger**, backend on **Supabase**.

This project is a monorepo with **two server-rendered (SSR) Next.js 15 apps**:

| App | Folder | What it is |
|-----|--------|-----------|
| Website | `apps/website` | Public marketing site |
| Admin | `apps/admin` | Content management panel (login-gated) |
| Shared | `packages/shared` | Shared Supabase + data code (used by both) |

Both apps need a **live Node.js server** (they use middleware, server actions, and
cookie-based Supabase auth). They are **not** static sites — you cannot just upload
a folder of HTML.

---

## ⚠️ Two things to know about Hostinger Web Hosting

### 1. You need a Business plan or higher
Node.js apps run on hPanel only on **Business, Cloud, or Agency** web-hosting plans
(and VPS). They are **not** available on the **Single** or **Premium** shared plans.
- Check: hPanel → your plan name. If it's Single/Premium, upgrade to **Business**
  (or use a VPS) before continuing.

### 2. "/admin path" is not possible on shared hosting — use a subdomain instead
On Hostinger shared hosting, **each Node.js app is tied to one domain or subdomain.**
You cannot run two separate apps on one domain and route `/admin` to the second one
(that needs a reverse proxy you only control on a VPS).

**Recommended layout (this is what the rest of the guide assumes):**

```
yourdomain.com          ──►  website app   (Node.js app #1)
admin.yourdomain.com    ──►  admin  app    (Node.js app #2)
```

> If you truly need `yourdomain.com/admin`, that requires a **Hostinger VPS** with
> Nginx. Ask and I'll write that version instead.

---

## Part 0 — Pre-flight (already fixed in code)

- ✅ `next` version restored to a patched **15.5.19** in both apps (an earlier edit had
  broken it to `9.3.3`).
- ✅ Both apps verified to build successfully (`npm run build`).
- ❗ Do **NOT** run `npm audit fix --force` — it will try to reinstall the broken
  `next@9.3.3`. The remaining 2 "moderate" warnings are harmless build-time issues.

---

## Part 1 — Supabase backend go-live

Your Supabase project (`ossvdnwcmsjbdlstldhh`) is already created and seeded
(see `supabase/new-project/03_runbook.md`). Confirm these before launch:

1. **Schema + data loaded** — runbook Steps 1–2 (18 `jhb_*` tables, content rows).
2. **Admin user created + promoted** — runbook Step 3
   (your admin email, role set to `admin`).
3. **Auth URLs** (do this AFTER you know your domain):
   Supabase dashboard → **Authentication → URL Configuration**:
   - **Site URL:** `https://admin.yourdomain.com`
   - **Redirect URLs:** add `https://admin.yourdomain.com/**`
     and `https://yourdomain.com/**`
4. **Keep the old project alive.** Images are still served from the old project's
   storage (`wzvzzcuennotfutklulh`). That's fine — don't delete it (see runbook).

No Supabase deploy step is needed beyond this — it's already hosted by Supabase.

---

## Part 2 — Environment variables for production

Each app reads these at build + runtime. You'll enter them in Hostinger's Node.js
app settings (Part 3), **not** commit them. Real values to use:

**Website app:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ossvdnwcmsjbdlstldhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_g5cfiCfFMfCzjSdHPrK2iw_6sIbp0Cy
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

**Admin app:**
```
NEXT_PUBLIC_SUPABASE_URL=https://ossvdnwcmsjbdlstldhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_g5cfiCfFMfCzjSdHPrK2iw_6sIbp0Cy
NEXT_PUBLIC_WEBSITE_URL=https://yourdomain.com
```

(The `anon`/publishable key is safe to expose — it's protected by Supabase RLS.)

---

## Part 3 — Deploy each app to Hostinger (Node.js app)

Do this **twice** — once for the website (main domain), once for the admin (subdomain).

### A. Create the subdomain (admin app only)
hPanel → **Domains → Subdomains** → create `admin` → `admin.yourdomain.com`.

### B. Push your code to GitHub
Hostinger's smoothest path is GitHub integration.
```
git add -A
git commit -m "Deploy: pin Next 15.5.19, production config"
git push
```

### C. Create the Node.js app in hPanel
hPanel → **Websites → Add Website → Node.js App** (or **Setup Node.js App**), then:

| Setting | Website app | Admin app |
|---------|-------------|-----------|
| Domain | `yourdomain.com` | `admin.yourdomain.com` |
| Node version | 20 LTS (or newer) | 20 LTS |
| Source | your GitHub repo | same repo |
| **Application root** | `apps/website` | `apps/admin` |
| Build command | `npm run build` | `npm run build` |
| Start command | `npx next start -p $PORT` | `npx next start -p $PORT` |

> **Monorepo note:** because the apps depend on the workspace package `@jhb/shared`,
> `npm install` must run from the **repo root**, not the app folder. In Hostinger's
> setup, set the **install/run command** to install at root first, e.g.:
> `cd ../.. && npm install && cd apps/website && npm run build`
> If Hostinger's UI only allows an app-folder install, tell me and I'll switch the
> project to a self-contained build (prebuild the app + vendored shared code) so it
> installs cleanly from the app folder.

### D. Add the environment variables
In each app's Node.js settings → **Environment Variables**, paste the values from
Part 2 (the website set for the website app, the admin set for the admin app).

### E. Deploy / Run
Trigger the build. Watch the deployment log. When it finishes, the app boots and
Hostinger proxies the domain to it.

---

## Part 4 — DNS & SSL

- If the domain is registered at Hostinger, DNS is automatic.
- hPanel → **SSL** → issue/enable the free Let's Encrypt certificate for both
  `yourdomain.com` and `admin.yourdomain.com`. Force HTTPS.

---

## Part 5 — Verify (go-live checklist)

- [ ] `https://yourdomain.com` loads the home page with real content.
- [ ] A service page, blog post, testimonials, partners render.
- [ ] Contact form submits → a row appears in Supabase `jhb_leads`
      (Admin → Leads).
- [ ] `https://admin.yourdomain.com` redirects to `/login`.
- [ ] Logging in with your admin email works and you can edit + save content.
- [ ] Edited content shows on the public site.
- [ ] Old Supabase project (`wzvzzcuennotfutklulh`) still alive (images load).

---

## If shared hosting fights you

Two SSR apps on shared hosting can be resource-tight and the monorepo install is
fiddly. If you hit walls, the two low-friction fallbacks (both keep your domain at
Hostinger) are:
1. **Hostinger VPS** — I give you exact PM2 + Nginx commands; `/admin` path works.
2. **Vercel for the apps + Hostinger DNS** — zero server maintenance, free at this size.

Tell me which and I'll write that path.
