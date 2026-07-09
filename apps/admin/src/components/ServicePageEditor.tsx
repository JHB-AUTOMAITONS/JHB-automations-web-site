"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  extractHrefs,
  seedRelatedServices,
  type InternalPage,
  type RelatedServicesContent,
  type ServiceHeroImage,
  type ServicePage,
  type ServicePagePayload,
  type ServiceStatus,
} from "@jhb/shared/service-pages";
import { smartImgAttrs, stripHeadingTags } from "@jhb/shared/containers";
import { sanitizeRichText } from "@jhb/shared/rich-text";
import { saveServicePage, publishServicePage, checkServiceLinks } from "@/app/actions";
import { withTimeout, actionErrorMessage } from "@/lib/asyncAction";
import RichEditor from "./RichEditor";
import ImagePicker from "./ImagePicker";
import AlignPicker from "./AlignPicker";
import HeadingTagPicker from "./HeadingTagPicker";
import { Heading, type HeadingTag } from "@jhb/shared/heading";
import LocalDateTime from "./LocalDateTime";
import WhatsIncludedEditor from "./WhatsIncludedEditor";
import WhyChooseEditor from "./WhyChooseEditor";
import RelatedServicesEditor, { type ServiceSummary } from "./RelatedServicesEditor";
import { usePageContainers } from "@/lib/usePageContainers";
import { PageContainersView } from "@jhb/shared/container-view";
import { RelatedServicesView } from "@jhb/shared/related-services-view";
import FaqAccordionView from "@jhb/shared/faq-accordion-view";
import EditorHeader from "./EditorHeader";
import AiSeoPanel from "./ai/AiSeoPanel";
import AuthorPublisherEditor from "./AuthorPublisherEditor";

// Native sections of the live service page, in order, each with the zone after it.
const SERVICE_SECTIONS = [
  { label: "Hero", zone: "after-hero" },
  { label: "What's Included", zone: "after-features" },
  { label: "Why Choose Us", zone: "after-whychoose" },
  { label: "FAQ", zone: "after-faq" },
  { label: "Call to Action", zone: "bottom" },
];

type Toast = { type: "success" | "error"; msg: string } | null;
type Device = "desktop" | "tablet" | "mobile";
type LinkResult = { href: string; type: string; ok: boolean; reason: string };

const DEVICE_W: Record<Device, number> = { desktop: 1100, tablet: 768, mobile: 390 };

// If a full URL/path is pasted, keep only the last segment (the slug):
// "https://jhbautomations.com/services/influencer-marketing/" -> "influencer-marketing".
const stripUrl = (raw: string) => {
  let s = raw.trim();
  if (s.includes("/")) {
    s = s.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, "").split(/[?#]/)[0];
    const parts = s.split("/").filter(Boolean);
    if (parts.length) s = parts[parts.length - 1];
  }
  return s;
};
// Slug input helpers: extract from a URL, lowercase, spaces/invalid -> hyphen,
// collapse repeats. A trailing hyphen is kept while typing; full trim on blur
// (and the server normalises again, so storage always matches).
const normalizeSlugInput = (s: string) =>
  stripUrl(s).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+/, "");
const finalizeSlug = (s: string) => normalizeSlugInput(s).replace(/-+$/g, "");

export default function ServicePageEditor({
  page,
  internalPages,
  services = [],
}: {
  page: ServicePage;
  internalPages: InternalPage[];
  services?: ServiceSummary[];
}) {
  const [form, setForm] = useState<ServicePagePayload>({
    slug: page.slug,
    meta_title: page.meta_title,
    meta_description: page.meta_description,
    meta_keywords: page.meta_keywords,
    hero_heading: page.hero_heading,
    hero_highlight: page.hero_highlight,
    hero_tail: page.hero_tail,
    hero_description: page.hero_description,
    hero_link: page.hero_link,
    features: page.features,
    whats_included: page.whats_included,
    faq: page.faq,
    why_choose: page.why_choose,
    cta: page.cta,
    image_url: page.image_url,
    image_alt: page.image_alt,
    image_title: page.image_title,
    containers: page.containers,
    chrome: page.chrome,
    status: page.status,
  });
  const cb = usePageContainers(page.containers, SERVICE_SECTIONS);

  const router = useRouter();
  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  // Live publish status (drives the status pill). Editing never changes it —
  // only Publish does.
  const [liveStatus, setLiveStatus] = useState<ServiceStatus>(page.status);
  // Unpublished-changes flag — enables the Publish button. Seeded from the
  // server (a draft newer than the published content, or a page not yet live).
  const [dirty, setDirty] = useState<boolean>(page.pending_changes ?? page.status !== "published");
  const [savedAt, setSavedAt] = useState<string | null>(page.draft_updated_at ?? page.content_updated_at);
  const [toast, setToast] = useState<Toast>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [linkResults, setLinkResults] = useState<LinkResult[] | null>(null);
  const [checking, setChecking] = useState(false);
  const firstRender = useRef(true);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const set = <K extends keyof ServicePagePayload>(k: K, v: ServicePagePayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Related Services section. The server seeds chrome.related (migrating the old
  // auto cards); this fallback only guards an older row that somehow lacks it.
  const relatedFallback = useMemo(
    () =>
      seedRelatedServices({
        currentKey: page.key,
        chrome: form.chrome,
        services: services.map((s) => ({ key: s.key, title: s.title, icon: s.icon })),
      }),
    // Seed once; edits flow through chrome.related thereafter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page.key],
  );
  const related: RelatedServicesContent = form.chrome.related ?? relatedFallback;
  const setRelated = (v: RelatedServicesContent) => set("chrome", { ...form.chrome, related: v });
  const serviceUrlByKey = useMemo(
    () => Object.fromEntries(services.map((s) => [s.key, `/${s.slug}`])),
    [services],
  );

  const draftPayload = (): ServicePagePayload => ({ ...form, status: liveStatus, containers: cb.containers });

  // Save Draft — persists the working draft only; the live page is untouched.
  // Unpublished changes remain, so Publish stays enabled.
  // try/catch/finally guarantees `busy` is always cleared, so the button can
  // never get stuck on "Saving…" even if the server action throws.
  const saveDraft = async () => {
    if (busy) return; // ignore double-clicks / duplicate requests
    setBusy("save");
    try {
      const res = await withTimeout(saveServicePage(page.key, draftPayload()));
      if (res.ok) {
        setSavedAt(res.savedAt ?? new Date().toISOString());
        flash({ type: "success", msg: "Draft saved." });
        router.refresh();
      } else flash({ type: "error", msg: res.error || "Save failed." });
    } catch (e) {
      flash({ type: "error", msg: actionErrorMessage(e, "Save failed. Please try again.") });
    } finally {
      setBusy("");
    }
  };

  // Publish — save the latest draft, then promote it to the live page (mirrors
  // the Home page: saveHomeDraft → publishHome). Disables Publish until the next edit.
  const publish = async () => {
    if (busy) return; // ignore double-clicks / duplicate requests
    setBusy("publish");
    try {
      const saveRes = await withTimeout(saveServicePage(page.key, draftPayload()));
      if (!saveRes.ok) {
        flash({ type: "error", msg: saveRes.error || "Save failed." });
        return;
      }
      const res = await withTimeout(publishServicePage(page.key));
      if (res.ok) {
        setSavedAt(res.publishedAt ?? new Date().toISOString());
        setLiveStatus("published");
        setDirty(false);
        flash({ type: "success", msg: "Published! Live on the website." });
        router.refresh();
      } else flash({ type: "error", msg: res.error || "Publish failed." });
    } catch (e) {
      flash({ type: "error", msg: actionErrorMessage(e, "Publish failed. Please try again.") });
    } finally {
      setBusy("");
    }
  };

  // Any field/container edit marks the page as having unpublished changes (which
  // re-enables Publish). Skips the initial mount; Save Draft / Publish never
  // touch `form`/`cb.containers`, so they don't trip this.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setDirty(true);
    // Fire on any content/container change; the body intentionally reads neither.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, cb.containers]);

  const runLinkCheck = async () => {
    setChecking(true);
    const res = await checkServiceLinks(form.hero_description, internalPages.map((p) => p.url));
    setChecking(false);
    if (res.ok) setLinkResults(res.results);
  };

  // internal-link suggestions: pages not yet linked in the content
  const suggestions = useMemo(() => {
    const linked = new Set(extractHrefs(form.hero_description).map((h) => h.split("#")[0].split("?")[0]));
    return internalPages.filter((p) => !linked.has(p.url)).slice(0, 6);
  }, [form.hero_description, internalPages]);

  const savedLabel =
    busy === "save" ? (
      "Saving…"
    ) : busy === "publish" ? (
      "Publishing…"
    ) : savedAt ? (
      <LocalDateTime value={savedAt} mode="time" prefix="Saved " fallback="Saved" />
    ) : (
      "Not saved yet"
    );

  // Split hero heading preview — mirrors the live site (lead + gradient highlight
  // + optional tail). Matches ServiceDetail: highlight set → split; else the
  // whole heading stays gradient. Recomputed each render → instant preview.
  const heroPreviewNode = form.hero_highlight ? (
    <>
      {form.hero_heading && <span>{form.hero_heading} </span>}
      <span className="grad-text">{form.hero_highlight}</span>
      {form.hero_tail && <span> {form.hero_tail}</span>}
    </>
  ) : (
    <span className="grad-text">{form.hero_heading || page.title}</span>
  );

  // Effective semantic tags for the native section headings (hero defaults to the
  // page's single H1; sections default to H2). Used for the live render, the
  // preview, and the one-H1 SEO validation below.
  const heroTag: HeadingTag = form.chrome.heroHeadingTag ?? "h1";
  const wiTag: HeadingTag = form.whats_included.headingTag ?? "h2";
  const ctaTag: HeadingTag = form.cta.headingTag ?? "h2";
  const h1Count = [heroTag, wiTag, ctaTag].filter((t) => t === "h1").length;

  // Hero alignment for the preview — mirrors ServiceDetail EXACTLY so the preview
  // matches the live page: the selected alignment controls the heading AND the
  // description together (previously only the heading followed it).
  const heroAlign = form.chrome.heroHeadingAlign ?? "left";
  const heroAlignText = heroAlign === "center" ? "text-center" : heroAlign === "right" ? "text-right" : "";
  const heroAlignBlock = heroAlign === "center" ? "mx-auto" : heroAlign === "right" ? "ml-auto" : "";

  return (
    // On xl, fill <main>'s height and let the two columns scroll independently
    // (top bar fixed, grid flex-1). Below xl it's a normal block that flows.
    <div className="xl:flex xl:h-full xl:flex-col">
      <EditorHeader
        title={page.title}
        backHref="/service-pages"
        backLabel="← Service Pages"
        status={liveStatus}
        busy={busy}
        toast={toast}
        onSave={saveDraft}
        onPublish={publish}
        publishDisabled={!dirty}
        extra={<span className="text-xs text-muted">{savedLabel}</span>}
      />

      {h1Count > 1 && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
          ⚠ This page has {h1Count} headings set to <strong>H1</strong>. A page should have exactly one H1
          (usually the hero) — use H2–H6 for the other sections for better SEO. Saving is not blocked.
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:min-h-0 xl:flex-1 xl:grid-cols-[1fr_440px] xl:overflow-hidden">
        {/* ---- form (own scroll) ---- */}
        <div className="space-y-6 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:pr-2">
          <Section title="SEO & URL">
            <Field label="Service slug (URL)">
              <input
                value={form.slug}
                onChange={(e) => set("slug", normalizeSlugInput(e.target.value))}
                onBlur={(e) => set("slug", finalizeSlug(e.target.value))}
                className="input"
                placeholder="search-engine-optimization"
              />
              <p className="mt-1 text-[11px] text-muted">
                Public path: /{finalizeSlug(form.slug) || "…"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted/80">
                Example: <code>influencer-marketing</code> — enter only the slug, not a full URL.
              </p>
            </Field>
            <Field label="SEO title">
              <input value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} className="input" />
            </Field>
            <Field label="Meta description">
              <textarea value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} rows={2} className="input resize-none" />
            </Field>
            <Field label="Meta keywords">
              <input value={form.meta_keywords} onChange={(e) => set("meta_keywords", e.target.value)} className="input" />
            </Field>
          </Section>

          <AiSeoPanel
            route={`/${finalizeSlug(form.slug) || page.key}`}
            getContext={() => ({
              title: form.meta_title || form.hero_heading,
              contentHtml: form.hero_description,
              focusKeyword: (form.meta_keywords || "").split(",")[0]?.trim() || undefined,
              metaTitle: form.meta_title,
              metaDescription: form.meta_description,
              keywords: form.meta_keywords,
            })}
            onApply={(r) => {
              if (r.seoTitle) set("meta_title", r.seoTitle);
              if (r.metaDescription) set("meta_description", r.metaDescription);
              if (r.metaKeywords) set("meta_keywords", r.metaKeywords);
              else if (r.secondaryKeywords?.length) set("meta_keywords", r.secondaryKeywords.join(", "));
              if (r.contentHtml) set("hero_description", r.contentHtml);
            }}
          />

          <AuthorPublisherEditor path={`/${finalizeSlug(form.slug) || page.key}`} />

          {cb.slot("top")}

          <Section title="Hero">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Heading (Lead)">
                <input value={form.hero_heading} onChange={(e) => set("hero_heading", e.target.value)} className="input" placeholder="What's" />
              </Field>
              <Field label="Heading (Highlight)">
                <input value={form.hero_highlight} onChange={(e) => set("hero_highlight", e.target.value)} className="input" placeholder="Included" />
              </Field>
              <Field label="Heading (Tail)">
                <input value={form.hero_tail} onChange={(e) => set("hero_tail", e.target.value)} className="input" placeholder="(optional)" />
              </Field>
            </div>
            <p className="-mt-1 text-[11px] text-muted">
              The <span className="grad-text font-semibold">Highlight</span> word automatically uses the brand gradient — no formatting needed. Leave Highlight empty to keep the whole heading gradient (legacy style).
            </p>
            <div className="flex flex-wrap items-end gap-4">
              <AlignPicker
                label="Heading alignment"
                value={form.chrome.heroHeadingAlign ?? "left"}
                onChange={(v) => set("chrome", { ...form.chrome, heroHeadingAlign: v })}
              />
              <HeadingTagPicker
                label="Heading tag (SEO)"
                value={form.chrome.heroHeadingTag}
                fallback="h1"
                onChange={(v) => set("chrome", { ...form.chrome, heroHeadingTag: v })}
              />
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-muted">Hero description</span>
              <RichEditor
                value={form.hero_description}
                onChange={(html) => set("hero_description", html)}
                internalPages={internalPages}
              />
            </div>
            <Field label="Word Link (URL)">
              <input
                value={form.hero_link ?? ""}
                onChange={(e) => set("hero_link", e.target.value)}
                className="input"
                placeholder="https://… or /seo (optional) — makes the hero heading a link"
              />
            </Field>
            <div className="rounded-xl border border-ink/10 bg-base p-3">
              <Field label="Service image">
                <ImagePicker
                  value={form.image_url}
                  onChange={(u) => set("image_url", u)}
                  alt={false}
                  settings={form.chrome.heroImage?.settings}
                  onChangeSettings={(settings) =>
                    set("chrome", { ...form.chrome, heroImage: { ...(form.chrome.heroImage ?? {}), settings } })
                  }
                />
              </Field>
              {(() => {
                const hi: ServiceHeroImage = form.chrome.heroImage ?? {};
                const setHi = (patch: Partial<ServiceHeroImage>) =>
                  set("chrome", { ...form.chrome, heroImage: { ...hi, ...patch } });
                return (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap items-end gap-4">
                      <Field label="Hero image style">
                        <select
                          value={hi.mode ?? "tile"}
                          onChange={(e) => setHi({ mode: e.target.value as ServiceHeroImage["mode"] })}
                          className="input"
                        >
                          <option value="tile">Icon tile (default design)</option>
                          <option value="image">Full image (uses the size panel)</option>
                          <option value="hidden">Hidden — content spans full width</option>
                        </select>
                      </Field>
                      {(hi.mode ?? "tile") === "image" && (
                        <AlignPicker
                          label="Image position"
                          value={hi.align ?? "right"}
                          onChange={(v) => setHi({ align: v })}
                        />
                      )}
                    </div>
                    {(hi.mode ?? "tile") === "image" && (
                      <>
                        <div>
                          <span className="mb-1 block text-[11px] font-medium text-muted">Image width presets (or set a custom width in the Size &amp; style panel above)</span>
                          <div className="flex flex-wrap gap-1.5">
                            {["25%", "50%", "75%", "100%"].map((w) => (
                              <button
                                key={w}
                                type="button"
                                onClick={() => setHi({ settings: { ...(hi.settings ?? {}), width: w } })}
                                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                                  hi.settings?.width === w
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-ink/10 text-muted hover:border-primary hover:text-primary"
                                }`}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Image caption (optional)">
                            <input value={hi.caption ?? ""} onChange={(e) => setHi({ caption: e.target.value })} className="input" />
                          </Field>
                          <Field label="Image description (optional)">
                            <input value={hi.description ?? ""} onChange={(e) => setHi({ description: e.target.value })} className="input" />
                          </Field>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Image alt text">
                  <input value={form.image_alt ?? ""} onChange={(e) => set("image_alt", e.target.value)} className="input" placeholder="Describe the image for SEO & accessibility" />
                </Field>
                <Field label="Image title (optional, SEO)">
                  <input value={form.image_title ?? ""} onChange={(e) => set("image_title", e.target.value)} className="input" placeholder="Title attribute shown on hover" />
                </Field>
              </div>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Hero buttons</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Primary button text">
                <input value={form.chrome.heroPrimaryText} onChange={(e) => set("chrome", { ...form.chrome, heroPrimaryText: e.target.value })} className="input" placeholder="Contact Us" />
              </Field>
              <Field label="Primary button URL">
                <input value={form.chrome.heroPrimaryHref} onChange={(e) => set("chrome", { ...form.chrome, heroPrimaryHref: e.target.value })} className="input" placeholder="/#contact" />
              </Field>
              <Field label="Secondary button text">
                <input value={form.chrome.heroSecondaryText} onChange={(e) => set("chrome", { ...form.chrome, heroSecondaryText: e.target.value })} className="input" placeholder="All Services" />
              </Field>
              <Field label="Secondary button URL">
                <input value={form.chrome.heroSecondaryHref} onChange={(e) => set("chrome", { ...form.chrome, heroSecondaryHref: e.target.value })} className="input" placeholder="/services" />
              </Field>
            </div>
          </Section>

          {cb.slot("after-hero")}

          <Section title="What's Included">
            <WhatsIncludedEditor
              value={form.whats_included}
              onChange={(v) => set("whats_included", v)}
              items={form.features}
              onChangeItems={(v) => set("features", v)}
              internalPages={internalPages}
            />
          </Section>

          {cb.slot("after-features")}

          <Section title="Related Services">
            <RelatedServicesEditor
              value={related}
              onChange={setRelated}
              services={services}
              internalPages={internalPages}
            />
          </Section>

          <Section title="CTA section">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="CTA heading">
                <input value={form.cta.heading} onChange={(e) => set("cta", { ...form.cta, heading: e.target.value })} className="input" placeholder={`Ready to get started with ${page.title}?`} />
              </Field>
              <Field label="Button label">
                <input value={form.cta.button_label} onChange={(e) => set("cta", { ...form.cta, button_label: e.target.value })} className="input" placeholder="Contact Us" />
              </Field>
              <Field label="CTA text">
                <input value={form.cta.text} onChange={(e) => set("cta", { ...form.cta, text: e.target.value })} className="input" placeholder="Get in touch and we'll show you exactly how this can drive growth for your business." />
              </Field>
              <Field label="Button URL">
                <input value={form.cta.button_href} onChange={(e) => set("cta", { ...form.cta, button_href: e.target.value })} className="input" placeholder="/#contact" />
              </Field>
            </div>
            <HeadingTagPicker
              label="CTA heading tag (SEO)"
              value={form.cta.headingTag}
              fallback="h2"
              onChange={(v) => set("cta", { ...form.cta, headingTag: v })}
            />
          </Section>

          {cb.slot("bottom")}

          <Section title="FAQ section">
            <div className="space-y-2">
              {form.faq.map((q, i) => (
                <div key={i} className="rounded-xl border border-ink/10 p-3">
                  <div className="flex gap-2">
                    <input value={q.question} onChange={(e) => set("faq", form.faq.map((x, idx) => (idx === i ? { ...x, question: e.target.value } : x)))} placeholder="Question" className="input flex-1" />
                    <button onClick={() => set("faq", form.faq.filter((_, idx) => idx !== i))} className="grid h-8 w-8 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
                  </div>
                  <div className="mt-2">
                    <RichEditor value={q.answer} onChange={(html) => set("faq", form.faq.map((x, idx) => (idx === i ? { ...x, answer: html } : x)))} internalPages={internalPages} />
                  </div>
                </div>
              ))}
              <button onClick={() => set("faq", [...form.faq, { question: "", answer: "" }])} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary">
                + Add FAQ
              </button>
            </div>
          </Section>

          {cb.slot("after-faq")}

          <Section title="Why Choose Us">
            <WhyChooseEditor
              value={form.why_choose}
              onChange={(v) => set("why_choose", v)}
            />
          </Section>

          {cb.slot("after-whychoose")}
          {cb.modal}
        </div>

        {/* ---- preview + SEO (own scroll) ---- */}
        <div className="space-y-5 xl:h-full xl:min-h-0 xl:overflow-y-auto xl:pr-1">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Preview</span>
              <div className="flex gap-1">
                {(["desktop", "tablet", "mobile"] as Device[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium ${device === d ? "bg-primary/10 text-primary" : "text-muted hover:text-ink"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-auto rounded-2xl border border-ink/10 bg-base p-3">
              <div className="mx-auto bg-surface shadow-soft transition-all" style={{ width: DEVICE_W[device], maxWidth: "100%" }}>
                <div className="p-5">
                  <PageContainersView containers={cb.containers} zone="top" />
                  {form.image_url && (form.chrome.heroImage?.mode ?? "tile") !== "hidden" && (() => {
                    const hi = form.chrome.heroImage ?? {};
                    const a = smartImgAttrs(hi.settings, {
                      extraClass: "mb-4 rounded-xl mx-auto",
                      fallbackWidth: (hi.mode ?? "tile") === "image" ? "w-full" : "aspect-[16/9] w-full",
                    });
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.image_url}
                        alt={form.image_alt ?? ""}
                        {...(form.image_title ? { title: form.image_title } : {})}
                        className={a.className}
                        style={a.style}
                      />
                    );
                  })()}
                  <Heading tag={heroTag} fallback="h1" className={`font-display text-2xl font-bold ${heroAlignText}`}>
                    {form.hero_link ? (
                      <a href={form.hero_link} className="transition-opacity hover:opacity-80">{heroPreviewNode}</a>
                    ) : (
                      heroPreviewNode
                    )}
                  </Heading>
                  {form.hero_description && (
                    <div
                      className={`prose-jhb mt-2 max-w-md ${heroAlignBlock} ${heroAlignText} text-sm text-muted [&_a]:text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5`}
                      dangerouslySetInnerHTML={{ __html: sanitizeRichText(form.hero_description) }}
                    />
                  )}
                  <PageContainersView containers={cb.containers} zone="after-hero" />
                  {/* What's Included — chrome + cards */}
                  {form.whats_included.enabled && (
                    <div
                      className={`mt-5 ${
                        form.whats_included.align === "center"
                          ? "text-center"
                          : form.whats_included.align === "right"
                            ? "text-right"
                            : ""
                      }`}
                    >
                      {form.whats_included.badge && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{form.whats_included.badge}</span>
                      )}
                      <Heading tag={wiTag} fallback="h2" className={`font-display text-lg font-bold ${form.whats_included.badge ? "mt-1" : ""}`}>
                        {form.whats_included.heading}{" "}
                        {form.whats_included.highlight && <span className="grad-text">{form.whats_included.highlight}</span>}
                      </Heading>
                      {form.whats_included.description && (
                        <p className="mt-1 text-xs text-muted">{form.whats_included.description}</p>
                      )}
                      {form.features.length > 0 && (
                        <div
                          className={`mt-3 grid gap-3 text-left ${
                            form.whats_included.columns === 1
                              ? ""
                              : form.whats_included.columns === 3
                                ? "sm:grid-cols-3"
                                : "sm:grid-cols-2"
                          }`}
                        >
                          {form.features.filter((f) => f.title || f.image).map((f, i) => (
                            <div key={f.id ?? i} className="rounded-xl border border-ink/10 p-3">
                              <div className="flex items-start gap-2">
                                {f.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={f.image} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                                ) : (
                                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 text-xs font-bold text-primary">
                                    {f.icon ? f.icon : `0${i + 1}`}
                                  </span>
                                )}
                                <div className="min-w-0">
                                  <div
                                    className="text-sm font-semibold [&_p]:m-0 [&_a]:text-primary"
                                    dangerouslySetInnerHTML={{ __html: stripHeadingTags(sanitizeRichText(f.title)) }}
                                  />
                                  <div
                                    className="mt-1 text-xs text-muted [&_p]:m-0 [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(f.desc) }}
                                  />
                                  {f.link && (
                                    <span className="mt-1 inline-block text-xs font-medium text-primary">
                                      {f.linkText || "Learn more"} →
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {form.whats_included.button.label && form.whats_included.button.href && (
                        <div className="mt-3">
                          <span className="btn btn-primary !py-2 !text-xs">{form.whats_included.button.label}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <PageContainersView containers={cb.containers} zone="after-features" />
                  {(form.cta.heading || form.cta.button_label) && (
                    <div className="mt-5 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 p-5 text-center">
                      <Heading tag={ctaTag} fallback="h2" className="font-display text-lg font-bold">{form.cta.heading}</Heading>
                      <p className="mt-1 text-xs text-muted">{form.cta.text}</p>
                      {form.cta.button_label && <span className="btn btn-primary mt-3 !py-2 !text-xs">{form.cta.button_label}</span>}
                    </div>
                  )}
                  {form.faq.filter((q) => q.question).length > 0 && (
                    <div className="mt-5">
                      <FaqAccordionView items={form.faq} />
                    </div>
                  )}
                  <PageContainersView containers={cb.containers} zone="after-faq" />
                  {/* Why Choose Us — one card per enabled container */}
                  {form.why_choose.filter((c) => c.enabled).map((c) => (
                    <div key={c.id} className="mt-5 rounded-2xl border border-ink/10 bg-base p-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          {c.badge && <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{c.badge}</span>}
                          <p className="mt-1 font-display text-base font-bold">
                            {c.heading} <span className="grad-text">{c.highlight}</span>
                          </p>
                          {c.description && <p className="mt-1 text-xs text-muted">{c.description}</p>}
                        </div>
                        <ul className="space-y-2">
                          {c.benefits.filter((b) => b.enabled && (b.title || b.image)).map((b) => (
                            <li key={b.id} className="flex items-start gap-2">
                              {b.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={b.image} alt="" className="h-5 w-5 shrink-0 rounded object-cover" />
                              ) : (
                                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-[9px] font-bold text-white">✓</span>
                              )}
                              <span className="min-w-0">
                                <span className="block text-xs font-medium text-ink/90">{b.title}</span>
                                {b.desc && <span className="block text-[11px] text-muted">{b.desc}</span>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  <PageContainersView containers={cb.containers} zone="after-whychoose" />
                  {/* Related Services — the SAME shared renderer the live page uses,
                      so the preview matches exactly and updates on every edit. */}
                  {related.enabled && (
                    <div
                      className="mt-5"
                      onClickCapture={(e) => {
                        if ((e.target as HTMLElement).closest("a")) e.preventDefault();
                      }}
                    >
                      <RelatedServicesView content={related} serviceUrlByKey={serviceUrlByKey} />
                    </div>
                  )}
                  <PageContainersView containers={cb.containers} zone="bottom" />
                </div>
              </div>
            </div>
          </div>

          {/* SEO panel */}
          <div className="rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Link check & SEO</span>
              <button onClick={runLinkCheck} disabled={checking} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-60">
                {checking ? "Checking…" : "Check links"}
              </button>
            </div>
            {linkResults && (
              <div className="mt-3 space-y-1">
                {linkResults.length === 0 && <p className="text-xs text-muted">No links in content.</p>}
                {linkResults.map((r) => (
                  <div key={r.href} className="flex items-center gap-2 text-xs">
                    <span className={r.ok ? "text-green-600" : "text-red-500"}>{r.ok ? "✓" : "⚠"}</span>
                    <span className="truncate font-medium" title={r.href}>{r.href}</span>
                    <span className="ml-auto shrink-0 text-muted">{r.reason}</span>
                  </div>
                ))}
              </div>
            )}
            {suggestions.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-semibold text-muted">Internal linking suggestions</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <span key={s.url} className="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[10px] text-muted" title={s.url}>
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
      <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-muted">{title}</h2>
      <div className="space-y-3">{children}</div>
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
