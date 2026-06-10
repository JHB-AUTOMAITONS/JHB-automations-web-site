# JHB Automations — Monorepo Migration Guide

This project was split from a single Next.js app into **two independent applications** plus a **shared package**, managed as an **npm workspaces monorepo**.

## Structure

```
JHB-website/
├─ package.json            # workspace root (scripts below)
├─ tsconfig.base.json      # shared TS compiler options
├─ docs/migration-guide.md # this file
├─ packages/
│  └─ shared/              # @jhb/shared — logic shared by both apps (no UI)
│     └─ src/
│        ├─ supabase/client.ts   # browser Supabase client
│        ├─ supabase/server.ts   # server (cookie-aware) Supabase client
│        ├─ content.ts           # content TYPES + DEFAULTS (client-safe)
│        ├─ content.server.ts    # getHero/getStats/getSettings/getSeo/buildMetadata
│        ├─ data.ts              # serviceDetails + static site data
│        ├─ services.server.ts   # getServices/getServiceBySlug/getServiceLinks
│        └─ types.ts             # type re-exports
├─ apps/
│  ├─ website/             # PUBLIC site — http://localhost:3000
│  │  └─ src/{app, components}
│  └─ admin/               # ADMIN panel — http://localhost:3001
│     └─ src/{middleware.ts, app, components}
```

## Running locally

From the repo root:

```bash
npm install            # installs all workspaces, links @jhb/shared into both apps

npm run dev:website    # public site  → http://localhost:3000
npm run dev:admin      # admin panel  → http://localhost:3001
```

Run them in two terminals to use both at once. Production:

```bash
npm run build:website && npm run start:website
npm run build:admin   && npm run start:admin
# or: npm run build   (builds both)
```

## Environment variables

Each app has its own `.env.local`:

**apps/website/.env.local**
```
NEXT_PUBLIC_SUPABASE_URL=...        # shared Supabase project
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # publishable key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**apps/admin/.env.local**
```
NEXT_PUBLIC_SUPABASE_URL=...        # SAME Supabase project
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # SAME publishable key
NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000   # "View site" link target
```

## What changed

- **Shared backend, unchanged:** both apps point at the **same Supabase project** (`wzvzzcuennotfutklulh`). All tables (`jhb_*`), RLS policies, the `jhb-media` storage bucket, and the existing admin user are untouched. **No data migration was needed.**
- **Admin routes lost the `/admin` prefix.** As a standalone app the admin lives at the root:
  | Before (single app) | After (admin app) |
  |---|---|
  | `/admin` | `/` |
  | `/admin/login` | `/login` |
  | `/admin/content`, `/seo`, `/leads`, `/analytics`, `/media`, `/users`, `/settings`, `/services` | `/content`, `/seo`, … |
  - `middleware.ts` now guards the whole admin app (everything except `/login`).
- **Imports:** shared modules are imported via subpaths — `@jhb/shared/supabase/server`, `@jhb/shared/content`, `@jhb/shared/content-server`, `@jhb/shared/data`, `@jhb/shared/services-server`, `@jhb/shared/types`. The client/server Supabase clients are deliberately **separate subpaths** so client components never pull `next/headers`.
- **Dependencies trimmed:** the admin app no longer depends on `framer-motion` (it isn't used there). `@jhb/shared` only depends on the Supabase SDKs.
- **Design system** (`globals.css` + `tailwind.config.ts`) is intentionally **duplicated per app** (small, stable) to keep the CSS/Tailwind pipeline simple and each app self-contained.

## Content freshness across apps

The website renders content **dynamically (SSR)** — its layout reads Supabase through the cookie-aware server client — so any edit made in the admin appears on the website on the **next request/refresh**. No cross-app cache wiring is required.

> Optional future optimization: if the website is later switched to static/ISR for caching, add an on-demand revalidation webhook that the admin calls after a save (e.g. `POST {WEBSITE_URL}/api/revalidate`).

## Rollback

A git snapshot of the working single-app was committed **before** the split:

```bash
git log --oneline        # find "Snapshot: working single-app before monorepo split"
git reset --hard <hash>  # restore the pre-split state
```

## Deployment notes

Deploy each app as a separate project (e.g. two Vercel projects with root directories `apps/website` and `apps/admin`), each with its own env vars and domain (e.g. `jhbautomations.com` and `admin.jhbautomations.com`). Both talk to the same Supabase project. Keep the admin domain private / behind the login.
