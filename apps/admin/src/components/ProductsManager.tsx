"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductSection, PricingPlan, ProductFaq, ProductAbout, ProductFeature, ProductStat } from "@jhb/shared/products";
import type { InternalPage } from "@jhb/shared/service-pages";
import { PRODUCT_DEFAULTS } from "@jhb/shared/products";
import { saveProducts } from "@/app/actions";
import ImagePicker from "./ImagePicker";
import RichEditor from "./RichEditor";

type Toast = { type: "success" | "error"; msg: string } | null;
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `p-${Date.now()}`);

function blank(): Product {
  return { ...PRODUCT_DEFAULTS, id: uid(), title: "", slug: "", sections: [], pricing: [], faqs: [] };
}

export default function ProductsManager({
  initial,
  internalPages = [],
  focusSlug,
  section = "all",
}: {
  initial: Product[];
  internalPages?: InternalPage[];
  focusSlug?: string;
  section?: "all" | "product" | "about";
}) {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>(initial);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [openId, setOpenId] = useState<string | null>(initial[0]?.id ?? null);

  const flash = (t: Toast) => { setToast(t); setTimeout(() => setToast(null), 3500); };
  const set = (i: number, patch: Partial<Product>) => setItems((p) => p.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const add = () => { const b = blank(); setItems((p) => [...p, b]); setOpenId(b.id); };
  const remove = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const move = (i: number, d: number) => setItems((p) => { const to = i + d; if (to < 0 || to >= p.length) return p; const n = [...p]; const [m] = n.splice(i, 1); n.splice(to, 0, m); return n; });

  const save = async () => {
    const cleaned = items.map((p, i) => ({ ...p, slug: slugify(p.slug || p.title), sortOrder: i }));
    setBusy(true);
    const res = await saveProducts({ items: cleaned } as unknown as Record<string, unknown>);
    setBusy(false);
    if (res.ok) { setItems(cleaned); flash({ type: "success", msg: "Products saved & live." }); router.refresh(); }
    else flash({ type: "error", msg: res.error || "Save failed." });
  };

  return (
    <div>
      {toast && <div className={`fixed right-6 top-6 z-[60] rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>}

      {(() => {
        const fp = focusSlug ? items.find((p) => p.slug === focusSlug) : null;
        const heading = focusSlug
          ? section === "about"
            ? `About ${fp?.title ?? "Product"}`
            : fp?.title ?? "Product"
          : "JHB Products";
        return (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {focusSlug && (
                <p className="text-xs text-muted">
                  JHB Products › <span className="text-ink">{heading}</span>
                </p>
              )}
              <h1 className="mt-0.5 font-display text-2xl font-bold sm:text-3xl">{heading}</h1>
              <p className="mt-1 text-sm text-muted">
                {focusSlug
                  ? "Edit this module — content, images, word links, SEO and publish status. Saves go live instantly."
                  : "Manage products shown in the website's JHB Products dropdown. Saves go live instantly."}
              </p>
            </div>
            <button onClick={save} disabled={busy} className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button>
          </div>
        );
      })()}

      <div className="mt-6 space-y-4">
        {items.map((p, i) => {
          if (focusSlug && p.slug !== focusSlug) return null;
          const open = focusSlug ? true : openId === p.id;
          return (
            <section key={p.id} className="rounded-2xl border border-ink/10 bg-surface shadow-soft">
              {!focusSlug && (
                <div className="flex items-center justify-between gap-2 p-4">
                  <button onClick={() => setOpenId(open ? null : p.id)} className="flex flex-1 items-center gap-2 text-left">
                    <span className="text-muted">{open ? "▾" : "▸"}</span>
                    <span className="font-semibold">{p.title || "Untitled product"}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{p.status}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↑</button>
                    <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↓</button>
                    <button onClick={() => { if (confirm("Delete this product?")) remove(i); }} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
                  </div>
                </div>
              )}

              {open && (
                <div className={`space-y-4 p-5 ${focusSlug ? "" : "border-t border-ink/10"}`}>
                  {section !== "about" && (
                  <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Product title" value={p.title} onChange={(v) => set(i, { title: v })} />
                    <Field label="Slug (URL)" value={p.slug} onChange={(v) => set(i, { slug: v })} placeholder="auto from title" />
                  </div>
                  <Field label="Hero highlight (gradient phrase, optional)" value={p.highlight} onChange={(v) => set(i, { highlight: v })} />
                  <div>
                    <span className="mb-1 block text-xs font-medium text-muted">Hero description (rich text — select a word, click 🔗 to link)</span>
                    <RichEditor value={p.description} onChange={(html) => set(i, { description: html })} internalPages={internalPages} />
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-medium text-muted">Overview / main content (rich text — supports word links)</span>
                    <RichEditor value={p.overview} onChange={(html) => set(i, { overview: html })} internalPages={internalPages} />
                  </div>
                  <Field label="Link / URL override (optional)" value={p.href} onChange={(v) => set(i, { href: v })} placeholder="e.g. /jhb-automation-tools — leave empty to use the /products/{slug} page" />
                  {p.href?.trim() && (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      This product is a <b>nav link</b> to <b>{p.href}</b> — the rich content below (hero/overview/sections/pricing/FAQ) isn&apos;t shown for it. Edit that page&apos;s content in its own module (e.g. <b>JHB Automation Tools</b> in the sidebar).
                    </p>
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="mb-1 block text-xs font-medium text-muted">Featured image</span>
                      <ImagePicker value={p.image} onChange={(u) => set(i, { image: u })} alt={false} />
                    </div>
                    <Field label="Image alt text" value={p.imageAlt} onChange={(v) => set(i, { imageAlt: v })} />
                  </div>

                  {/* Feature sections */}
                  <SectionsEditor sections={p.sections} onChange={(sections) => set(i, { sections })} />

                  {/* Pricing */}
                  <PricingEditor plans={p.pricing} onChange={(pricing) => set(i, { pricing })} />

                  {/* FAQs */}
                  <FaqsEditor faqs={p.faqs} onChange={(faqs) => set(i, { faqs })} />

                  {/* SEO */}
                  <p className="pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">SEO</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Meta title" value={p.metaTitle} onChange={(v) => set(i, { metaTitle: v })} />
                    <Field label="Meta description" value={p.metaDescription} onChange={(v) => set(i, { metaDescription: v })} />
                    <Field label="OG title" value={p.ogTitle} onChange={(v) => set(i, { ogTitle: v })} />
                    <Field label="OG description" value={p.ogDescription} onChange={(v) => set(i, { ogDescription: v })} />
                    <Field label="OG image URL" value={p.ogImage} onChange={(v) => set(i, { ogImage: v })} />
                    <Field label="Canonical URL" value={p.canonical} onChange={(v) => set(i, { canonical: v })} placeholder="defaults to /products/{slug}" />
                  </div>

                  <Toggle label="Published (visible in nav)" checked={p.status === "published"} onChange={(v) => set(i, { status: v ? "published" : "draft" })} />
                  </>
                  )}

                  {/* About sub-page */}
                  {section !== "product" && (
                    <AboutEditor about={p.about} onChange={(about) => set(i, { about })} internalPages={internalPages} />
                  )}
                </div>
              )}
            </section>
          );
        })}
        {!focusSlug && (
          <button onClick={add} className="rounded-lg border border-ink/10 px-4 py-2.5 text-sm font-medium text-muted hover:border-primary hover:text-primary">+ Add product</button>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={busy} className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button>
      </div>
    </div>
  );
}

/* ---------- nested editors ---------- */

function SectionsEditor({ sections, onChange }: { sections: ProductSection[]; onChange: (s: ProductSection[]) => void }) {
  const upd = (i: number, patch: Partial<ProductSection>) => onChange(sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const item = (si: number, ii: number, patch: Partial<{ title: string; desc: string }>) =>
    upd(si, { items: sections[si].items.map((it, idx) => (idx === ii ? { ...it, ...patch } : it)) });
  return (
    <div className="rounded-xl border border-ink/10 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Feature sections</p>
      <div className="mt-2 space-y-3">
        {sections.map((s, si) => (
          <div key={si} className="rounded-lg border border-ink/10 bg-base/50 p-3">
            <div className="flex gap-2">
              <input value={s.title} onChange={(e) => upd(si, { title: e.target.value })} placeholder="Section title (e.g. Loan Types)" className="input flex-1 font-medium" />
              <button onClick={() => onChange(sections.filter((_, idx) => idx !== si))} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
            </div>
            <input value={s.subtitle} onChange={(e) => upd(si, { subtitle: e.target.value })} placeholder="Section subtitle (optional)" className="input mt-2" />
            <div className="mt-2 space-y-2 border-l border-ink/10 pl-3">
              {s.items.map((it, ii) => (
                <div key={ii} className="rounded border border-ink/10 p-2">
                  <div className="flex gap-2">
                    <input value={it.title} onChange={(e) => item(si, ii, { title: e.target.value })} placeholder="Item title" className="input flex-1" />
                    <button onClick={() => upd(si, { items: s.items.filter((_, idx) => idx !== ii) })} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
                  </div>
                  <input value={it.desc} onChange={(e) => item(si, ii, { desc: e.target.value })} placeholder="Item description" className="input mt-1.5" />
                </div>
              ))}
              <button onClick={() => upd(si, { items: [...s.items, { title: "", desc: "" }] })} className="text-xs font-medium text-primary hover:underline">+ Add item</button>
            </div>
          </div>
        ))}
        <button onClick={() => onChange([...sections, { title: "", subtitle: "", items: [] }])} className="rounded-lg border border-ink/10 px-3 py-1.5 text-sm font-medium text-muted hover:border-primary hover:text-primary">+ Add section</button>
      </div>
    </div>
  );
}

function PricingEditor({ plans, onChange }: { plans: PricingPlan[]; onChange: (p: PricingPlan[]) => void }) {
  const upd = (i: number, patch: Partial<PricingPlan>) => onChange(plans.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  return (
    <div className="rounded-xl border border-ink/10 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Pricing plans</p>
      <div className="mt-2 space-y-3">
        {plans.map((pl, i) => (
          <div key={i} className="rounded-lg border border-ink/10 bg-base/50 p-3">
            <div className="flex gap-2">
              <input value={pl.name} onChange={(e) => upd(i, { name: e.target.value })} placeholder="Plan name" className="input flex-1 font-medium" />
              <button onClick={() => onChange(plans.filter((_, idx) => idx !== i))} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input value={pl.price} onChange={(e) => upd(i, { price: e.target.value })} placeholder="Price (e.g. ₹4,999 or Custom)" className="input" />
              <input value={pl.period} onChange={(e) => upd(i, { period: e.target.value })} placeholder="Period (e.g. /month)" className="input" />
              <input value={pl.ctaLabel} onChange={(e) => upd(i, { ctaLabel: e.target.value })} placeholder="CTA label" className="input" />
              <input value={pl.ctaHref} onChange={(e) => upd(i, { ctaHref: e.target.value })} placeholder="CTA link (e.g. /#contact)" className="input" />
            </div>
            <textarea value={pl.features.join("\n")} onChange={(e) => upd(i, { features: e.target.value.split("\n").map((f) => f.trim()).filter(Boolean) })} placeholder="One feature per line" rows={4} className="input mt-2 resize-none" />
            <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={pl.highlighted} onChange={(e) => upd(i, { highlighted: e.target.checked })} />Highlight as “Most Popular”</label>
          </div>
        ))}
        <button onClick={() => onChange([...plans, { name: "", price: "", period: "", features: [], highlighted: false, ctaLabel: "Get Started", ctaHref: "/#contact" }])} className="rounded-lg border border-ink/10 px-3 py-1.5 text-sm font-medium text-muted hover:border-primary hover:text-primary">+ Add plan</button>
      </div>
    </div>
  );
}

function FaqsEditor({ faqs, onChange }: { faqs: ProductFaq[]; onChange: (f: ProductFaq[]) => void }) {
  const upd = (i: number, patch: Partial<ProductFaq>) => onChange(faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  return (
    <div className="rounded-xl border border-ink/10 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">FAQs</p>
      <div className="mt-2 space-y-2">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-lg border border-ink/10 bg-base/50 p-3">
            <div className="flex gap-2">
              <input value={f.question} onChange={(e) => upd(i, { question: e.target.value })} placeholder="Question" className="input flex-1 font-medium" />
              <button onClick={() => onChange(faqs.filter((_, idx) => idx !== i))} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
            </div>
            <textarea value={f.answer} onChange={(e) => upd(i, { answer: e.target.value })} placeholder="Answer" rows={2} className="input mt-2 resize-none" />
          </div>
        ))}
        <button onClick={() => onChange([...faqs, { question: "", answer: "" }])} className="rounded-lg border border-ink/10 px-3 py-1.5 text-sm font-medium text-muted hover:border-primary hover:text-primary">+ Add FAQ</button>
      </div>
    </div>
  );
}

function ItemsEditor({ label, items, onChange }: { label: string; items: ProductFeature[]; onChange: (v: ProductFeature[]) => void }) {
  const upd = (i: number, patch: Partial<ProductFeature>) => onChange(items.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="rounded border border-ink/10 p-2">
            <div className="flex gap-2">
              <input value={it.title} onChange={(e) => upd(i, { title: e.target.value })} placeholder="Title" className="input flex-1" />
              <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
            </div>
            <input value={it.desc} onChange={(e) => upd(i, { desc: e.target.value })} placeholder="Description" className="input mt-1.5" />
          </div>
        ))}
        <button onClick={() => onChange([...items, { title: "", desc: "" }])} className="text-xs font-medium text-primary hover:underline">+ Add {label.toLowerCase()} item</button>
      </div>
    </div>
  );
}

function StatsEditor({ stats, onChange }: { stats: ProductStat[]; onChange: (v: ProductStat[]) => void }) {
  const upd = (i: number, patch: Partial<ProductStat>) => onChange(stats.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Statistics</p>
      <div className="space-y-2">
        {stats.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input value={s.value} onChange={(e) => upd(i, { value: e.target.value })} placeholder="Value (e.g. 3x)" className="input w-32" />
            <input value={s.label} onChange={(e) => upd(i, { label: e.target.value })} placeholder="Label" className="input flex-1" />
            <button onClick={() => onChange(stats.filter((_, idx) => idx !== i))} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
          </div>
        ))}
        <button onClick={() => onChange([...stats, { value: "", label: "" }])} className="text-xs font-medium text-primary hover:underline">+ Add stat</button>
      </div>
    </div>
  );
}

function AboutEditor({ about, onChange, internalPages = [] }: { about: ProductAbout; onChange: (a: ProductAbout) => void; internalPages?: InternalPage[] }) {
  const set = (patch: Partial<ProductAbout>) => onChange({ ...about, ...patch });
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-ink/10 p-3">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          About Vasool page content
        </span>
        <span className="text-muted">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <Field label="Hero title" value={about.heroTitle} onChange={(v) => set({ heroTitle: v })} />
          <div>
            <span className="mb-1 block text-xs font-medium text-muted">Hero description (rich text — select a word, click 🔗 to link)</span>
            <RichEditor value={about.heroDescription} onChange={(html) => set({ heroDescription: html })} internalPages={internalPages} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Image</span>
              <ImagePicker value={about.image} onChange={(u) => set({ image: u })} alt={false} />
            </div>
            <Field label="Image alt text" value={about.imageAlt} onChange={(v) => set({ imageAlt: v })} />
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-muted">Main content / story (rich text — supports word links)</span>
            <RichEditor value={about.overview} onChange={(html) => set({ overview: html })} internalPages={internalPages} />
          </div>
          <ItemsEditor label="Features" items={about.features} onChange={(features) => set({ features })} />
          <ItemsEditor label="Benefits" items={about.benefits} onChange={(benefits) => set({ benefits })} />
          <StatsEditor stats={about.stats} onChange={(stats) => set({ stats })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="CTA heading" value={about.ctaHeading} onChange={(v) => set({ ctaHeading: v })} />
            <Field label="CTA button label" value={about.ctaButtonLabel} onChange={(v) => set({ ctaButtonLabel: v })} />
            <Field label="CTA text" value={about.ctaText} onChange={(v) => set({ ctaText: v })} />
            <Field label="CTA button link" value={about.ctaButtonHref} onChange={(v) => set({ ctaButtonHref: v })} />
          </div>
          <p className="pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">About — SEO</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Meta title" value={about.metaTitle} onChange={(v) => set({ metaTitle: v })} />
            <Field label="Meta description" value={about.metaDescription} onChange={(v) => set({ metaDescription: v })} />
            <Field label="OG title" value={about.ogTitle} onChange={(v) => set({ ogTitle: v })} />
            <Field label="OG description" value={about.ogDescription} onChange={(v) => set({ ogDescription: v })} />
            <Field label="OG image URL" value={about.ogImage} onChange={(v) => set({ ogImage: v })} />
            <Field label="Canonical URL" value={about.canonical} onChange={(v) => set({ canonical: v })} />
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, textarea, placeholder }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input resize-none" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input" />
      )}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <button type="button" onClick={() => onChange(!checked)} className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-primary" : "bg-ink/20"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
      <span className="text-muted">{label}</span>
    </label>
  );
}
