"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type PreviewTab = {
  id: string;
  label: string;
  /** Website path to load, e.g. "/preview/", "/blog/". Keep trailing slash. */
  path: string;
  /** If true, the editor's draft is streamed into this tab over postMessage. */
  live?: boolean;
  disabled?: boolean;
  disabledHint?: string;
};

type Device = "desktop" | "tablet" | "mobile";
type Status = "loading" | "ready" | "error";

const DEVICE_WIDTH: Record<Device, number> = {
  desktop: 1280,
  tablet: 834,
  mobile: 390,
};

const DEVICES: { id: Device; label: string; icon: string }[] = [
  { id: "desktop", label: "Desktop", icon: "🖥" },
  { id: "tablet", label: "Tablet", icon: "▭" },
  { id: "mobile", label: "Mobile", icon: "▯" },
];

const LOAD_TIMEOUT_MS = 9000;
const AUTO_RETRY_DELAY_MS = 1500;
const MAX_AUTO_RETRIES = 2;
const MIN_W = 420;
const MAX_W = 1100;

/**
 * Full-page live preview workspace. Embeds the real website inside a
 * browser-style frame and streams the editor's unsaved draft into the active
 * "live" tab over postMessage, so edits render with the actual site components
 * in real time (Shopify-theme-editor style). Handles device modes, resizing,
 * full-screen, loading/error states and automatic retry.
 */
export default function LivePreview({
  tabs,
  draft,
  websiteUrl,
  storageKey,
}: {
  tabs: PreviewTab[];
  draft: unknown;
  websiteUrl: string;
  /** localStorage key to remember the panel width. */
  storageKey?: string;
}) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const [device, setDevice] = useState<Device>("desktop");
  const [status, setStatus] = useState<Status>("loading");
  const [nonce, setNonce] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [isXl, setIsXl] = useState(false);
  const [width, setWidth] = useState(620);
  const [box, setBox] = useState({ w: 0, h: 0 });
  // Full document height of the embedded page, reported by the website over
  // postMessage (cross-origin, so we can't read it directly). Drives the
  // scrollable preview area so the panel scrolls Hero -> Footer. 0 until the
  // first report — we fall back to a single viewport meanwhile.
  const [contentH, setContentH] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const handshakeRef = useRef(false);

  const base = websiteUrl.replace(/\/$/, "");
  const origin = useMemo(() => {
    try {
      return new URL(base).origin;
    } catch {
      return "*";
    }
  }, [base]);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeId) ?? tabs[0],
    [tabs, activeId]
  );
  const displayUrl = `${base}${activeTab?.path ?? "/"}`;
  const src =
    nonce > 0
      ? `${displayUrl}${activeTab?.path.includes("?") ? "&" : "?"}_n=${nonce}`
      : displayUrl;

  /* ---- responsive + sizing measurement ---- */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const apply = () => setIsXl(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (storageKey) {
      const saved = Number(window.localStorage.getItem(storageKey));
      if (saved >= MIN_W && saved <= MAX_W) setWidth(saved);
    }
  }, [storageKey]);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fullscreen]);

  /* ---- load lifecycle: start a watchdog whenever the document (re)loads ---- */
  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const handleFailure = useCallback(() => {
    clearTimer();
    setContentH(0);
    if (attemptsRef.current < MAX_AUTO_RETRIES) {
      attemptsRef.current += 1;
      setStatus("error");
      timerRef.current = setTimeout(() => {
        setStatus("loading");
        setNonce((n) => n + 1); // reload
      }, AUTO_RETRY_DELAY_MS);
    } else {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // (Re)started load — show loading and arm the timeout watchdog.
    setStatus("loading");
    handshakeRef.current = false;
    setContentH(0);
    clearTimer();
    timerRef.current = setTimeout(handleFailure, LOAD_TIMEOUT_MS);
    return clearTimer;
  }, [src, handleFailure]);

  const onIframeLoad = () => {
    clearTimer();
    attemptsRef.current = 0;
    setStatus("ready");
  };

  /* ---- handshake + draft streaming ---- */
  const postDraft = useCallback(() => {
    if (!activeTab?.live) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "jhb-preview:set", home: draft, post: draft },
      origin
    );
  }, [activeTab, draft, origin]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (origin !== "*" && e.origin !== origin) return;
      const data = e.data as { type?: string; height?: number };
      if (data?.type === "jhb-preview:ready") {
        handshakeRef.current = true;
        clearTimer();
        attemptsRef.current = 0;
        setStatus("ready");
        postDraft();
      } else if (data?.type === "jhb-preview:height") {
        const h = Number(data.height) || 0;
        if (h > 0) setContentH(h);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [origin, postDraft]);

  // Stream the draft whenever it changes (live tab only, once handshaken).
  useEffect(() => {
    if (activeTab?.live && handshakeRef.current) postDraft();
  }, [draft, activeTab, postDraft]);

  /* ---- actions ---- */
  const changeTab = (id: string) => {
    if (id === activeId) return;
    attemptsRef.current = 0;
    setActiveId(id);
  };
  const refresh = () => {
    attemptsRef.current = 0;
    setStatus("loading");
    setNonce((n) => n + 1);
  };

  // Esc closes full-screen.
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFullscreen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  /* ---- resize handle ---- */
  const onResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    let lastW = width;
    const onMove = (ev: PointerEvent) => {
      // Dragging left widens the panel (handle is on its left edge).
      lastW = Math.min(MAX_W, Math.max(MIN_W, startW - (ev.clientX - startX)));
      setWidth(lastW);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (storageKey) window.localStorage.setItem(storageKey, String(lastW));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  /* ---- scaling math ---- */
  const baseW = DEVICE_WIDTH[device];
  const scale =
    box.w > 0
      ? device === "desktop"
        ? box.w / baseW
        : Math.min(1, box.w / baseW)
      : 1;
  const scaledW = baseW * scale;
  const offsetX = Math.max(0, (box.w - scaledW) / 2);
  // Render the iframe at the page's FULL height (so nothing is cropped) and let
  // the screen container scroll through it. Until the page reports its height we
  // fall back to a single viewport so the frame is never zero-height.
  const fallbackH = box.h > 0 ? box.h / scale : 0;
  const docH = contentH > 0 ? contentH : fallbackH;
  const scaledH = docH * scale;

  const rootClass = fullscreen
    ? "fixed inset-0 z-[70] flex flex-col bg-ink/40 p-3 backdrop-blur-sm"
    : "relative flex h-[75vh] flex-col xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:shrink-0";
  const rootStyle = !fullscreen && isXl ? { width } : undefined;

  return (
    <div className={rootClass} style={rootStyle}>
      {/* Resize handle (desktop, windowed only) */}
      {!fullscreen && isXl && (
        <div
          onPointerDown={onResizeStart}
          title="Drag to resize preview"
          className="absolute -left-3 top-0 z-10 flex h-full w-3 cursor-col-resize items-center justify-center"
        >
          <span className="h-10 w-1 rounded-full bg-ink/15 transition-colors hover:bg-primary" />
        </div>
      )}

      {/* Sticky toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-2xl border border-b-0 border-ink/10 bg-surface px-3 py-2">
        {/* Page tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-ink/[0.04] p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              disabled={t.disabled}
              onClick={() => changeTab(t.id)}
              title={t.disabled ? t.disabledHint : undefined}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeId === t.id
                  ? "bg-primary text-white shadow-soft"
                  : t.disabled
                  ? "cursor-not-allowed text-muted/40"
                  : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {/* Device toggle */}
          <div className="flex items-center gap-1 rounded-lg bg-ink/[0.04] p-1">
            {DEVICES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDevice(d.id)}
                title={`${d.label} preview`}
                className={`rounded-md px-2 py-1 text-xs transition-colors ${
                  device === d.id ? "bg-primary text-white shadow-soft" : "text-muted hover:text-ink"
                }`}
              >
                <span aria-hidden>{d.icon}</span>
                <span className="ml-1 hidden sm:inline">{d.label}</span>
              </button>
            ))}
          </div>
          {/* Actions */}
          <ToolbarBtn onClick={refresh} title="Refresh preview">↻</ToolbarBtn>
          <ToolbarBtn onClick={() => setFullscreen((f) => !f)} title={fullscreen ? "Exit full preview (Esc)" : "Open full preview"}>
            {fullscreen ? "✕" : "⛶"}
          </ToolbarBtn>
          <a
            href={displayUrl}
            target="_blank"
            rel="noreferrer"
            title="Open in a new tab"
            className="grid h-7 w-7 place-items-center rounded-md text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
          >
            ↗
          </a>
        </div>
      </div>

      {/* Browser frame */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-2xl border border-ink/10 bg-[#eef2f7] shadow-soft">
        {/* URL bar */}
        <div className="flex items-center gap-2 border-b border-ink/10 bg-surface px-3 py-2">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 truncate rounded-md bg-ink/[0.05] px-3 py-1 text-[11px] text-muted">
            <span aria-hidden>🔒</span>
            <span className="truncate">{displayUrl}</span>
            {activeTab?.live && (
              <span className="ml-auto flex shrink-0 items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Live
              </span>
            )}
          </div>
        </div>

        {/* Screen (scrolls vertically through the full-height frame) */}
        <div
          ref={screenRef}
          className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white"
        >
          {box.w > 0 && (
            <div className="relative" style={{ width: box.w, height: scaledH }}>
              <iframe
                ref={iframeRef}
                src={src}
                title="Website preview"
                loading="eager"
                onLoad={onIframeLoad}
                className="absolute left-0 top-0 origin-top-left border-0 bg-white"
                style={{
                  width: baseW,
                  height: docH,
                  transform: `translateX(${offsetX}px) scale(${scale})`,
                }}
              />
            </div>
          )}

          {/* Loading overlay (never a blank white screen) */}
          {status === "loading" && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-surface/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 text-sm text-muted">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-ink/15 border-t-primary" />
                Loading preview…
              </div>
            </div>
          )}

          {/* Error overlay with retry */}
          {status === "error" && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-surface/95 p-6 text-center">
              <div className="max-w-xs">
                <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-red-100 text-xl">⚠️</div>
                <p className="font-display text-base font-semibold">Preview didn&apos;t load</p>
                <p className="mt-1 text-sm text-muted">
                  {attemptsRef.current < MAX_AUTO_RETRIES
                    ? "Retrying automatically…"
                    : "Make sure the website is running and reachable, then try again."}
                </p>
                <button
                  onClick={refresh}
                  className="btn btn-primary mt-4 !px-4 !py-2 !text-sm"
                >
                  Retry now
                </button>
                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block text-xs text-primary underline"
                >
                  Open {displayUrl} directly ↗
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToolbarBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="grid h-7 w-7 place-items-center rounded-md text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink"
    >
      {children}
    </button>
  );
}
