"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ErrorBoundary } from "@jhb/shared/error-boundary";

/**
 * Shared live-preview panel for every page editor (About, and future Home /
 * Service Pages / Products / Vasool / Blog migrations). It provides:
 *   • a sticky, independently-scrollable panel that stays put while the editor
 *     on the left scrolls,
 *   • Desktop / Tablet / Mobile device buttons that render the preview inside an
 *     <iframe> at the real device width — so the page's responsive breakpoints
 *     actually reflow (a plain scaled div can't, because Tailwind's sm/md/lg are
 *     viewport media queries),
 *   • live updates: the children are React-portaled into the iframe, so they
 *     re-render instantly on every keystroke with no reload.
 *
 * The iframe mirrors the admin app's own stylesheets, so the preview uses the
 * admin's (light) theme tokens — the same approach as the existing inline
 * previews. Drop in any page's shared *View component as children.
 */

// Desktop renders at 1024 (the Tailwind `lg` breakpoint) rather than 1280: the
// preview panel is narrow, so a smaller render width means less down-scaling —
// i.e. bigger, more readable text — while still triggering the desktop (`lg:`)
// two-column layouts. Tablet/mobile stay at real device widths.
const DEVICES = [
  { key: "desktop", label: "Desktop", width: 1024 },
  { key: "tablet", label: "Tablet", width: 834 },
  { key: "mobile", label: "Mobile", width: 414 },
] as const;
type DeviceKey = (typeof DEVICES)[number]["key"];

export default function LivePreviewShell({
  label = "Live preview (draft)",
  footer,
  children,
}: {
  label?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const width = DEVICES.find((d) => d.key === device)!.width;

  return (
    <div className="xl:sticky xl:top-6 xl:h-fit">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          {label}
        </div>
        <div className="flex items-center gap-0.5 rounded-lg border border-ink/10 bg-surface p-0.5">
          {DEVICES.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDevice(d.key)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                device === d.key ? "bg-primary text-white" : "text-muted hover:text-ink"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <DeviceFrame width={width}>
        {/* Preview-wide safety net: if ANY part of the preview throws while
            rendering (the shared containers isolate themselves, but the page's
            own hero / why-choose / faq markup renders here too), show a small
            notice INSIDE the frame instead of letting the exception bubble up
            and blank the whole editor. resetKeys=[children] clears it as soon as
            the next edit produces new children, so it self-heals. */}
        <ErrorBoundary
          label="preview"
          resetKeys={[children]}
          fallback={
            <div className="m-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              <strong>Preview paused.</strong> The last change produced content this preview
              couldn’t render. Your edits are safe — adjust the field and the preview will refresh.
            </div>
          }
        >
          {children}
        </ErrorBoundary>
      </DeviceFrame>

      {footer && <p className="mt-3 text-[11px] text-muted">{footer}</p>}
    </div>
  );
}

// Baseline stylesheet injected into the iframe BEFORE the mirrored app styles and
// never removed. It guarantees sane rendering even in the split-second before (or
// if) the mirrored Tailwind/app CSS is present — which is exactly the window that
// used to make images balloon to their natural size and text collapse to tiny.
// These are hard invariants, not cosmetic overrides: images can never overflow
// their column, and the document keeps a normal base font size.
const PREVIEW_BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html { font-size: 16px; -webkit-text-size-adjust: 100%; }
  body { margin: 0; }
  [data-preview-root] { max-width: 100%; overflow-x: hidden; }
  [data-preview-root] img,
  [data-preview-root] svg,
  [data-preview-root] video,
  [data-preview-root] canvas { max-width: 100%; height: auto; }
  [data-preview-root] table { max-width: 100%; }
`;

function DeviceFrame({ width, children }: { width: number; children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  // Available column width (drives the fit-to-panel scale) and the FULL rendered
  // height of the preview document (drives the scrollable footprint).
  const [availW, setAvailW] = useState(0);
  const [contentH, setContentH] = useState(0);

  // Measure the available column width so the device width can be scaled to fit.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setAvailW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Mirror the parent document's stylesheets into the iframe, portal the preview
  // into its <body>, and track the FULL height of the portaled content so the outer
  // panel can scroll the whole page — and grow whenever a container is added /
  // removed / edited. A MutationObserver keeps styles in sync with dev HMR.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    let headObserver: MutationObserver | null = null;
    let sizeObserver: ResizeObserver | null = null;
    let raf = 0;
    // Maps each SOURCE <style>/<link> in the parent head to its clone in the
    // iframe head. Keeping this identity map is what makes mirroring INCREMENTAL:
    // an already-mirrored stylesheet is left in place instead of being removed and
    // re-added, so a <link> never re-fetches and the preview never flashes
    // unstyled (the old wipe-and-re-clone caused exactly that — images ballooned
    // to natural size and text collapsed until the refetch landed).
    const mirrored = new Map<Node, HTMLElement>();

    const init = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      // about:blank can be `complete` synchronously AND still fire `load`, so init
      // may run twice — tear down any prior observers first to avoid leaks.
      headObserver?.disconnect();
      sizeObserver?.disconnect();

      // Ensure the never-removed baseline stylesheet is first in the iframe head.
      // A missing base tag means a FRESH iframe document, so any clones still in
      // the tracking map belong to a previous document — clear it so the app
      // styles are actually re-mirrored into the new one.
      let base = doc.getElementById("preview-base-css") as HTMLStyleElement | null;
      if (!base) {
        mirrored.clear();
        base = doc.createElement("style");
        base.id = "preview-base-css";
        base.textContent = PREVIEW_BASE_CSS;
        doc.head.insertBefore(base, doc.head.firstChild);
      }

      // Incrementally reconcile the mirrored app styles with the parent head:
      // add clones for new sources, refresh a <style>'s text if it changed
      // (dev HMR), and drop clones whose source disappeared — never touching an
      // unchanged clone (so linked stylesheets stay loaded, zero FOUC).
      const mirror = () => {
        const sources = document.querySelectorAll('style, link[rel="stylesheet"]');
        const seen = new Set<Node>();
        sources.forEach((node) => {
          seen.add(node);
          const existing = mirrored.get(node);
          if (existing) {
            // Keep <style> text in sync (HMR edits the same node in place).
            if (node.nodeName === "STYLE" && existing.textContent !== node.textContent) {
              existing.textContent = (node as HTMLStyleElement).textContent;
            }
            return;
          }
          const clone = node.cloneNode(true) as HTMLElement;
          clone.setAttribute("data-preview-style", "");
          doc.head.appendChild(clone);
          mirrored.set(node, clone);
        });
        // Remove clones whose source no longer exists.
        for (const [node, clone] of mirrored) {
          if (!seen.has(node)) {
            clone.remove();
            mirrored.delete(node);
          }
        }
      };
      // Measure the intrinsic height of the portaled content wrapper (NOT the
      // viewport-coupled documentElement/body), rAF-coalesced and guarded so equal
      // values never re-render — no ResizeObserver feedback loop / warning.
      const reportH = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const root = doc.body.firstElementChild as HTMLElement | null;
          const h = root ? root.scrollHeight : doc.body.scrollHeight;
          if (h > 0) setContentH((prev) => (prev !== h ? h : prev));
        });
      };
      mirror();
      doc.documentElement.style.background = "transparent";
      doc.body.className = "font-sans antialiased";
      doc.body.style.margin = "0";
      // Observe only the content wrapper for size (documentElement height is
      // viewport-coupled and would fight the scale); fall back to body.
      sizeObserver = new ResizeObserver(reportH);
      sizeObserver.observe(doc.body);
      headObserver = new MutationObserver(() => {
        mirror();
        reportH();
      });
      headObserver.observe(document.head, { childList: true, subtree: true });
      setMount(doc.body);
      reportH();
    };

    if (iframe.contentDocument?.readyState === "complete") init();
    iframe.addEventListener("load", init);
    return () => {
      iframe.removeEventListener("load", init);
      cancelAnimationFrame(raf);
      headObserver?.disconnect();
      sizeObserver?.disconnect();
      mirrored.clear();
    };
  }, []);

  // Fit-to-panel scale. Rounded to 3dp and memoised so it only changes when the
  // available width or the device width actually change — NOT on every keystroke /
  // preview re-render — which is what kept the frame from randomly re-zooming.
  // Guard tiny/zero measurements so a transient 0-width read can never scale the
  // whole preview down to a sliver.
  const scale = useMemo(() => {
    if (availW < 1) return 1;
    return Math.round(Math.min(1, availW / width) * 1000) / 1000;
  }, [availW, width]);

  return (
    // The OUTER panel is the scroll container: a fixed-height viewport that scrolls
    // top-to-bottom through the full (scaled) page, independent of the editor. The
    // iframe is sized to its FULL content height (no internal iframe scroll to fight
    // with) and is pointer-events:none so the wheel always scrolls this panel.
    <div className="h-[72vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-ink/10 bg-base shadow-soft xl:h-[calc(100vh-9rem)]">
      <div ref={wrapRef} className="w-full">
        <div
          style={{
            width: Math.round(width * scale),
            height: contentH ? Math.round(contentH * scale) : undefined,
            minHeight: contentH ? undefined : 240,
            margin: "0 auto",
          }}
        >
          <iframe
            ref={iframeRef}
            title="Live preview"
            style={{
              width,
              height: contentH || 600,
              border: 0,
              display: "block",
              background: "transparent",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              pointerEvents: "none",
            }}
          />
          {mount && createPortal(<div data-preview-root>{children}</div>, mount)}
        </div>
      </div>
    </div>
  );
}
