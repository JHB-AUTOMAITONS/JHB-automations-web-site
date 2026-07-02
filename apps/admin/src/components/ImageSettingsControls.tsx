"use client";

import type { ImageAlign, ImageObjectFit, ImageSettings } from "@jhb/shared/containers";

/**
 * Reusable universal image size/style controls. Edits an optional `ImageSettings`
 * object (all fields optional → empty = default sizing). Rendered by ImagePicker
 * when the parent passes `onChangeSettings`, so every image field can share the
 * exact same controls. The website applies them via smartImgAttrs() (shared), so
 * the admin preview matches production.
 */
const lbl = "mb-1 block text-[11px] font-medium text-muted";
const input = "w-full rounded-lg border border-ink/10 bg-base px-2.5 py-1.5 text-sm outline-none focus:border-primary";
const tiny = "mb-1 block text-[10px] text-muted";

export default function ImageSettingsControls({
  value,
  onChange,
}: {
  value: ImageSettings;
  onChange: (v: ImageSettings) => void;
}) {
  const s = value || {};
  const set = (patch: Partial<ImageSettings>) => onChange({ ...s, ...patch });
  const setBox = (bp: "tablet" | "mobile", patch: { width?: string; height?: string }) =>
    onChange({ ...s, [bp]: { ...(s[bp] || {}), ...patch } });
  const num = (v: string): number | undefined => (v === "" ? undefined : Number(v));
  const opt = (v: string) => v || undefined;

  return (
    <details className="rounded-lg border border-ink/10 bg-surface p-2">
      <summary className="cursor-pointer text-[11px] font-medium text-muted">
        Size &amp; style — width, height, fit, border, responsive
      </summary>
      <div className="mt-2 space-y-3">
        {/* size */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <label className="block"><span className={lbl}>Width</span>
            <input className={input} value={s.width ?? ""} onChange={(e) => set({ width: opt(e.target.value) })} placeholder="auto / 600px / 100%" /></label>
          <label className="block"><span className={lbl}>Height</span>
            <input className={input} value={s.height ?? ""} onChange={(e) => set({ height: opt(e.target.value) })} placeholder="auto / 400px" /></label>
          <label className="block"><span className={lbl}>Max width</span>
            <input className={input} value={s.maxWidth ?? ""} onChange={(e) => set({ maxWidth: opt(e.target.value) })} placeholder="100%" /></label>
          <label className="block"><span className={lbl}>Max height</span>
            <input className={input} value={s.maxHeight ?? ""} onChange={(e) => set({ maxHeight: opt(e.target.value) })} placeholder="none" /></label>
          <label className="block"><span className={lbl}>Min width</span>
            <input className={input} value={s.minWidth ?? ""} onChange={(e) => set({ minWidth: opt(e.target.value) })} /></label>
          <label className="block"><span className={lbl}>Min height</span>
            <input className={input} value={s.minHeight ?? ""} onChange={(e) => set({ minHeight: opt(e.target.value) })} /></label>
        </div>

        {/* fit / position / align */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <label className="block"><span className={lbl}>Object fit</span>
            <select className={input} value={s.objectFit ?? ""} onChange={(e) => set({ objectFit: opt(e.target.value) as ImageObjectFit | undefined })}>
              <option value="">Default</option><option value="cover">Cover</option><option value="contain">Contain</option>
              <option value="fill">Fill</option><option value="scale-down">Scale down</option><option value="none">None</option>
            </select>
          </label>
          <label className="block"><span className={lbl}>Object position</span>
            <select className={input} value={s.objectPosition ?? ""} onChange={(e) => set({ objectPosition: opt(e.target.value) })}>
              <option value="">Center</option><option value="top">Top</option><option value="bottom">Bottom</option>
              <option value="left">Left</option><option value="right">Right</option>
            </select>
          </label>
          <label className="block"><span className={lbl}>Align</span>
            <select className={input} value={s.align ?? ""} onChange={(e) => set({ align: opt(e.target.value) as ImageAlign | undefined })}>
              <option value="">Default</option><option value="left">Left</option><option value="center">Center</option>
              <option value="right">Right</option><option value="full">Full width</option>
            </select>
          </label>
        </div>

        {/* border / style */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className="block"><span className={lbl}>Radius</span>
            <input className={input} value={s.radius ?? ""} onChange={(e) => set({ radius: opt(e.target.value) })} placeholder="16px" /></label>
          <label className="block"><span className={lbl}>Border width</span>
            <input className={input} value={s.borderWidth ?? ""} onChange={(e) => set({ borderWidth: opt(e.target.value) })} placeholder="1px" /></label>
          <label className="block"><span className={lbl}>Border color</span>
            <input type="color" className="h-9 w-full cursor-pointer rounded border border-ink/10" value={s.borderColor || "#000000"} onChange={(e) => set({ borderColor: e.target.value })} /></label>
          <label className="block"><span className={lbl}>Shadow</span>
            <select className={input} value={s.shadow ?? ""} onChange={(e) => set({ shadow: opt(e.target.value) as ImageSettings["shadow"] })}>
              <option value="">Default</option><option value="none">None</option><option value="sm">Small</option>
              <option value="md">Medium</option><option value="lg">Large</option>
            </select>
          </label>
        </div>

        {/* transform */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className="block"><span className={lbl}>Opacity %</span>
            <input type="number" min={0} max={100} className={input} value={s.opacity ?? ""} onChange={(e) => set({ opacity: num(e.target.value) })} placeholder="100" /></label>
          <label className="block"><span className={lbl}>Rotate °</span>
            <input type="number" className={input} value={s.rotate ?? ""} onChange={(e) => set({ rotate: num(e.target.value) })} placeholder="0" /></label>
          <label className="block"><span className={lbl}>Scale</span>
            <input type="number" step={0.1} className={input} value={s.scale ?? ""} onChange={(e) => set({ scale: num(e.target.value) })} placeholder="1" /></label>
          <label className="block"><span className={lbl}>Z-index</span>
            <input type="number" className={input} value={s.zIndex ?? ""} onChange={(e) => set({ zIndex: num(e.target.value) })} placeholder="0" /></label>
        </div>

        {/* responsive */}
        <div>
          <span className={lbl}>Responsive size (empty = inherit the larger breakpoint)</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="block"><span className={tiny}>Tablet width</span>
              <input className={input} value={s.tablet?.width ?? ""} onChange={(e) => setBox("tablet", { width: opt(e.target.value) })} placeholder="450px" /></label>
            <label className="block"><span className={tiny}>Tablet height</span>
              <input className={input} value={s.tablet?.height ?? ""} onChange={(e) => setBox("tablet", { height: opt(e.target.value) })} placeholder="auto" /></label>
            <label className="block"><span className={tiny}>Mobile width</span>
              <input className={input} value={s.mobile?.width ?? ""} onChange={(e) => setBox("mobile", { width: opt(e.target.value) })} placeholder="100%" /></label>
            <label className="block"><span className={tiny}>Mobile height</span>
              <input className={input} value={s.mobile?.height ?? ""} onChange={(e) => setBox("mobile", { height: opt(e.target.value) })} placeholder="auto" /></label>
          </div>
        </div>

        {/* loading */}
        <div className="grid grid-cols-2 gap-2">
          <label className="block"><span className={lbl}>Loading</span>
            <select className={input} value={s.loading ?? ""} onChange={(e) => set({ loading: opt(e.target.value) as ImageSettings["loading"] })}>
              <option value="">Lazy (default)</option><option value="lazy">Lazy</option><option value="eager">Eager</option>
            </select>
          </label>
          <label className="block"><span className={lbl}>Fetch priority</span>
            <select className={input} value={s.fetchPriority ?? ""} onChange={(e) => set({ fetchPriority: opt(e.target.value) as ImageSettings["fetchPriority"] })}>
              <option value="">Auto</option><option value="high">High</option><option value="low">Low</option>
            </select>
          </label>
        </div>
      </div>
    </details>
  );
}
