"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogHero } from "@jhb/shared/content";
import BlogHeroBanner from "@jhb/shared/blog-hero-view";
import { saveBlogHeroDraft, publishBlogHero } from "@/app/actions";
import EditorHeader from "./EditorHeader";
import ImagePicker from "./ImagePicker";

type Toast = { type: "success" | "error"; msg: string } | null;
type Device = "desktop" | "tablet" | "mobile";
const DEVICE_W: Record<Device, string> = { desktop: "100%", tablet: "768px", mobile: "390px" };

export default function BlogHeroEditor({ initial }: { initial: BlogHero }) {
  const router = useRouter();
  const [h, setH] = useState<BlogHero>(initial);
  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [toast, setToast] = useState<Toast>(null);
  const [device, setDevice] = useState<Device>("desktop");

  const set = (patch: Partial<BlogHero>) => setH((p) => ({ ...p, ...patch }));
  const flash = (t: Toast) => { setToast(t); setTimeout(() => setToast(null), 3500); };

  const saveDraft = async () => {
    setBusy("save");
    const res = await saveBlogHeroDraft(h as unknown as Record<string, unknown>);
    setBusy("");
    if (res.ok) { flash({ type: "success", msg: "Draft saved — not live yet." }); router.refresh(); }
    else flash({ type: "error", msg: res.error || "Save failed." });
  };
  const publish = async () => {
    setBusy("publish");
    const res = await publishBlogHero(h as unknown as Record<string, unknown>);
    setBusy("");
    if (res.ok) { flash({ type: "success", msg: "Published — live on /blog." }); router.refresh(); }
    else flash({ type: "error", msg: res.error || "Publish failed." });
  };

  return (
    <section className="mt-12 border-t border-ink/10 pt-8">
      <EditorHeader
        title="🖼 Blog Hero Banner"
        subtitle="Full-width banner at the top of the blog page. Save Draft keeps changes private; Publish updates the live page."
        status={h.enabled ? "published" : "draft"}
        busy={busy}
        toast={toast}
        onSave={saveDraft}
        onPublish={publish}
        saveLabel="Save draft"
        publishLabel="Publish"
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_minmax(320px,520px)]">
        {/* ---- fields ---- */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
            <label className="flex items-center justify-between gap-4">
              <span>
                <span className="block font-display text-base font-semibold">Show hero banner</span>
                <span className="text-xs text-muted">When off, the blog page shows no hero.</span>
              </span>
              <button type="button" role="switch" aria-checked={h.enabled} onClick={() => set({ enabled: !h.enabled })}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${h.enabled ? "bg-primary" : "bg-ink/20"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${h.enabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </label>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Banner image</h2>
            <p className="text-xs text-muted">Large background image. Leave empty to use a gradient. Auto-optimized to WebP on upload.</p>
            <div className="mt-3">
              <ImagePicker value={h.image || null} onChange={(u) => set({ image: u || "" })} alt={false} />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Image alt (SEO)"><input className="input" value={h.imageAlt} onChange={(e) => set({ imageAlt: e.target.value })} /></Field>
              <Field label="Image title"><input className="input" value={h.imageTitle} onChange={(e) => set({ imageTitle: e.target.value })} /></Field>
              <Field label="Image caption"><input className="input" value={h.imageCaption} onChange={(e) => set({ imageCaption: e.target.value })} /></Field>
              <Field label="Image description"><input className="input" value={h.imageDescription} onChange={(e) => set({ imageDescription: e.target.value })} /></Field>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Text</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Badge"><input className="input" value={h.badge} onChange={(e) => set({ badge: e.target.value })} placeholder="INSIGHTS" /></Field>
              <Field label="Heading"><input className="input" value={h.heading} onChange={(e) => set({ heading: e.target.value })} placeholder="The Blog" /></Field>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Appearance</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Content alignment (desktop)">
                <select className="input" value={h.align} onChange={(e) => set({ align: e.target.value as BlogHero["align"] })}>
                  <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
                </select>
              </Field>
              <Field label="Hero height (desktop, px)">
                <input type="number" min={240} max={900} className="input" value={h.height} onChange={(e) => set({ height: Math.max(240, parseInt(e.target.value || "560", 10)) })} />
              </Field>
              <Field label="Border radius (bottom, px)">
                <input type="number" min={0} max={64} className="input" value={h.borderRadius} onChange={(e) => set({ borderRadius: Math.max(0, parseInt(e.target.value || "0", 10)) })} />
              </Field>
              <Field label={`Overlay opacity — ${h.overlayOpacity}%`}>
                <input type="range" min={0} max={100} value={h.overlayOpacity} onChange={(e) => set({ overlayOpacity: parseInt(e.target.value, 10) })} className="w-full" />
              </Field>
              <Field label="Overlay color">
                <div className="flex items-center gap-2">
                  <input type="color" value={h.overlayColor || "#0a0e1a"} onChange={(e) => set({ overlayColor: e.target.value })} className="h-9 w-12 cursor-pointer rounded border border-ink/10" />
                  <input className="input" value={h.overlayColor} onChange={(e) => set({ overlayColor: e.target.value })} placeholder="#0a0e1a" />
                </div>
              </Field>
            </div>
          </section>
        </div>

        {/* ---- live preview (shared component → matches the live page) ---- */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Live preview</span>
            <div className="flex gap-1">
              {(Object.keys(DEVICE_W) as Device[]).map((d) => (
                <button key={d} onClick={() => setDevice(d)} className={`rounded-md px-2 py-1 text-[11px] font-medium capitalize ${device === d ? "bg-primary/10 text-primary" : "text-muted hover:text-ink"}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-base">
            <div className="mx-auto transition-all" style={{ width: DEVICE_W[device], maxWidth: "100%" }}>
              {h.enabled ? (
                <BlogHeroBanner hero={h} />
              ) : (
                <div className="p-10 text-center text-xs text-muted">Hero is hidden.</div>
              )}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">Rendered with the same component as the live page. Switch device to check responsiveness.</p>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
