"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogArticleHero } from "@jhb/shared/content";
import BlogArticleHeroBanner from "@jhb/shared/blog-article-hero-view";
import { saveBlogArticleHeroDraft, publishBlogArticleHero } from "@/app/actions";
import { withTimeout, actionErrorMessage } from "@/lib/asyncAction";
import EditorHeader from "./EditorHeader";
import ImagePicker from "./ImagePicker";

type Toast = { type: "success" | "error"; msg: string } | null;
type Device = "desktop" | "tablet" | "mobile";
const DEVICE_W: Record<Device, string> = { desktop: "100%", tablet: "768px", mobile: "390px" };

// Sample dynamic content for the preview only — on the live site these come from
// each blog post and are never editable here.
const SAMPLE = {
  title: "Digital Marketing Services for Business Growth & Online Success",
  category: "INSIGHTS",
  author: "JHB Automations",
  dateLabel: "22 Jun 2026",
  readingLabel: "8 min read",
};

export default function BlogArticleHeroEditor({ initial }: { initial: BlogArticleHero }) {
  const router = useRouter();
  const [h, setH] = useState<BlogArticleHero>(initial);
  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [toast, setToast] = useState<Toast>(null);
  const [device, setDevice] = useState<Device>("desktop");

  const set = (patch: Partial<BlogArticleHero>) => setH((p) => ({ ...p, ...patch }));
  const flash = (t: Toast) => { setToast(t); setTimeout(() => setToast(null), 3500); };

  const saveDraft = async () => {
    if (busy) return;
    setBusy("save");
    try {
      const res = await withTimeout(saveBlogArticleHeroDraft(h as unknown as Record<string, unknown>));
      if (res.ok) { flash({ type: "success", msg: "Draft saved — not live yet." }); router.refresh(); }
      else flash({ type: "error", msg: res.error || "Save failed." });
    } catch (e) {
      flash({ type: "error", msg: actionErrorMessage(e, "Save failed. Please try again.") });
    } finally {
      setBusy("");
    }
  };
  const publish = async () => {
    if (busy) return;
    setBusy("publish");
    try {
      const res = await withTimeout(publishBlogArticleHero(h as unknown as Record<string, unknown>));
      if (res.ok) { flash({ type: "success", msg: "Published — live on every blog article." }); router.refresh(); }
      else flash({ type: "error", msg: res.error || "Publish failed." });
    } catch (e) {
      flash({ type: "error", msg: actionErrorMessage(e, "Publish failed. Please try again.") });
    } finally {
      setBusy("");
    }
  };

  return (
    <section className="mt-12 border-t border-ink/10 pt-8">
      <EditorHeader
        title="🖼 Blog Article Hero"
        subtitle="Full-width banner header on every blog article. The title, breadcrumb, author, date and reading time are pulled from each post automatically — only the background and styling are edited here."
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
                <span className="block font-display text-base font-semibold">Show article hero</span>
                <span className="text-xs text-muted">When off, articles show a plain title header (no banner).</span>
              </span>
              <button type="button" role="switch" aria-checked={h.enabled} onClick={() => set({ enabled: !h.enabled })}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${h.enabled ? "bg-primary" : "bg-ink/20"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${h.enabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </label>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Background image</h2>
            <p className="text-xs text-muted">Used only as the page header background. Leave a size empty to fall back to the desktop image; leave all empty for a gradient.</p>
            <div className="mt-3 space-y-4">
              <Field label="Desktop image">
                <ImagePicker value={h.imageDesktop || null} onChange={(u) => set({ imageDesktop: u || "" })} alt={false} />
              </Field>
              <Field label="Tablet image (optional)">
                <ImagePicker value={h.imageTablet || null} onChange={(u) => set({ imageTablet: u || "" })} alt={false} />
              </Field>
              <Field label="Mobile image (optional)">
                <ImagePicker value={h.imageMobile || null} onChange={(u) => set({ imageMobile: u || "" })} alt={false} />
              </Field>
              <Field label="Image alt (SEO)">
                <input className="input" value={h.imageAlt} onChange={(e) => set({ imageAlt: e.target.value })} />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
            <h2 className="font-display text-base font-semibold">Appearance</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Hero height (desktop, px)">
                <input type="number" min={300} max={900} className="input" value={h.height} onChange={(e) => set({ height: Math.max(300, parseInt(e.target.value || "460", 10)) })} />
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

          <section className="rounded-2xl border border-dashed border-ink/15 bg-base p-4">
            <p className="text-xs text-muted">
              <span className="font-semibold text-ink">Automatic from each post:</span> Article Title · Breadcrumb · Badge (category) · Author · Published Date · Reading Time. These are not editable here.
            </p>
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
                <BlogArticleHeroBanner
                  hero={h}
                  title={SAMPLE.title}
                  category={SAMPLE.category}
                  author={SAMPLE.author}
                  dateLabel={SAMPLE.dateLabel}
                  readingLabel={SAMPLE.readingLabel}
                />
              ) : (
                <div className="p-10 text-center text-xs text-muted">Hero is hidden — articles show a plain title header.</div>
              )}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">Sample content shown — real articles use their own title, author and date. Switch device to check responsiveness.</p>
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
