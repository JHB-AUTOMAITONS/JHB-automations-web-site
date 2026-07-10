"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";

/**
 * Reusable resizable Editor | Preview split for every CMS page editor
 * (Service Pages, Products, Home, Blog, About …). Drop it in place of the old
 * `grid xl:grid-cols-[1fr_440px]` wrapper:
 *
 *   <SplitPane storageKey="cms-split:service" left={<Editor/>} right={<Preview/>} />
 *
 * Behaviour
 *   • A draggable 8px divider (cursor: col-resize) sits between the two panels.
 *     Dragging widens one panel and narrows the other — never overlapping.
 *   • Widths are clamped so the Editor stays ≥ 450px / ≤ 80% and the Preview
 *     stays ≥ 350px / ≤ 70%. Enforced twice: in JS (keeps the stored value
 *     honest) and via CSS min/max-width (a layout backstop on resize).
 *   • The split is stored as a % of the container, so it survives window resize
 *     and is persisted to localStorage under `storageKey` — restored on reload.
 *   • Double-clicking the divider resets to the default 65 / 35 split.
 *   • Below the `xl` breakpoint the panels stack vertically (the divider hides),
 *     exactly like the previous grid layout — the resize is a desktop feature.
 *
 * The divider drag writes the width straight to a CSS custom property (no React
 * re-render per pointer move) so it stays at 60fps; the value is committed to
 * state + localStorage only on pointer-up. Because only the panel widths change
 * (not the SplitPane's own width), the Preview's internal ResizeObserver
 * re-scales the Desktop/Tablet/Mobile frame automatically as you drag.
 */

const DIVIDER_PX = 8; // matches the `w-2` divider track below

export type SplitPaneProps = {
  /** localStorage key for the persisted split (unique per page family). */
  storageKey: string;
  /** Left (Editor) panel content. */
  left: ReactNode;
  /** Right (Preview) panel content. When null/false the Editor fills the row and no divider renders. */
  right?: ReactNode;
  /** Extra classes for the outer row (spacing, height, overflow — e.g. the fill-height service editor). */
  className?: string;
  /** Default Editor share of the width, in %. Double-click resets to this. */
  defaultEditorPct?: number;
  minEditorPx?: number;
  minPreviewPx?: number;
  maxEditorPct?: number;
  maxPreviewPct?: number;
};

type Limits = { minEditorPx: number; minPreviewPx: number; maxEditorPct: number; maxPreviewPct: number };

// Clamp an Editor width (as a % of the container) to the configured px + %
// bounds for BOTH panels, given the live container width. Returns a % again so
// the stored value stays resolution-independent.
function clampEditorPct(pct: number, containerW: number, lim: Limits): number {
  if (!containerW || containerW <= 0) return Math.min(100, Math.max(0, pct));
  // Editor must also leave the Preview under its max (i.e. Editor over 100−maxPreview).
  const minPx = Math.max(lim.minEditorPx, ((100 - lim.maxPreviewPct) / 100) * containerW);
  const maxPx = Math.min((lim.maxEditorPct / 100) * containerW, containerW - lim.minPreviewPx - DIVIDER_PX);
  let px = (pct / 100) * containerW;
  // When the container is too narrow to honour both minimums, keep the Preview's
  // minimum (maxPx) rather than letting panels overlap.
  px = minPx <= maxPx ? Math.min(Math.max(px, minPx), maxPx) : maxPx;
  return (px / containerW) * 100;
}

function GripDots() {
  return (
    <svg width="8" height="16" viewBox="0 0 8 16" fill="currentColor" aria-hidden="true">
      <circle cx="2" cy="3" r="1" />
      <circle cx="6" cy="3" r="1" />
      <circle cx="2" cy="8" r="1" />
      <circle cx="6" cy="8" r="1" />
      <circle cx="2" cy="13" r="1" />
      <circle cx="6" cy="13" r="1" />
    </svg>
  );
}

export default function SplitPane({
  storageKey,
  left,
  right,
  className = "",
  defaultEditorPct = 65,
  minEditorPx = 450,
  minPreviewPx = 350,
  maxEditorPct = 80,
  maxPreviewPct = 70,
}: SplitPaneProps) {
  const lim: Limits = { minEditorPx, minPreviewPx, maxEditorPct, maxPreviewPct };
  const limRef = useRef(lim);
  limRef.current = lim;

  const containerRef = useRef<HTMLDivElement>(null);
  // Editor width as a % of the container — the persisted source of truth (user intent).
  const [editorPct, setEditorPct] = useState(defaultEditorPct);
  const [containerW, setContainerW] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Hydrate the saved split after mount (SSR renders the default → no mismatch).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      const n = saved == null ? NaN : Number(saved);
      if (Number.isFinite(n) && n > 0 && n < 100) setEditorPct(n);
    } catch {
      /* localStorage unavailable (private mode) — keep the default. */
    }
  }, [storageKey]);

  // Track the container width so the clamp math and drag stay accurate on resize.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const commit = useCallback(
    (pct: number) => {
      setEditorPct(pct);
      try {
        window.localStorage.setItem(storageKey, String(Math.round(pct * 100) / 100));
      } catch {
        /* ignore persistence failures */
      }
    },
    [storageKey],
  );

  // Displayed basis — always clamped to the current container, so a window
  // resize never breaks the layout even though `editorPct` keeps the intent.
  const basisPct = clampEditorPct(editorPct, containerW, lim);

  const setLiveBasis = useCallback((pct: number) => {
    containerRef.current?.style.setProperty("--sp-basis", `${pct}%`);
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const container = containerRef.current;
      if (!container) return;
      e.preventDefault();
      const handle = e.currentTarget;
      handle.setPointerCapture(e.pointerId);
      setDragging(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const rect = container.getBoundingClientRect();
      const W = rect.width;
      let raf = 0;
      let latest = clampEditorPct(editorPct, W, limRef.current);

      const onMove = (ev: PointerEvent) => {
        const editorPx = ev.clientX - rect.left - DIVIDER_PX / 2;
        latest = clampEditorPct((editorPx / W) * 100, W, limRef.current);
        if (!raf) {
          raf = requestAnimationFrame(() => {
            raf = 0;
            setLiveBasis(latest);
          });
        }
      };
      const onUp = () => {
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        try {
          handle.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        setDragging(false);
        commit(latest);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [editorPct, commit, setLiveBasis],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const W = containerW || containerRef.current?.clientWidth || 0;
      if (!W) return;
      const stepPct = (24 / W) * 100; // ~24px per keypress
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        commit(clampEditorPct(basisPct - stepPct, W, limRef.current));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        commit(clampEditorPct(basisPct + stepPct, W, limRef.current));
      } else if (e.key === "Home") {
        e.preventDefault();
        commit(clampEditorPct(0, W, limRef.current));
      } else if (e.key === "End") {
        e.preventDefault();
        commit(clampEditorPct(100, W, limRef.current));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        commit(defaultEditorPct);
      }
    },
    [basisPct, containerW, commit, defaultEditorPct],
  );

  const reset = useCallback(() => commit(defaultEditorPct), [commit, defaultEditorPct]);

  // Editor-only (no preview): fill the row, skip the divider entirely.
  if (!right) {
    return <div className={className}>{left}</div>;
  }

  // Custom properties consumed by the `xl:` arbitrary-value classes below.
  const styleVars: CSSProperties = {
    ["--sp-basis" as string]: `${basisPct}%`,
    ["--sp-min-editor" as string]: `${minEditorPx}px`,
    ["--sp-max-editor" as string]: `${maxEditorPct}%`,
    ["--sp-min-preview" as string]: `${minPreviewPx}px`,
    ["--sp-max-preview" as string]: `${maxPreviewPct}%`,
  };

  return (
    <div ref={containerRef} style={styleVars} className={`flex flex-col gap-6 xl:flex-row xl:gap-0 ${className}`}>
      {/* Editor panel */}
      <div className="min-h-0 min-w-0 xl:basis-[var(--sp-basis)] xl:grow-0 xl:shrink-0 xl:max-w-[var(--sp-max-editor)] xl:min-w-[var(--sp-min-editor)]">
        {left}
      </div>

      {/* Divider */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize editor and preview panels"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(basisPct)}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onDoubleClick={reset}
        onKeyDown={onKeyDown}
        title="Drag to resize · double-click to reset"
        className="group relative hidden w-2 shrink-0 cursor-col-resize touch-none select-none xl:flex xl:justify-center"
      >
        {/* full-height track line */}
        <span
          className={`pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors ${
            dragging ? "bg-primary" : "bg-ink/10 group-hover:bg-primary/50 group-focus-visible:bg-primary/50"
          }`}
        />
        {/* grip — sticky at mid-viewport so it stays in view while the page/columns scroll */}
        <span
          className={`sticky top-[50vh] z-10 flex h-9 w-4 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-colors ${
            dragging
              ? "border-primary bg-primary text-white"
              : "border-ink/10 bg-surface text-muted group-hover:border-primary/60 group-hover:text-primary group-focus-visible:border-primary/60 group-focus-visible:text-primary"
          }`}
        >
          <GripDots />
        </span>
      </div>

      {/* Preview panel */}
      <div className="min-h-0 min-w-0 xl:flex-1 xl:max-w-[var(--sp-max-preview)] xl:min-w-[var(--sp-min-preview)]">
        {right}
      </div>

      {/* While dragging, an overlay guarantees the col-resize cursor everywhere
          and stops iframes/text-selection from swallowing pointer moves. */}
      {dragging && <div className="fixed inset-0 z-[60] cursor-col-resize" />}
    </div>
  );
}
