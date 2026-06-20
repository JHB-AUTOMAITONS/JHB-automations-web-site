# JHB Admin Dashboard — Windows Launcher

A one-click `AdminDashboard.exe` that runs the Next.js admin panel locally and
opens it in its own window. No VS Code, no terminal.

## What it does when you double-click it
1. Finds your project (the folder containing `apps/admin`).
2. Verifies **Node.js** is installed (clear error + download link if not).
3. **Installs dependencies** if they're missing (`npm install`).
4. Creates a **production build** if one doesn't exist (`npm run build:admin`).
5. Checks your **Supabase** settings and connection.
6. Starts the server (`next start -p 3001`) behind a **loading screen**.
7. Opens the dashboard at **http://localhost:3001** in a desktop window.
8. Stops the server automatically when you close the window.

## Folder structure
```
launcher/
├─ package.json        # Electron + electron-builder config (produces AdminDashboard.exe)
├─ main.js             # Launcher logic (start server, checks, window)
├─ ui/
│  ├─ loading.html     # Loading / progress screen
│  └─ error.html       # Friendly error screen
├─ build/              # (optional) put icon.ico here to brand the exe
└─ dist/               # build output — AdminDashboard.exe lands here
```

## Build the .exe (one time, on a dev machine)
From the `launcher/` folder:
```bash
npm install          # installs electron + electron-builder
npm run dist         # builds dist/AdminDashboard.exe  (portable, single file)
```
Optional installer version (creates Start-menu shortcut):
```bash
npm run dist:installer   # builds dist/AdminDashboard-Setup.exe
```

> Tip: build a production admin first so the very first launch is instant:
> from the **repo root** run `npm run build:admin`.

## Install / use
1. Copy **`dist/AdminDashboard.exe`** into your **project root** (the folder that
   contains `apps/`), e.g. `D:\JHB-website\AdminDashboard.exe`.
2. Double-click it. First run may take a minute (build); after that it's quick.

If you prefer to keep the exe elsewhere, drop a file named
`admin-dashboard.config.json` next to it:
```json
{ "projectRoot": "D:\\JHB-website" }
```

## Requirements
- Windows 10 / 11 (x64)
- Node.js 20 LTS installed (https://nodejs.org)
- The project's `apps/admin/.env.local` must contain:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
  ```

## Develop / test the launcher itself
```bash
npm start            # runs the launcher with Electron (uses ../ as project root)
```
