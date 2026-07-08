"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SiteSettings, LogoSettings } from "@jhb/shared/content";
import { saveBranding } from "@/app/actions";
import { withTimeout, actionErrorMessage } from "@/lib/asyncAction";
import EditorHeader from "./EditorHeader";
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
  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [toast, setToast] = useState<Toast>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [dims, setDims] = useState("");

  const set = (patch: Partial<LogoSettings>) => setB((p) => ({ ...p, ...patch }));
  const flash = (t: Toast) => { setToast(t); setTimeout(() => setToast(null), 3500); };

  const save = async () => {
    if (busy) return;
    setBusy("publish");
    try {
      const res = await withTimeout(saveBranding({ ...settings, branding: b } as unknown as Record<string, unknown>));
      if (res.ok) { flash({ type: "success", msg: "Logos saved — live on the site & admin." }); router.refresh(); }
      else flash({ type: "error", msg: res.error || "Save failed." });
    } catch (e) {
      flash({ type: "error", msg: actionErrorMessage(e, "Save failed. Please try again.") });
    } finally {
      setBusy("");
    }
  };

  const headerSrc = (device === "mobile" && b.mobileLogo) ? b.mobileLogo : (b.headerLogo || "/logo.png");

  return (
    <div>
      <EditorHeader
        title="Logo Management"
        subtitle={<>Upload and manage every logo without code. Saving versions each change — <Link href="/activity/versions" className="text-primary hover:underline">restore a previous version</Link> any time.</>}
        busy={busy}
        toast={toast}
        onPublish={save}
        publishLabel="Save changes"
      />

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

          {/* Logo sizing */}
          <section className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Logo sizing</h2>
            <p className="text-xs text-muted">Controls the maximum display height of the logo in the header navigation.</p>
            <div className="mt-4 max-w-[160px]">
              <NumField label="Max height in nav (px)" value={b.height} onChange={(n) => set({ height: n })} />
            </div>
            <button onClick={() => set({ height: 48 })} className="mt-3 text-xs font-medium text-muted hover:text-primary">
              Reset to default (48 px)
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
              {/* faux header bar — logo only, no separate text */}
              <div className="rounded-xl bg-[#0a0e1a] p-3 shadow-glow">
                <div className="flex items-center justify-between gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={headerSrc}
                    alt="Header logo preview"
                    onLoad={(e) => setDims(`${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight}px`)}
                    className="w-auto object-contain"
                    style={{ maxHeight: b.height || 48 }}
                  />
                  {/* Simulated nav links */}
                  <div className="flex shrink-0 gap-3 opacity-30">
                    {[8, 12, 8, 10, 6].map((w, i) => (
                      <span key={i} className="h-1.5 rounded-full bg-white" style={{ width: w * 4 }} />
                    ))}
                  </div>
                </div>
              </div>
              {/* footer mark preview */}
              <div className="mt-3 rounded-xl bg-[#0a0e1a] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.footerLogo || b.headerLogo || "/logo.png"}
                  alt="Footer logo preview"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            {b.headerLogo
              ? "Header logo active — shown without text in the navbar."
              : "No header logo set — using /logo.png. Upload one above to replace it."}
            {dims && ` · Source: ${dims}`}
          </p>
        </div>
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
