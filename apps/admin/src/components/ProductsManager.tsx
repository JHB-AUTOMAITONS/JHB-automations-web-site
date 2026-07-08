"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductSection, PricingPlan, ProductFaq, ProductAbout, ProductFeature, ProductStat } from "@jhb/shared/products";
import type { InternalPage } from "@jhb/shared/service-pages";
import { PRODUCT_DEFAULTS } from "@jhb/shared/products";
import { saveProductsDraft, publishProducts } from "@/app/actions";
import { withTimeout, actionErrorMessage } from "@/lib/asyncAction";
import ImagePicker from "./ImagePicker";
import RichEditor from "./RichEditor";
import EditorHeader from "./EditorHeader";
import { useContainerSlots } from "@/lib/usePageContainers";
import { PageContainersView } from "@jhb/shared/container-view";
import FaqAccordionView from "@jhb/shared/faq-accordion-view";

// Native sections of the live product detail page, in order (zone after each).
const PRODUCT_SECTIONS = [
  { label: "Hero", zone: "after-hero" },
  { label: "Overview", zone: "after-overview" },
  { label: "Feature sections", zone: "after-sections" },
  { label: "Pricing", zone: "after-pricing" },
  { label: "FAQ", zone: "after-faq" },
  { label: "Call to Action", zone: "bottom" },
];

// Native sections of the live About sub-page, in order (zone after each).
const ABOUT_SECTIONS = [
  { label: "Hero", zone: "after-hero" },
  { label: "Overview", zone: "after-overview" },
  { label: "Stats", zone: "after-stats" },
  { label: "Features", zone: "after-features" },
  { label: "Benefits", zone: "after-benefits" },
  { label: "Call to Action", zone: "bottom" },
];

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
  initialStatus = "draft",
}: {
  initial: Product[];
  internalPages?: InternalPage[];
  focusSlug?: string;
  section?: "all" | "product" | "about";
  initialStatus?: "draft" | "published";
}) {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>(initial);
  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [status, setStatus] = useState<"draft" | "published">(initialStatus);
  const [toast, setToast] = useState<Toast>(null);
  const [openId, setOpenId] = useState<string | null>(initial[0]?.id ?? null);
  const [showPreview, setShowPreview] = useState(true);

  const flash = (t: Toast) => { setToast(t); setTimeout(() => setToast(null), 3500); };
  const set = (i: number, patch: Partial<Product>) => setItems((p) => p.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const add = () => { const b = blank(); setItems((p) => [...p, b]); setOpenId(b.id); };
  const remove = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));
  const move = (i: number, d: number) => setItems((p) => { const to = i + d; if (to < 0 || to >= p.length) return p; const n = [...p]; const [m] = n.splice(i, 1); n.splice(to, 0, m); return n; });

  const cleaned = () => items.map((p, i) => ({ ...p, slug: slugify(p.slug || p.title), sortOrder: i }));

  const saveDraft = async () => {
    if (busy) return;
    const c = cleaned();
    setBusy("save");
    try {
      const res = await withTimeout(saveProductsDraft({ items: c } as unknown as Record<string, unknown>));
      if (res.ok) { setItems(c); setStatus("draft"); flash({ type: "success", msg: "Draft saved." }); }
      else flash({ type: "error", msg: res.error || "Save failed." });
    } catch (e) {
      flash({ type: "error", msg: actionErrorMessage(e, "Save failed. Please try again.") });
    } finally {
      setBusy("");
    }
  };

  const publish = async () => {
    if (busy) return;
    const c = cleaned();
    setBusy("publish");
    try {
      const res = await withTimeout(publishProducts({ items: c } as unknown as Record<string, unknown>));
      if (res.ok) { setItems(c); setStatus("published"); flash({ type: "success", msg: "Published! Live on the website." }); router.refresh(); }
      else flash({ type: "error", msg: res.error || "Publish failed." });
    } catch (e) {
      flash({ type: "error", msg: actionErrorMessage(e, "Publish failed. Please try again.") });
    } finally {
      setBusy("");
    }
  };

  const fp = focusSlug ? items.find((p) => p.slug === focusSlug) : null;
  const heading = focusSlug
    ? section === "about"
      ? `About ${fp?.title ?? "Product"}`
      : fp?.title ?? "Product"
    : "JHB Products";

  // The product whose live preview is shown: the focused one, else the open one.
  const previewProduct = focusSlug ? fp : items.find((p) => p.id === openId) ?? null;
  // Live preview is available everywhere now — the About sub-page mirrors its own
  // page, the product pages mirror the detail page (each with its container zones).
  const showSide = showPreview;

  return (
    <div>
      <EditorHeader
        title={heading}
        subtitle={
          focusSlug
            ? "Edit content, images, word links, SEO and publish status."
            : "Manage products shown in the website's JHB Products dropdown."
        }
        status={status}
        busy={busy}
        toast={toast}
        onSave={saveDraft}
        onPublish={publish}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((s) => !s)}
      />

      <div className={`mt-6 grid gap-6 ${showSide ? "xl:grid-cols-[1fr_440px]" : ""}`}>
        <div className="space-y-4">
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
                <ProductBody
                  product={p}
                  section={section}
                  focusSlug={focusSlug}
                  internalPages={internalPages}
                  onPatch={(patch) => set(i, patch)}
                />
              )}
            </section>
          );
        })}
        {!focusSlug && (
          <button onClick={add} className="rounded-lg border border-ink/10 px-4 py-2.5 text-sm font-medium text-muted hover:border-primary hover:text-primary">+ Add product</button>
        )}
        </div>

        {/* ---- Live preview ---- */}
        {showSide && (
          <div className="xl:sticky xl:top-6 xl:h-fit">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Live preview (draft)
            </div>
            {previewProduct ? (
              section === "about" ? (
                <AboutPreview product={previewProduct} />
              ) : (
                <ProductPreview product={previewProduct} />
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-muted">
                Open a product above to preview it.
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

/* ---- one product's editor body — same inline "Add Container" experience as the Home Page ---- */
function ProductBody({
  product: p,
  section,
  focusSlug,
  internalPages,
  onPatch,
}: {
  product: Product;
  section: "all" | "product" | "about";
  focusSlug?: string;
  internalPages: InternalPage[];
  onPatch: (patch: Partial<Product>) => void;
}) {
  // Controlled "Add Container" engine — containers live on the product itself
  // (single source of truth in `items`), exactly mirroring the Home Page editor.
  const cb = useContainerSlots(
    p.containers ?? [],
    (next) => onPatch({ containers: next(p.containers ?? []) }),
    PRODUCT_SECTIONS,
  );
  // Same engine for the About sub-page — its own containers live on `p.about`.
  const aboutCb = useContainerSlots(
    p.about.containers ?? [],
    (next) => onPatch({ about: { ...p.about, containers: next(p.about.containers ?? []) } }),
    ABOUT_SECTIONS,
  );

  return (
    <div className={`space-y-4 p-5 ${focusSlug ? "" : "border-t border-ink/10"}`}>
      {section !== "about" && (
        <>
          {cb.slot("top")}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Product title" value={p.title} onChange={(v) => onPatch({ title: v })} />
            <Field label="Slug (URL)" value={p.slug} onChange={(v) => onPatch({ slug: v })} placeholder="auto from title" />
          </div>
          <Field label="Hero highlight (gradient phrase, optional)" value={p.highlight} onChange={(v) => onPatch({ highlight: v })} />
          <div>
            <span className="mb-1 block text-xs font-medium text-muted">Hero description (rich text — select a word, click 🔗 to link)</span>
            <RichEditor value={p.description} onChange={(html) => onPatch({ description: html })} internalPages={internalPages} />
          </div>
          <Field label="Link / URL override (optional)" value={p.href} onChange={(v) => onPatch({ href: v })} placeholder="e.g. /jhb-automation-tools — leave empty to use the /products/{slug} page" />
          {p.href?.trim() && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              This product is a <b>nav link</b> to <b>{p.href}</b> — the rich content below (hero/overview/sections/pricing/FAQ) isn&apos;t shown for it. Edit that page&apos;s content in its own module (e.g. <b>JHB Automation Tools</b> in the sidebar).
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Featured image</span>
              <ImagePicker value={p.image} onChange={(u) => onPatch({ image: u })} alt={false} />
            </div>
            <Field label="Image alt text" value={p.imageAlt} onChange={(v) => onPatch({ imageAlt: v })} />
          </div>

          {cb.slot("after-hero")}

          <div>
            <span className="mb-1 block text-xs font-medium text-muted">Overview / main content (rich text — supports word links)</span>
            <RichEditor value={p.overview} onChange={(html) => onPatch({ overview: html })} internalPages={internalPages} />
          </div>

          {cb.slot("after-overview")}

          {/* Feature sections */}
          <SectionsEditor sections={p.sections} onChange={(sections) => onPatch({ sections })} internalPages={internalPages} />

          {cb.slot("after-sections")}

          {/* Pricing */}
          <PricingEditor plans={p.pricing} onChange={(pricing) => onPatch({ pricing })} />

          {cb.slot("after-pricing")}

          {/* FAQs */}
          <FaqsEditor faqs={p.faqs} onChange={(faqs) => onPatch({ faqs })} internalPages={internalPages} />

          {cb.slot("after-faq")}

          {/* SEO */}
          <p className="pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted">SEO</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Meta title" value={p.metaTitle} onChange={(v) => onPatch({ metaTitle: v })} />
            <Field label="Meta description" value={p.metaDescription} onChange={(v) => onPatch({ metaDescription: v })} />
            <Field label="OG title" value={p.ogTitle} onChange={(v) => onPatch({ ogTitle: v })} />
            <Field label="OG description" value={p.ogDescription} onChange={(v) => onPatch({ ogDescription: v })} />
            <Field label="OG image URL" value={p.ogImage} onChange={(v) => onPatch({ ogImage: v })} />
            <Field label="Canonical URL" value={p.canonical} onChange={(v) => onPatch({ canonical: v })} placeholder="defaults to /products/{slug}" />
          </div>

          <Toggle label="Published (visible in nav)" checked={p.status === "published"} onChange={(v) => onPatch({ status: v ? "published" : "draft" })} />

          {cb.slot("bottom")}
          {cb.modal}
        </>
      )}

      {/* About sub-page */}
      {section !== "product" && (
        <AboutEditor
          about={p.about}
          onChange={(about) => onPatch({ about })}
          internalPages={internalPages}
          slot={aboutCb.slot}
          modal={aboutCb.modal}
        />
      )}
    </div>
  );
}

/* ---- live preview (mirrors /products/[slug], interleaving page-builder zones) ---- */
function ProductPreview({ product: p }: { product: Product }) {
  const containers = p.containers ?? [];
  // A product that links elsewhere shows no rich content on its own page.
  if (p.href?.trim()) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 p-8 text-center text-sm text-muted">
        This product is a nav link to <b>{p.href}</b> — it has no detail page of its own.
      </div>
    );
  }
  return (
    <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-ink/10 bg-base shadow-soft xl:max-h-[calc(100vh-10rem)]">
      <PageContainersView containers={containers} zone="top" />

      {/* hero */}
      <div className="bg-surface p-5">
        <span className="eyebrow !text-[10px]">JHB Product</span>
        <h3 className="mt-2 font-display text-lg font-bold leading-tight">
          {p.title || "Untitled product"}
          {p.highlight && <> <span className="grad-text">{p.highlight}</span></>}
        </h3>
        {p.description && (
          <div
            className="prose-jhb mt-2 text-xs text-muted [&_a]:text-primary"
            dangerouslySetInnerHTML={{ __html: p.description }}
          />
        )}
        <span className="btn btn-primary mt-3 !px-4 !py-2 !text-xs">Book a Free Demo</span>
        {p.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt="" className="mt-3 aspect-[4/3] w-full rounded-lg object-cover" />
        )}
      </div>
      <PageContainersView containers={containers} zone="after-hero" />

      {/* overview */}
      {p.overview && (
        <div className="border-t border-ink/10 p-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Overview</p>
          <h4 className="mt-1 font-display text-base font-bold">
            What is <span className="grad-text">{p.title}</span>?
          </h4>
          <div
            className="prose-jhb mt-1 text-[11px] text-muted [&_a]:text-primary"
            dangerouslySetInnerHTML={{ __html: p.overview }}
          />
        </div>
      )}
      <PageContainersView containers={containers} zone="after-overview" />

      {/* feature sections */}
      {p.sections.map((sec, si) => (
        <div key={si} className="border-t border-ink/10 p-5">
          <h4 className="text-center font-display text-base font-bold grad-text">{sec.title}</h4>
          {sec.subtitle && <p className="mt-1 text-center text-[11px] text-muted">{sec.subtitle}</p>}
          {sec.items.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {sec.items.map((it, ii) => (
                <div key={ii} className="rounded-lg border border-ink/10 bg-surface p-2.5">
                  <div className="text-[11px] font-semibold leading-tight [&_p]:m-0 [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: it.title }} />
                  <div className="mt-1 text-[10px] text-muted [&_p]:m-0 [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: it.desc }} />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <PageContainersView containers={containers} zone="after-sections" />

      {/* pricing */}
      {p.pricing.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary">Pricing</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {p.pricing.map((plan, i) => (
              <div key={i} className={`rounded-lg border p-2.5 ${plan.highlighted ? "border-primary bg-gradient-to-br from-primary/10 to-secondary/10" : "border-ink/10 bg-surface"}`}>
                {plan.highlighted && <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-primary">Most Popular</span>}
                <p className="text-[11px] font-semibold">{plan.name}</p>
                <p className="mt-0.5 font-display text-sm font-bold">{plan.price}<span className="text-[10px] font-normal text-muted">{plan.period}</span></p>
                {plan.features.length > 0 && (
                  <ul className="mt-2 space-y-1 border-t border-ink/10 pt-2">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-1.5 text-[10px] text-muted">
                        <span className="mt-0.5 shrink-0 text-primary">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                )}
                {plan.ctaLabel && <span className="mt-2 block text-center text-[10px] font-semibold text-primary">{plan.ctaLabel}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      <PageContainersView containers={containers} zone="after-pricing" />

      {/* faq — same accordion component as the live product page */}
      {p.faqs.filter((f) => f.question).length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <div className="mt-3">
            <FaqAccordionView items={p.faqs} />
          </div>
        </div>
      )}
      <PageContainersView containers={containers} zone="after-faq" />

      {/* cta */}
      <div className="border-t border-ink/10 bg-gradient-to-br from-primary/10 to-secondary/10 p-5 text-center">
        <h4 className="font-display text-base font-bold">
          Ready to try <span className="grad-text">{p.title}</span>?
        </h4>
        <span className="btn btn-primary mt-3 !px-4 !py-2 !text-xs">Book a Free Demo</span>
      </div>
      <PageContainersView containers={containers} zone="bottom" />
    </div>
  );
}

/* ---- live preview of the About sub-page (mirrors /products/[slug]/about) ---- */
function AboutPreview({ product: p }: { product: Product }) {
  const a = p.about;
  const containers = a.containers ?? [];
  return (
    <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-ink/10 bg-base shadow-soft xl:max-h-[calc(100vh-10rem)]">
      <PageContainersView containers={containers} zone="top" />

      {/* hero */}
      <div className="bg-surface p-5">
        <span className="eyebrow !text-[10px]">About</span>
        <h3 className="mt-2 font-display text-lg font-bold leading-tight grad-text">
          {a.heroTitle || `About ${p.title}`}
        </h3>
        {a.heroDescription && (
          <div
            className="prose-jhb mt-2 text-xs text-muted [&_a]:text-primary"
            dangerouslySetInnerHTML={{ __html: a.heroDescription }}
          />
        )}
        {a.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.image} alt="" className="mt-3 aspect-[5/2] w-full rounded-lg border border-ink/10 bg-white object-contain p-3" />
        )}
      </div>
      <PageContainersView containers={containers} zone="after-hero" />

      {/* overview */}
      {a.overview && (
        <div className="border-t border-ink/10 p-5 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Our Story</p>
          <div
            className="prose-jhb mt-1 text-[11px] text-muted [&_a]:text-primary"
            dangerouslySetInnerHTML={{ __html: a.overview }}
          />
        </div>
      )}
      <PageContainersView containers={containers} zone="after-overview" />

      {/* stats */}
      {a.stats.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <div className="grid grid-cols-2 gap-2">
            {a.stats.map((s, i) => (
              <div key={i} className="rounded-lg border border-ink/10 bg-surface p-2.5 text-center">
                <p className="font-display text-base font-bold grad-text">{s.value}</p>
                <p className="mt-0.5 text-[10px] text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <PageContainersView containers={containers} zone="after-stats" />

      {/* features */}
      {a.features.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary">What makes it different</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {a.features.map((f, i) => (
              <div key={i} className="rounded-lg border border-ink/10 bg-surface p-2.5">
                <div className="text-[11px] font-semibold leading-tight [&_p]:m-0 [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: f.title }} />
                <div className="mt-1 text-[10px] text-muted [&_p]:m-0 [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: f.desc }} />
              </div>
            ))}
          </div>
        </div>
      )}
      <PageContainersView containers={containers} zone="after-features" />

      {/* benefits */}
      {a.benefits.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary">The benefits</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {a.benefits.map((b, i) => (
              <div key={i} className="rounded-lg border border-ink/10 bg-surface p-2.5">
                <div className="text-[11px] font-semibold leading-tight [&_p]:m-0 [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: b.title }} />
                <div className="mt-1 text-[10px] text-muted [&_p]:m-0 [&_a]:text-primary" dangerouslySetInnerHTML={{ __html: b.desc }} />
              </div>
            ))}
          </div>
        </div>
      )}
      <PageContainersView containers={containers} zone="after-benefits" />

      {/* cta */}
      <div className="border-t border-ink/10 bg-gradient-to-br from-primary/10 to-secondary/10 p-5 text-center">
        <h4 className="font-display text-base font-bold">{a.ctaHeading || `See ${p.title} in action`}</h4>
        {a.ctaText && <p className="mx-auto mt-1 max-w-xs text-[11px] text-muted">{a.ctaText}</p>}
        <span className="btn btn-primary mt-3 !px-4 !py-2 !text-xs">{a.ctaButtonLabel || "Book a Free Demo"}</span>
      </div>
      <PageContainersView containers={containers} zone="bottom" />
    </div>
  );
}

/* ---------- nested editors ---------- */

function SectionsEditor({ sections, onChange, internalPages = [] }: { sections: ProductSection[]; onChange: (s: ProductSection[]) => void; internalPages?: InternalPage[] }) {
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
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="mb-1 block text-[11px] font-medium text-muted">Card title</span>
                      <RichEditor value={it.title} onChange={(html) => item(si, ii, { title: html })} internalPages={internalPages} minHeight={48} />
                    </div>
                    <button onClick={() => upd(si, { items: s.items.filter((_, idx) => idx !== ii) })} className="mt-6 grid h-9 w-9 shrink-0 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
                  </div>
                  <div className="mt-2">
                    <span className="mb-1 block text-[11px] font-medium text-muted">Card description</span>
                    <RichEditor value={it.desc} onChange={(html) => item(si, ii, { desc: html })} internalPages={internalPages} minHeight={100} />
                  </div>
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

function FaqsEditor({ faqs, onChange, internalPages = [] }: { faqs: ProductFaq[]; onChange: (f: ProductFaq[]) => void; internalPages?: InternalPage[] }) {
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
            <div className="mt-2">
              <RichEditor value={f.answer} onChange={(html) => upd(i, { answer: html })} internalPages={internalPages} />
            </div>
          </div>
        ))}
        <button onClick={() => onChange([...faqs, { question: "", answer: "" }])} className="rounded-lg border border-ink/10 px-3 py-1.5 text-sm font-medium text-muted hover:border-primary hover:text-primary">+ Add FAQ</button>
      </div>
    </div>
  );
}

function ItemsEditor({ label, items, onChange, internalPages = [] }: { label: string; items: ProductFeature[]; onChange: (v: ProductFeature[]) => void; internalPages?: InternalPage[] }) {
  const upd = (i: number, patch: Partial<ProductFeature>) => onChange(items.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="rounded border border-ink/10 p-2">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <span className="mb-1 block text-[11px] font-medium text-muted">Card title</span>
                <RichEditor value={it.title} onChange={(html) => upd(i, { title: html })} internalPages={internalPages} minHeight={48} />
              </div>
              <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="mt-6 grid h-9 w-9 shrink-0 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
            </div>
            <div className="mt-2">
              <span className="mb-1 block text-[11px] font-medium text-muted">Card description</span>
              <RichEditor value={it.desc} onChange={(html) => upd(i, { desc: html })} internalPages={internalPages} minHeight={100} />
            </div>
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

function AboutEditor({
  about,
  onChange,
  internalPages = [],
  slot,
  modal,
}: {
  about: ProductAbout;
  onChange: (a: ProductAbout) => void;
  internalPages?: InternalPage[];
  slot: (zone: string) => ReactNode;
  modal: ReactNode;
}) {
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
          {slot("top")}

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

          {slot("after-hero")}

          <div>
            <span className="mb-1 block text-xs font-medium text-muted">Main content / story (rich text — supports word links)</span>
            <RichEditor value={about.overview} onChange={(html) => set({ overview: html })} internalPages={internalPages} />
          </div>

          {slot("after-overview")}

          <StatsEditor stats={about.stats} onChange={(stats) => set({ stats })} />

          {slot("after-stats")}

          <ItemsEditor label="Features" items={about.features} onChange={(features) => set({ features })} internalPages={internalPages} />

          {slot("after-features")}

          <ItemsEditor label="Benefits" items={about.benefits} onChange={(benefits) => set({ benefits })} internalPages={internalPages} />

          {slot("after-benefits")}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="CTA heading" value={about.ctaHeading} onChange={(v) => set({ ctaHeading: v })} />
            <Field label="CTA button label" value={about.ctaButtonLabel} onChange={(v) => set({ ctaButtonLabel: v })} />
            <Field label="CTA text" value={about.ctaText} onChange={(v) => set({ ctaText: v })} />
            <Field label="CTA button link" value={about.ctaButtonHref} onChange={(v) => set({ ctaButtonHref: v })} />
          </div>

          {slot("bottom")}
          {modal}

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
