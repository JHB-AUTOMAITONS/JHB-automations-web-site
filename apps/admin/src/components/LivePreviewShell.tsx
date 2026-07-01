"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

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

const DEVICES = [
  { key: "desktop", label: "Desktop", width: 1280 },
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

      <DeviceFrame width={width}>{children}</DeviceFrame>

      {footer && <p className="mt-3 text-[11px] text-muted">{footer}</p>}
    </div>
  );
}

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

    const init = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      // about:blank can be `complete` synchronously AND still fire `load`, so init
      // may run twice — tear down any prior observers first to avoid leaks.
      headObserver?.disconnect();
      sizeObserver?.disconnect();

      const mirror = () => {
        doc.head.querySelectorAll("[data-preview-style]").forEach((n) => n.remove());
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
          const clone = node.cloneNode(true) as HTMLElement;
          clone.setAttribute("data-preview-style", "");
          doc.head.appendChild(clone);
        });
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
      sizeObserver = new ResizeObserver(reportH);
      sizeObserver.observe(doc.documentElement);
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
    };
  }, []);

  const scale = availW > 0 ? Math.min(1, availW / width) : 1;

  return (
    // The OUTER panel is the scroll container: a fixed-height viewport that scrolls
    // top-to-bottom through the full (scaled) page, independent of the editor. The
    // iframe is sized to its FULL content height (no internal iframe scroll to fight
    // with) and is pointer-events:none so the wheel always scrolls this panel.
    <div className="h-[72vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-ink/10 bg-base shadow-soft xl:h-[calc(100vh-9rem)]">
      <div ref={wrapRef} className="w-full">
        <div
          style={{
            width: width * scale,
            height: contentH ? contentH * scale : undefined,
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
