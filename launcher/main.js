// JHB Admin Dashboard — Windows launcher (Electron)
// ---------------------------------------------------
// Double-click AdminDashboard.exe → it locates the project, makes sure deps and
// a production build exist, starts the Next.js admin server (next start -p 3001),
// shows a loading screen, then opens the dashboard in its own window.
//
// Keep AdminDashboard.exe inside your project folder (the one containing
// `apps/admin`), e.g. D:\JHB-website\AdminDashboard.exe.

const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

const ADMIN_PORT = 3001;
const ADMIN_URL = `http://localhost:${ADMIN_PORT}`;
const SERVER_READY_TIMEOUT_MS = 120000; // wait up to 2 min for first build/start

let splashWin = null;
let mainWin = null;
let serverChild = null;
let serverLog = []; // rolling tail of server output for error reports

// ----------------------------------------------------------------------------
// Single instance — avoid two servers fighting over port 3001
// ----------------------------------------------------------------------------
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

// ----------------------------------------------------------------------------
// UI helpers (splash / error windows)
// ----------------------------------------------------------------------------
function createSplash() {
  splashWin = new BrowserWindow({
    width: 520,
    height: 340,
    frame: false,
    resizable: false,
    center: true,
    show: true,
    backgroundColor: "#0b1220",
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  splashWin.loadFile(path.join(__dirname, "ui", "loading.html"));
  return splashWin;
}

function setStatus(message, detail) {
  if (splashWin && !splashWin.isDestroyed()) {
    splashWin.webContents.send("status", { message, detail: detail || "" });
  }
}

function appendLog(line) {
  if (splashWin && !splashWin.isDestroyed()) {
    splashWin.webContents.send("log", line);
  }
}

function showError({ title, message, detail, link, linkLabel }) {
  const win = new BrowserWindow({
    width: 600,
    height: 460,
    frame: true,
    resizable: true,
    center: true,
    title: "JHB Admin Dashboard — Problem",
    backgroundColor: "#0b1220",
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, "ui", "error.html"));
  win.webContents.once("did-finish-load", () => {
    win.webContents.send("error-info", {
      title: title || "Something went wrong",
      message: message || "",
      detail: detail || "",
      link: link || "",
      linkLabel: linkLabel || "",
    });
  });
  if (splashWin && !splashWin.isDestroyed()) splashWin.close();
}

// ----------------------------------------------------------------------------
// Project discovery
// ----------------------------------------------------------------------------
// Find the directory that contains apps/admin/package.json, starting from the
// folder that holds the .exe (electron-builder portable sets
// PORTABLE_EXECUTABLE_DIR), then walking up a few levels. In dev (electron .),
// the launcher lives in <repo>/launcher so the repo root is one level up.
function findProjectRoot() {
  // 1) Explicit override via config file next to the exe
  const exeDir =
    process.env.PORTABLE_EXECUTABLE_DIR ||
    path.dirname(process.execPath);
  const cfgPath = path.join(exeDir, "admin-dashboard.config.json");
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      if (cfg.projectRoot && hasAdmin(cfg.projectRoot)) return cfg.projectRoot;
    } catch {
      /* ignore bad config */
    }
  }

  const candidates = [];
  if (process.env.PORTABLE_EXECUTABLE_DIR)
    candidates.push(process.env.PORTABLE_EXECUTABLE_DIR);
  candidates.push(exeDir);
  candidates.push(path.resolve(__dirname, "..")); // dev: <repo>/launcher -> <repo>
  candidates.push(process.cwd());

  for (const start of candidates) {
    let dir = start;
    for (let i = 0; i < 6; i++) {
      if (hasAdmin(dir)) return dir;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  return null;
}

function hasAdmin(root) {
  try {
    return fs.existsSync(path.join(root, "apps", "admin", "package.json"));
  } catch {
    return false;
  }
}

// ----------------------------------------------------------------------------
// Command runner (Windows): runs a command to completion, streams output
// ----------------------------------------------------------------------------
function runToCompletion(command, cwd, label) {
  return new Promise((resolve, reject) => {
    appendLog(`> ${command}`);
    const child = spawn(command, {
      cwd,
      shell: true, // needed for npm/node resolution on Windows
      windowsHide: true,
      env: { ...process.env },
    });
    const onData = (buf) => {
      const text = buf.toString();
      serverLog.push(text);
      if (serverLog.length > 200) serverLog.shift();
      const lastLine = text.trim().split(/\r?\n/).filter(Boolean).pop();
      if (lastLine) {
        appendLog(lastLine);
        if (label) setStatus(label, lastLine.slice(0, 80));
      }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

// Detect whether a command exists (e.g. node, npm)
function commandWorks(command) {
  return new Promise((resolve) => {
    const child = spawn(command, { shell: true, windowsHide: true });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}

// ----------------------------------------------------------------------------
// Supabase env handling + connectivity preflight
// ----------------------------------------------------------------------------
function parseEnvFile(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    out[line.slice(0, eq).trim()] = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return out;
}

function readSupabaseEnv(adminDir) {
  // Later files override earlier; .env.local wins (same as Next.js dev/runtime).
  const merged = {
    ...parseEnvFile(path.join(adminDir, ".env.production")),
    ...parseEnvFile(path.join(adminDir, ".env.local")),
  };
  return {
    url: merged.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    key:
      merged.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

async function supabaseReachable(url, key) {
  // /auth/v1/health is a lightweight public endpoint that needs the apikey.
  const target = `${url.replace(/\/$/, "")}/auth/v1/health`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(target, {
      headers: { apikey: key },
      signal: controller.signal,
    });
    return res.ok || res.status === 401; // any HTTP answer means DNS/TLS reached Supabase
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

// ----------------------------------------------------------------------------
// Server start + readiness
// ----------------------------------------------------------------------------
function pingServer() {
  return new Promise((resolve) => {
    const req = http.get(ADMIN_URL, (res) => {
      res.resume();
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await pingServer()) return true;
    await new Promise((r) => setTimeout(r, 600));
  }
  return false;
}

function startServer(projectRoot) {
  // Use the existing monorepo script: next start -p 3001 in apps/admin.
  serverChild = spawn("npm run start:admin", {
    cwd: projectRoot,
    shell: true,
    windowsHide: true,
    env: { ...process.env, PORT: String(ADMIN_PORT), BROWSER: "none" },
  });
  const capture = (buf) => {
    const text = buf.toString();
    serverLog.push(text);
    if (serverLog.length > 200) serverLog.shift();
    const line = text.trim().split(/\r?\n/).filter(Boolean).pop();
    if (line) appendLog(line);
  };
  serverChild.stdout.on("data", capture);
  serverChild.stderr.on("data", capture);
}

function killServer() {
  if (serverChild && serverChild.pid) {
    try {
      // Kill the whole process tree (npm -> node -> next workers) on Windows.
      spawn("taskkill", ["/pid", String(serverChild.pid), "/t", "/f"], {
        windowsHide: true,
      });
    } catch {
      try {
        serverChild.kill("SIGKILL");
      } catch {
        /* noop */
      }
    }
    serverChild = null;
  }
}

// ----------------------------------------------------------------------------
// Main window
// ----------------------------------------------------------------------------
function openDashboard() {
  mainWin = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    title: "JHB Admin Dashboard",
    backgroundColor: "#0b1220",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  mainWin.once("ready-to-show", () => {
    mainWin.maximize();
    mainWin.show();
    if (splashWin && !splashWin.isDestroyed()) splashWin.close();
  });
  // Open target=_blank / external links in the system browser
  mainWin.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  mainWin.loadURL(ADMIN_URL);
}

// ----------------------------------------------------------------------------
// Boot sequence
// ----------------------------------------------------------------------------
async function boot() {
  createSplash();
  await new Promise((r) => setTimeout(r, 300)); // let splash paint

  // 1) Locate the project
  setStatus("Locating project…");
  const projectRoot = findProjectRoot();
  if (!projectRoot) {
    showError({
      title: "Project folder not found",
      message:
        "AdminDashboard could not find your project (the folder that contains apps\\admin).",
      detail:
        "Fix: place AdminDashboard.exe inside your project folder (for example D:\\JHB-website) and run it again.\n\nAlternatively create a file named admin-dashboard.config.json next to the .exe with:\n{ \"projectRoot\": \"D:\\\\JHB-website\" }",
    });
    return;
  }
  const adminDir = path.join(projectRoot, "apps", "admin");

  // 2) If a server is already running on 3001, just open it
  if (await pingServer()) {
    setStatus("Admin server already running — opening…");
    openDashboard();
    return;
  }

  // 3) Node.js present?
  setStatus("Checking Node.js…");
  if (!(await commandWorks("node -v"))) {
    showError({
      title: "Node.js is not installed",
      message:
        "Node.js is required to run the Admin Dashboard but was not found on this PC.",
      detail:
        "Install Node.js 20 LTS, then run AdminDashboard.exe again.",
      link: "https://nodejs.org/en/download",
      linkLabel: "Download Node.js (LTS)",
    });
    return;
  }

  // 4) Dependencies installed? (npm workspaces install at the repo root)
  const hasDeps = fs.existsSync(path.join(projectRoot, "node_modules", "next"));
  if (!hasDeps) {
    setStatus("Installing dependencies… (first run, this can take a few minutes)");
    try {
      await runToCompletion("npm install", projectRoot, "Installing dependencies…");
    } catch (e) {
      showError({
        title: "Could not install dependencies",
        message: "npm install failed. The project packages are missing.",
        detail: tailLog(e),
      });
      return;
    }
  }

  // 5) Production build present?
  if (!fs.existsSync(path.join(adminDir, ".next"))) {
    setStatus("Building admin (first run)… this can take a couple of minutes");
    try {
      await runToCompletion(
        "npm run build:admin",
        projectRoot,
        "Building admin…"
      );
    } catch (e) {
      showError({
        title: "Build failed",
        message: "The admin production build did not complete.",
        detail: tailLog(e),
      });
      return;
    }
  }

  // 6) Supabase env + connectivity
  setStatus("Checking Supabase connection…");
  const { url, key } = readSupabaseEnv(adminDir);
  if (!url || !key) {
    showError({
      title: "Supabase settings missing",
      message:
        "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY were not found.",
      detail:
        `Add them to:\n${path.join(adminDir, ".env.local")}\n\nExample:\nNEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx`,
    });
    return;
  }
  if (!(await supabaseReachable(url, key))) {
    showError({
      title: "Supabase connection failed",
      message: `Could not reach Supabase at ${url}.`,
      detail:
        "Check your internet connection and that the Supabase project is active and the URL/key are correct, then try again.",
      link: url,
      linkLabel: "Open Supabase URL",
    });
    return;
  }

  // 7) Start the server and wait for it
  setStatus("Starting the admin server…");
  startServer(projectRoot);
  const ready = await waitForServer(SERVER_READY_TIMEOUT_MS);
  if (!ready) {
    showError({
      title: "The admin server did not start",
      message: `No response from ${ADMIN_URL} after waiting.`,
      detail: tailLog(),
    });
    killServer();
    return;
  }

  // 8) Open the dashboard
  setStatus("Opening dashboard…");
  openDashboard();
}

function tailLog(err) {
  const tail = serverLog.join("").trim().split(/\r?\n/).slice(-25).join("\n");
  return (err ? err.message + "\n\n" : "") + tail;
}

// ----------------------------------------------------------------------------
// App lifecycle
// ----------------------------------------------------------------------------
app.on("second-instance", () => {
  if (mainWin) {
    if (mainWin.isMinimized()) mainWin.restore();
    mainWin.focus();
  }
});

ipcMain.on("quit-app", () => app.quit());
ipcMain.on("open-external", (_e, url) => {
  if (url) shell.openExternal(url);
});

app.whenReady().then(boot);

app.on("window-all-closed", () => {
  killServer();
  app.quit();
});
app.on("before-quit", killServer);
process.on("exit", killServer);
