"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ---------- colour maths (RGB ↔ HSV ↔ HSL ↔ HEX) ---------- */
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

type RGB = { r: number; g: number; b: number };
type HSV = { h: number; s: number; v: number };

function hsvToRgb(h: number, s: number, v: number): RGB {
  s /= 100; v /= 100;
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}
function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h = h * 60; if (h < 0) h += 360;
  }
  return { h: Math.round(h), s: Math.round((max === 0 ? 0 : d / max) * 100), v: Math.round(max * 100) };
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
    h = h * 60; if (h < 0) h += 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}
const toHex = ({ r, g, b }: RGB) =>
  "#" + [r, g, b].map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0")).join("").toUpperCase();
function hexToRgb(hex: string): RGB | null {
  const h = hex.replace(/^#/, "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) };
}
// Resolve ANY CSS colour (hex / rgb() / hsl() / name) to RGB via the browser.
function resolveColor(str: string): RGB | null {
  const s = str.trim();
  if (!s) return null;
  const probe = new Option().style;
  probe.color = "";
  probe.color = s;
  if (probe.color === "") return null;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = s;
  const out = ctx.fillStyle as string;
  if (out.startsWith("#")) return hexToRgb(out);
  const m = out.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const [r, g, b] = m[1].split(",").map((n) => parseFloat(n));
    return { r, g, b };
  }
  return null;
}

const PRESETS = [
  "#000000", "#374151", "#6B7280", "#9CA3AF", "#D1D5DB", "#FFFFFF",
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
  "#10B981", "#06B6D4", "#3B82F6", "#2563EB", "#6366F1", "#8B5CF6",
  "#A855F7", "#EC4899", "#F43F5E", "#78350F", "#1E3A8A", "#064E3B",
];

type Props = {
  open: boolean;
  initialColor: string;
  recent: string[];
  saved: string[];
  onApply: (hex: string) => void;
  onSaveCustom: (hex: string) => void;
  onClose: () => void;
};

export default function ColorEditor({ open, initialColor, recent, saved, onApply, onSaveCustom, onClose }: Props) {
  const [hsv, setHsv] = useState<HSV>({ h: 217, s: 84, v: 92 });
  const [hexText, setHexText] = useState("#2563EB");
  const [search, setSearch] = useState("");
  const [searchErr, setSearchErr] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Load the incoming colour each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    const rgb = resolveColor(initialColor) || { r: 37, g: 99, b: 235 };
    setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
    setSearch("");
    setSearchErr("");
  }, [open, initialColor]);

  const rgb = useMemo(() => hsvToRgb(hsv.h, hsv.s, hsv.v), [hsv]);
  const hex = useMemo(() => toHex(rgb), [rgb]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);

  // Keep the HEX text field in sync with the canonical colour.
  useEffect(() => { setHexText(hex); }, [hex]);

  if (!open) return null;

  const setFromRgb = (r: number, g: number, b: number) =>
    setHsv(rgbToHsv(clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)));
  const setFromHsl = (h: number, s: number, l: number) => {
    const c = hslToRgb(clamp(h, 0, 360), clamp(s, 0, 100), clamp(l, 0, 100));
    setHsv(rgbToHsv(c.r, c.g, c.b));
  };

  const panelPick = (e: React.PointerEvent) => {
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const y = clamp(e.clientY - rect.top, 0, rect.height);
    setHsv((p) => ({ ...p, s: Math.round((x / rect.width) * 100), v: Math.round((1 - y / rect.height) * 100) }));
  };

  const runSearch = () => {
    const rgbV = resolveColor(search);
    if (!rgbV) { setSearchErr("Unknown colour — try a name, #HEX, rgb() or hsl()."); return; }
    setHsv(rgbToHsv(rgbV.r, rgbV.g, rgbV.b));
    setSearchErr("");
  };

  const Num = ({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (n: number) => void }) => (
    <label className="flex items-center gap-1">
      <span className="w-12 text-[11px] text-muted">{label}</span>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(parseInt(e.target.value || "0", 10), 0, max))}
        className="input !w-16 !py-1 !text-xs"
      />
    </label>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-bold">Edit Colour</h3>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded text-muted hover:bg-ink/[0.05]">✕</button>
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_240px]">
          {/* Visual picker */}
          <div>
            <div
              ref={panelRef}
              onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); panelPick(e); }}
              onPointerMove={(e) => dragging.current && panelPick(e)}
              onPointerUp={() => (dragging.current = false)}
              className="relative h-44 w-full cursor-crosshair rounded-lg"
              style={{
                background: `linear-gradient(to bottom, rgba(0,0,0,0), #000), linear-gradient(to right, #fff, hsl(${hsv.h},100%,50%))`,
              }}
            >
              <span
                className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, background: hex }}
              />
            </div>
            {/* Hue slider */}
            <input
              type="range" min={0} max={360} value={hsv.h}
              onChange={(e) => setHsv((p) => ({ ...p, h: parseInt(e.target.value, 10) }))}
              className="mt-3 h-3 w-full cursor-pointer appearance-none rounded-full"
              style={{ background: "linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)" }}
            />

            {/* Search by name / any code */}
            <div className="mt-4">
              <label className="mb-1 block text-[11px] font-medium text-muted">Search colour…</label>
              <div className="flex gap-1">
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSearchErr(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); runSearch(); } }}
                  placeholder="purple · #FF5733 · rgb(255,0,0) · hsl(210,100%,50%)"
                  className={`input !py-1.5 !text-xs ${searchErr ? "!border-red-400" : ""}`}
                />
                <button onClick={runSearch} className="shrink-0 rounded-md border border-ink/10 px-2 py-1 text-xs font-semibold text-muted hover:text-ink">Find</button>
              </div>
              {searchErr && <p className="mt-1 text-[11px] text-red-500">{searchErr}</p>}
            </div>
          </div>

          {/* Numeric fields + preview */}
          <div>
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 shrink-0 rounded-lg border border-ink/10 shadow-inner" style={{ background: hex }} />
              <div className="text-xs text-muted">
                <p className="font-semibold text-ink">Live preview</p>
                <p>{hex}</p>
                <p>rgb({rgb.r}, {rgb.g}, {rgb.b})</p>
                <p>hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</p>
              </div>
            </div>

            <label className="mt-3 flex items-center gap-1">
              <span className="w-12 text-[11px] text-muted">HEX</span>
              <input
                value={hexText}
                onChange={(e) => {
                  setHexText(e.target.value);
                  const rgbV = hexToRgb(e.target.value);
                  if (rgbV) setHsv(rgbToHsv(rgbV.r, rgbV.g, rgbV.b));
                }}
                className="input !py-1 !text-xs"
              />
            </label>

            <div className="mt-2 grid grid-cols-2 gap-1.5">
              <Num label="Red" value={rgb.r} max={255} onChange={(n) => setFromRgb(n, rgb.g, rgb.b)} />
              <Num label="Hue" value={hsl.h} max={360} onChange={(n) => setFromHsl(n, hsl.s, hsl.l)} />
              <Num label="Green" value={rgb.g} max={255} onChange={(n) => setFromRgb(rgb.r, n, rgb.b)} />
              <Num label="Sat" value={hsl.s} max={100} onChange={(n) => setFromHsl(hsl.h, n, hsl.l)} />
              <Num label="Blue" value={rgb.b} max={255} onChange={(n) => setFromRgb(rgb.r, rgb.g, n)} />
              <Num label="Light" value={hsl.l} max={100} onChange={(n) => setFromHsl(hsl.h, hsl.s, n)} />
            </div>

            <label className="mt-3 flex items-center gap-2 text-[11px] font-medium text-muted">
              Native picker
              <input type="color" value={hex} onChange={(e) => { const c = hexToRgb(e.target.value); if (c) setHsv(rgbToHsv(c.r, c.g, c.b)); }} className="h-7 w-9 cursor-pointer rounded border border-ink/10 bg-transparent p-0" />
            </label>
          </div>
        </div>

        {/* Swatches */}
        <div className="mt-4 space-y-2">
          <Swatches title="Presets" colors={PRESETS} onPick={(c) => { const r = hexToRgb(c)!; setHsv(rgbToHsv(r.r, r.g, r.b)); }} />
          {recent.length > 0 && <Swatches title="Recent" colors={recent} onPick={(c) => { const r = resolveColor(c); if (r) setHsv(rgbToHsv(r.r, r.g, r.b)); }} />}
          {saved.length > 0 && <Swatches title="Saved / brand colours" colors={saved} onPick={(c) => { const r = resolveColor(c); if (r) setHsv(rgbToHsv(r.r, r.g, r.b)); }} />}
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button onClick={() => onSaveCustom(hex)} className="rounded-lg border border-ink/10 px-3 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary">
            ＋ Save to custom
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:text-ink">Cancel</button>
            <button onClick={() => onApply(hex)} className="btn btn-primary !px-5 !py-2 !text-sm">Apply to text</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Swatches({ title, colors, onPick }: { title: string; colors: string[]; onPick: (c: string) => void }) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium text-muted">{title}</p>
      <div className="flex flex-wrap gap-1">
        {colors.map((c, i) => (
          <button key={`${c}-${i}`} type="button" title={c} onClick={() => onPick(c)} className="h-5 w-5 rounded border border-ink/10" style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}
