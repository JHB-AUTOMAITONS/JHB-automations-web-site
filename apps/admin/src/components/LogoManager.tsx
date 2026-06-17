"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SiteSettings, LogoSettings } from "@jhb/shared/content";
import { saveBranding } from "@/app/actions";
import ImagePicker from "./ImagePicker";

type Toast = { type: "success" | "error"; msg: string } | null;

const LOGO_TYPES: { key: keyof LogoSettings; label: string; help: string }[] = [
  { key: "headerLogo", label: "Header Logo", help: "Website top navigation. Box appearance is configured below." },
  { key: "footerLogo", label: "Footer Logo", help: "Website footer brand mark." },
  { key: "adminLogo", label: "Admin Dashboard Logo", help: "This admin sidebar & mobile bar." },
  { key: "favicon", label: "Favicon", help: "Browser-tab icon — use a square PNG/SVG (32×32 or larger)." },
  { key: "mobileLogo", label: "Mobile Logo", help: "Optional — used on small screens; falls back to the header logo." },
];

const DEVICE_W = { desktop: "100%", tablet: "440px", mobile: "300px" } as const;
type Device = keyof typeof DEVICE_W;

export default function LogoManager({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [b, setB] = useState<LogoSettings>(settings.branding);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [dims, setDims] = useState("");

  const set = (patch: Partial<LogoSettings>) => setB((p) => ({ ...p, ...patch }));
  const flash = (t: Toast) => { setToast(t); setTimeout(() => setToast(null), 3500); };

  const save = async () => {
    setBusy(true);
    const res = await saveBranding({ ...settings, branding: b } as unknown as Record<string, unknown>);
    setBusy(false);
    if (res.ok) { flash({ type: "success", msg: "Logos saved — live on the site & admin." }); router.refresh(); }
    else flash({ type: "error", msg: res.error || "Save failed." });
  };

  const headerSrc = (device === "mobile" && b.mobileLogo) ? b.mobileLogo : (b.headerLogo || "/logo.png");

  return (
    <div>
      {toast && <div className={`fixed right-6 top-6 z-[60] rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Logo Management</h1>
          <p className="mt-1 text-sm text-muted">
            Upload and manage every logo without code. Saving versions each change —{" "}
            <Link href="/activity/versions" className="text-primary hover:underline">restore a previous version</Link> any time.
          </p>
        </div>
        <button onClick={save} disabled={busy} className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_minmax(320px,420px)]">
        {/* ---- Uploads + settings ---- */}
        <div className="space-y-4">
          {LOGO_TYPES.map((t) => {
            const url = b[t.key] as string;
            return (
              <section key={t.key} className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-semibold">{t.label}</h2>
                    <p className="text-xs text-muted">{t.help}</p>
                  </div>
                  {url && (
                    <a href={url} download target="_blank" className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary">
                      Download
                    </a>
                  )}
                </div>
                <div className="mt-3">
                  <ImagePicker value={url || null} onChange={(u) => set({ [t.key]: u || "" } as Partial<LogoSettings>)} alt={false} />
                </div>
              </section>
            );
          })}

          {/* Header logo box appearance */}
          <section className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Header logo box</h2>
            <p className="text-xs text-muted">Size, padding, radius, background & alignment of the header logo container.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <NumField label="Width (px)" value={b.width} onChange={(n) => set({ width: n })} />
              <NumField label="Height (px)" value={b.height} onChange={(n) => set({ height: n })} />
              <NumField label="Padding (px)" value={b.padding} onChange={(n) => set({ padding: n })} />
              <NumField label="Border radius (px)" value={b.radius} onChange={(n) => set({ radius: n })} />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">Background colour</span>
                <div className="flex items-center gap-2">
                  <input type="color" value={b.bgColor} onChange={(e) => set({ bgColor: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-ink/10 bg-transparent p-0.5" />
                  <input value={b.bgColor} onChange={(e) => set({ bgColor: e.target.value })} className="input !py-1.5 !text-xs" />
                </div>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted">Logo alignment</span>
                <select value={b.align} onChange={(e) => set({ align: e.target.value as "left" | "center" })} className="input !py-2 !text-sm">
                  <option value="center">Center</option>
                  <option value="left">Left</option>
                </select>
              </label>
            </div>
            <button onClick={() => set({ width: 48, height: 48, padding: 6, radius: 12, bgColor: "#ffffff", align: "center" })} className="mt-3 text-xs font-medium text-muted hover:text-primary">
              Reset box to defaults
            </button>
          </section>
        </div>

        {/* ---- Live preview ---- */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Live preview</span>
            <div className="flex gap-1">
              {(Object.keys(DEVICE_W) as Device[]).map((d) => (
                <button key={d} onClick={() => setDevice(d)} className={`rounded-md px-2 py-1 text-[11px] font-medium ${device === d ? "bg-primary/10 text-primary" : "text-muted hover:text-ink"}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-ink/10 bg-base p-3">
            <div className="mx-auto transition-all" style={{ width: DEVICE_W[device], maxWidth: "100%" }}>
              {/* faux header bar */}
              <div className="rounded-xl bg-[#0a0e1a] p-3 shadow-glow">
                <div className="flex items-center gap-3">
                  <span
                    className="flex shrink-0 items-center justify-center overflow-hidden border border-white/10"
                    style={{ width: b.width, height: b.height, padding: b.padding, borderRadius: b.radius, background: b.bgColor }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={headerSrc}
                      alt="Header logo preview"
                      onLoad={(e) => setDims(`${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight}px`)}
                      className="max-h-full max-w-full object-contain"
                      style={{ objectPosition: b.align }}
                    />
                  </span>
                  <span className="font-display text-lg font-bold text-white">JHB <span className="grad-text">Automations</span></span>
                </div>
              </div>
              {/* footer mark preview */}
              {b.footerLogo && (
                <div className="mt-3 rounded-xl bg-[#0a0e1a] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.footerLogo} alt="Footer logo preview" className="h-9 w-auto object-contain" />
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            {b.headerLogo ? "Header logo set." : "Using built-in /logo.png (no header logo uploaded)."}
            {dims && ` · Source: ${dims}`}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={busy} className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input type="number" min={0} value={value} onChange={(e) => onChange(Math.max(0, parseInt(e.target.value || "0", 10)))} className="input !py-2 !text-sm" />
    </label>
  );
}
