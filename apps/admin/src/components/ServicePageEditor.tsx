"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  extractHrefs,
  type InternalPage,
  type ServicePage,
  type ServicePagePayload,
  type ServiceStatus,
} from "@jhb/shared/service-pages";
import { saveServicePage, checkServiceLinks } from "@/app/actions";
import RichEditor from "./RichEditor";
import ImagePicker from "./ImagePicker";
import LocalDateTime from "./LocalDateTime";
import WhyChooseEditor from "./WhyChooseEditor";

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
}: {
  page: ServicePage;
  internalPages: InternalPage[];
}) {
  const [form, setForm] = useState<ServicePagePayload>({
    slug: page.slug,
    meta_title: page.meta_title,
    meta_description: page.meta_description,
    meta_keywords: page.meta_keywords,
    hero_heading: page.hero_heading,
    hero_description: page.hero_description,
    hero_link: page.hero_link,
    features: page.features,
    faq: page.faq,
    why_choose: page.why_choose,
    cta: page.cta,
    image_url: page.image_url,
    image_alt: page.image_alt,
    image_title: page.image_title,
    status: page.status,
  });

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(page.content_updated_at);
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

  const save = async (status?: ServiceStatus) => {
    setSaving(true);
    const payload: ServicePagePayload = { ...form, status: status ?? form.status };
    const res = await saveServicePage(page.key, payload);
    setSaving(false);
    if (res.ok) {
      setSavedAt(res.savedAt ?? new Date().toISOString());
      if (status) set("status", status);
    } else flash({ type: "error", msg: res.error || "Save failed." });
    return res.ok;
  };

  // autosave (debounced) — skips the initial render
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => void save(), 1600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

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

  const savedLabel = saving ? (
    "Saving…"
  ) : savedAt ? (
    <LocalDateTime value={savedAt} mode="time" prefix="Saved " fallback="Saved" />
  ) : (
    "Not saved yet"
  );

  // ---- feature list helpers ----
  const setFeature = (i: number, k: "title" | "desc" | "link" | "linkText", v: string) =>
    set("features", form.features.map((f, idx) => (idx === i ? { ...f, [k]: v } : f)));
  const moveFeature = (from: number, to: number) => {
    if (to < 0 || to >= form.features.length) return;
    const n = [...form.features];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m);
    set("features", n);
  };

  return (
    // On xl, fill <main>'s height and let the two columns scroll independently
    // (top bar fixed, grid flex-1). Below xl it's a normal block that flows.
    <div className="xl:flex xl:h-full xl:flex-col">
      {toast && (
        <div
          className={`fixed right-6 top-6 z-[60] rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* top bar */}
      <div className="flex flex-wrap items-center gap-3 xl:shrink-0">
        <Link href="/service-pages" className="text-sm text-muted hover:text-ink">← Service Pages</Link>
        <h1 className="font-display text-xl font-bold sm:text-2xl">{page.title}</h1>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            form.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          {form.status === "published" ? "Published" : "Draft"}
        </span>
        <span className="ml-auto text-xs text-muted">{savedLabel}</span>
        <button onClick={() => save()} disabled={saving} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-60">
          Save draft
        </button>
        {form.status === "published" ? (
          <button onClick={() => save("draft")} disabled={saving} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:text-ink disabled:opacity-60">
            Unpublish
          </button>
        ) : (
          <button onClick={() => save("published")} disabled={saving} className="btn btn-primary !px-5 !py-2 !text-sm disabled:opacity-60">
            Publish
          </button>
        )}
      </div>

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

          <Section title="Hero">
            <Field label="Hero heading">
              <input value={form.hero_heading} onChange={(e) => set("hero_heading", e.target.value)} className="input" />
            </Field>
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
            <Field label="Service image">
              <ImagePicker value={form.image_url} onChange={(u) => set("image_url", u)} alt={false} />
            </Field>
            <Field label="Image alt text">
              <input value={form.image_alt ?? ""} onChange={(e) => set("image_alt", e.target.value)} className="input" placeholder="Describe the image for SEO & accessibility" />
            </Field>
            <Field label="Image title (optional, SEO)">
              <input value={form.image_title ?? ""} onChange={(e) => set("image_title", e.target.value)} className="input" placeholder="Title attribute shown on hover" />
            </Field>
          </Section>

          <Section title="Container list">
            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="rounded-xl border border-ink/10 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-muted">Container {i + 1}</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveFeature(i, i - 1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↑</button>
                      <button onClick={() => moveFeature(i, i + 1)} disabled={i === form.features.length - 1} className="grid h-8 w-8 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↓</button>
                      <button onClick={() => set("features", form.features.filter((_, idx) => idx !== i))} className="grid h-8 w-8 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="mb-1 block text-[11px] font-medium text-muted">Title (rich text — select a word, click 🔗 to link)</span>
                    <RichEditor value={f.title} onChange={(html) => setFeature(i, "title", html)} internalPages={internalPages} />
                  </div>
                  <div className="mt-2">
                    <span className="mb-1 block text-[11px] font-medium text-muted">Description (rich text — supports word links)</span>
                    <RichEditor value={f.desc} onChange={(html) => setFeature(i, "desc", html)} internalPages={internalPages} />
                  </div>
                </div>
              ))}
              <button onClick={() => set("features", [...form.features, { title: "", desc: "", link: "", linkText: "" }])} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary">
                + Add container
              </button>
            </div>
          </Section>

          <Section title="CTA section">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="CTA heading"><input value={form.cta.heading} onChange={(e) => set("cta", { ...form.cta, heading: e.target.value })} className="input" /></Field>
              <Field label="Button label"><input value={form.cta.button_label} onChange={(e) => set("cta", { ...form.cta, button_label: e.target.value })} className="input" /></Field>
              <Field label="CTA text"><input value={form.cta.text} onChange={(e) => set("cta", { ...form.cta, text: e.target.value })} className="input" /></Field>
              <Field label="Button URL"><input value={form.cta.button_href} onChange={(e) => set("cta", { ...form.cta, button_href: e.target.value })} className="input" /></Field>
            </div>
          </Section>

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

          <Section title="Why Choose Us">
            <WhyChooseEditor
              value={form.why_choose}
              onChange={(v) => set("why_choose", v)}
            />
          </Section>
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
                  {form.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.image_url}
                      alt={form.image_alt ?? ""}
                      {...(form.image_title ? { title: form.image_title } : {})}
                      className="mb-4 aspect-[16/9] w-full rounded-xl object-cover"
                    />
                  )}
                  <h2 className="font-display text-2xl font-bold">
                    {form.hero_link ? (
                      <a href={form.hero_link} className="text-primary underline">{form.hero_heading || page.title}</a>
                    ) : (
                      form.hero_heading || page.title
                    )}
                  </h2>
                  {form.hero_description && (
                    <div
                      className="prose-jhb mt-2 text-sm text-muted [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                      dangerouslySetInnerHTML={{ __html: form.hero_description }}
                    />
                  )}
                  {form.features.length > 0 && (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {form.features.filter((f) => f.title).map((f, i) => (
                        <div key={i} className="rounded-xl border border-ink/10 p-3">
                          <div
                            className="text-sm font-semibold [&_p]:m-0 [&_a]:text-primary [&_a]:underline"
                            dangerouslySetInnerHTML={{ __html: f.title }}
                          />
                          <div
                            className="mt-1 text-xs text-muted [&_p]:m-0 [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                            dangerouslySetInnerHTML={{ __html: f.desc }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {(form.cta.heading || form.cta.button_label) && (
                    <div className="mt-5 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 p-5 text-center">
                      <p className="font-display text-lg font-bold">{form.cta.heading}</p>
                      <p className="mt-1 text-xs text-muted">{form.cta.text}</p>
                      {form.cta.button_label && <span className="btn btn-primary mt-3 !py-2 !text-xs">{form.cta.button_label}</span>}
                    </div>
                  )}
                  {form.faq.filter((q) => q.question).length > 0 && (
                    <div className="mt-5 space-y-2">
                      {form.faq.filter((q) => q.question).map((q, i) => (
                        <div key={i} className="rounded-xl border border-ink/10 p-3">
                          <p className="text-sm font-semibold">{q.question}</p>
                          <div className="mt-1 text-xs text-muted [&_a]:text-primary [&_a]:underline [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4" dangerouslySetInnerHTML={{ __html: q.answer }} />
                        </div>
                      ))}
                    </div>
                  )}
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
