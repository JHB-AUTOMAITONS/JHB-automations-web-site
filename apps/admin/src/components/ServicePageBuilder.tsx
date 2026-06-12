"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ServiceSections, Testimonial } from "@jhb/shared/service-page";
import {
  saveService,
  saveServiceSections,
  publishServiceSections,
  saveServiceFaqs,
} from "@/app/actions";
import RichText from "./RichText";
import ImagePicker from "./ImagePicker";

type Faq = { question: string; answer: string };

type Stat = { value: string; label: string };
type Toast = { type: "success" | "error"; msg: string } | null;
type Device = "desktop" | "tablet" | "mobile";

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export default function ServicePageBuilder(props: {
  serviceKey: string;
  title: string;
  icon: string;
  stats: Stat[];
  initialSlug: string;
  initialMetaTitle: string;
  initialMetaDescription: string;
  initialMetaKeywords: string;
  initialSections: ServiceSections;
  initialFaqs: Faq[];
}) {
  const router = useRouter();

  const [s, setS] = useState<ServiceSections>(props.initialSections);
  const [faqs, setFaqs] = useState<Faq[]>(props.initialFaqs);
  const [autosave, setAutosave] = useState<"idle" | "saving" | "saved">("idle");
  const [slug, setSlug] = useState(props.initialSlug);
  const [metaTitle, setMetaTitle] = useState(props.initialMetaTitle);
  const [metaDesc, setMetaDesc] = useState(props.initialMetaDescription);
  const [keywords, setKeywords] = useState(props.initialMetaKeywords);

  const [tab, setTab] = useState<"sections" | "seo">("sections");
  const [device, setDevice] = useState<Device>("desktop");
  const [busy, setBusy] = useState<"" | "draft" | "publish">("");
  const [toast, setToast] = useState<Toast>(null);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  // generic section field setter
  const set = <K extends keyof ServiceSections>(
    section: K,
    patch: Partial<ServiceSections[K]>
  ) => setS((p) => ({ ...p, [section]: { ...p[section], ...patch } }));

  // Autosave the section draft 1.5s after the last change
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setAutosave("saving");
    const t = setTimeout(async () => {
      await saveServiceSections(
        props.serviceKey,
        s as unknown as Record<string, unknown>
      );
      setAutosave("saved");
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);

  const saveFaqs = async () => {
    await saveServiceFaqs(props.serviceKey, faqs);
    flash({ type: "success", msg: "FAQs saved." });
    router.refresh();
  };

  const persistDraft = async () => {
    const metaRes = await saveService(props.serviceKey, {
      slug,
      meta_title: metaTitle,
      meta_description: metaDesc,
      meta_keywords: keywords,
    });
    if (!metaRes.ok) return { ok: false, error: metaRes.error };
    if (metaRes.slug) setSlug(metaRes.slug);
    const secRes = await saveServiceSections(
      props.serviceKey,
      s as unknown as Record<string, unknown>
    );
    return secRes;
  };

  const onSaveDraft = async () => {
    setBusy("draft");
    const res = await persistDraft();
    setBusy("");
    if (res.ok) {
      flash({ type: "success", msg: "Draft saved." });
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Save failed." });
  };

  const onPublish = async () => {
    setBusy("publish");
    const res = await persistDraft();
    if (!res.ok) {
      setBusy("");
      return flash({ type: "error", msg: res.error || "Save failed." });
    }
    const pub = await publishServiceSections(props.serviceKey, slug);
    setBusy("");
    if (pub.ok) {
      flash({ type: "success", msg: "Published! Live on the site." });
      router.refresh();
    } else flash({ type: "error", msg: pub.error || "Publish failed." });
  };

  // ---- SEO score ----
  const seo = useMemo(() => {
    const recs: string[] = [];
    let score = 0;
    if (metaTitle.length >= 30 && metaTitle.length <= 60) score += 25;
    else recs.push("Meta title should be 30–60 characters.");
    if (metaDesc.length >= 70 && metaDesc.length <= 160) score += 25;
    else recs.push("Meta description should be 70–160 characters.");
    if (keywords.trim()) score += 20;
    else recs.push("Add a few target keywords.");
    if (slug.trim()) score += 15;
    else recs.push("Set a URL slug.");
    if (s.hero.heading.trim() && s.hero.subheading.trim()) score += 15;
    else recs.push("Fill the hero heading and subheading.");
    return { score, recs };
  }, [metaTitle, metaDesc, keywords, slug, s.hero]);

  const deviceWidth =
    device === "mobile" ? "max-w-[380px]" : device === "tablet" ? "max-w-[760px]" : "max-w-full";

  return (
    <div>
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => router.push("/services")}
            className="text-sm text-muted transition-colors hover:text-ink"
          >
            ← All services
          </button>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            {props.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1 text-xs text-muted">
            {autosave === "saving"
              ? "Autosaving…"
              : autosave === "saved"
                ? "✓ Draft autosaved"
                : ""}
          </span>
          <a
            href={`${WEBSITE_URL}/services/${slug}`}
            target="_blank"
            className="text-xs text-primary hover:underline"
          >
            View live ↗
          </a>
          <button
            onClick={onSaveDraft}
            disabled={busy !== ""}
            className="btn btn-ghost !px-5 !py-2.5 !text-sm disabled:opacity-60"
          >
            {busy === "draft" ? "Saving…" : "Save draft"}
          </button>
          <button
            onClick={onPublish}
            disabled={busy !== ""}
            className="btn btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60"
          >
            {busy === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {/* tabs */}
      <div className="mt-6 flex gap-1 border-b border-ink/10">
        {(["sections", "seo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "border-b-2 border-primary text-primary"
                : "text-muted hover:text-ink"
            }`}
          >
            {t === "seo" ? "SEO" : "Sections"}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_460px]">
        {/* ---- Editor ---- */}
        <div className="space-y-5">
          {tab === "sections" ? (
            <>
              {/* HERO */}
              <SecCard title="Hero" enabled={s.hero.enabled} onToggle={(v) => set("hero", { enabled: v })}>
                <Field label="Eyebrow" value={s.hero.eyebrow} onChange={(v) => set("hero", { eyebrow: v })} />
                <Field label="Heading" value={s.hero.heading} onChange={(v) => set("hero", { heading: v })} />
                <Field label="Subheading" value={s.hero.subheading} onChange={(v) => set("hero", { subheading: v })} textarea />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="CTA text" value={s.hero.ctaText} onChange={(v) => set("hero", { ctaText: v })} />
                  <Field label="CTA link" value={s.hero.ctaLink} onChange={(v) => set("hero", { ctaLink: v })} />
                </div>
                <ImagePicker label="Hero image (optional)" value={s.hero.image} onChange={(u) => set("hero", { image: u })} />
              </SecCard>

              {/* ABOUT */}
              <SecCard title="About Service" enabled={s.about.enabled} onToggle={(v) => set("about", { enabled: v })}>
                <Field label="Title" value={s.about.title} onChange={(v) => set("about", { title: v })} />
                <div>
                  <span className="mb-1 block text-xs font-medium text-muted">Description</span>
                  <RichText value={s.about.descriptionHtml} onChange={(html) => set("about", { descriptionHtml: html })} />
                </div>
                <ImagePicker label="About image" value={s.about.image} onChange={(u) => set("about", { image: u })} />
              </SecCard>

              {/* BENEFITS */}
              <SecCard title="Benefits / What's Included" enabled={s.benefits.enabled} onToggle={(v) => set("benefits", { enabled: v })}>
                <Field label="Section title" value={s.benefits.title} onChange={(v) => set("benefits", { title: v })} />
                <ListEditor
                  rows={s.benefits.items}
                  onChange={(items) => set("benefits", { items })}
                  fields={["title", "desc"]}
                  placeholders={["Benefit title", "Short description"]}
                  addLabel="+ Add benefit"
                />
              </SecCard>

              {/* PROCESS */}
              <SecCard title="Process / Steps" enabled={s.process.enabled} onToggle={(v) => set("process", { enabled: v })}>
                <Field label="Section title" value={s.process.title} onChange={(v) => set("process", { title: v })} />
                <ListEditor
                  rows={s.process.steps}
                  onChange={(steps) => set("process", { steps })}
                  fields={["title", "desc"]}
                  placeholders={["Step title", "Step description"]}
                  addLabel="+ Add step"
                />
              </SecCard>

              {/* WHY US */}
              <SecCard title="Why Choose Us" enabled={s.whyUs.enabled} onToggle={(v) => set("whyUs", { enabled: v })}>
                <Field label="Title" value={s.whyUs.title} onChange={(v) => set("whyUs", { title: v })} />
                <Field label="Description" value={s.whyUs.description} onChange={(v) => set("whyUs", { description: v })} textarea />
                <StringListEditor
                  values={s.whyUs.features}
                  onChange={(features) => set("whyUs", { features })}
                  placeholder="Feature / advantage"
                  addLabel="+ Add feature"
                />
              </SecCard>

              {/* CTA */}
              <SecCard title="Call to Action" enabled={s.cta.enabled} onToggle={(v) => set("cta", { enabled: v })}>
                <Field label="Heading" value={s.cta.heading} onChange={(v) => set("cta", { heading: v })} />
                <Field label="Description" value={s.cta.description} onChange={(v) => set("cta", { description: v })} textarea />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Button text" value={s.cta.buttonText} onChange={(v) => set("cta", { buttonText: v })} />
                  <Field label="Button link" value={s.cta.buttonLink} onChange={(v) => set("cta", { buttonLink: v })} />
                </div>
              </SecCard>

              {/* CLIENT SHOWCASE */}
              <SecCard title="Client Showcase" enabled={s.clients.enabled} onToggle={(v) => set("clients", { enabled: v })}>
                <Field label="Section title" value={s.clients.title} onChange={(v) => set("clients", { title: v })} />
                <LogoEditor logos={s.clients.logos} onChange={(logos) => set("clients", { logos })} />
              </SecCard>

              {/* TESTIMONIALS */}
              <SecCard title="Testimonials" enabled={s.testimonials.enabled} onToggle={(v) => set("testimonials", { enabled: v })}>
                <Field label="Section title" value={s.testimonials.title} onChange={(v) => set("testimonials", { title: v })} />
                <TestimonialEditor items={s.testimonials.items} onChange={(items) => set("testimonials", { items })} />
              </SecCard>

              {/* FAQ */}
              <SecCard title="FAQ" enabled hideToggle onToggle={() => {}}>
                <FaqEditor faqs={faqs} onChange={setFaqs} onSave={saveFaqs} />
              </SecCard>

              {/* OFFICE */}
              <SecCard title="Office Location" enabled={s.office.enabled} onToggle={(v) => set("office", { enabled: v })}>
                <Field label="Title" value={s.office.title} onChange={(v) => set("office", { title: v })} />
                <Field label="Address" value={s.office.address} onChange={(v) => set("office", { address: v })} textarea />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Phone" value={s.office.phone} onChange={(v) => set("office", { phone: v })} />
                  <Field label="Email" value={s.office.email} onChange={(v) => set("office", { email: v })} />
                </div>
                <Field label="Google Map embed URL" value={s.office.mapEmbedUrl} onChange={(v) => set("office", { mapEmbedUrl: v })} />
                <ImagePicker label="Office image" value={s.office.image} onChange={(u) => set("office", { image: u })} />
              </SecCard>
            </>
          ) : (
            /* ---- SEO TAB ---- */
            <div className="space-y-5">
              <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
                <h2 className="font-display text-lg font-semibold">URL &amp; Meta</h2>
                <div className="mt-4 space-y-4">
                  <Field label="URL slug" value={slug} onChange={setSlug} prefix="/services/" />
                  <Field label="Meta title" value={metaTitle} onChange={setMetaTitle} counter={60} />
                  <Field label="Meta description" value={metaDesc} onChange={setMetaDesc} textarea counter={160} />
                  <Field label="Keywords (comma-separated)" value={keywords} onChange={setKeywords} />
                </div>
              </section>

              <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">SEO Score</h2>
                  <span
                    className={`font-display text-2xl font-bold ${
                      seo.score >= 80 ? "text-green-600" : seo.score >= 50 ? "text-amber-600" : "text-red-500"
                    }`}
                  >
                    {seo.score}/100
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                    style={{ width: `${seo.score}%` }}
                  />
                </div>
                {seo.recs.length > 0 ? (
                  <ul className="mt-4 space-y-2 text-sm text-muted">
                    {seo.recs.map((r) => (
                      <li key={r} className="flex gap-2">
                        <span className="text-amber-500">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-green-600">All checks passed 🎉</p>
                )}
                <div className="mt-4 rounded-xl bg-base p-3 text-xs text-muted">
                  Schema auto-generated for this page: <b>Service</b>, <b>BreadcrumbList</b>,{" "}
                  <b>FAQPage</b> + canonical & Open Graph tags.
                </div>
              </section>
            </div>
          )}
        </div>

        {/* ---- Live preview ---- */}
        <div className="xl:sticky xl:top-6 xl:h-fit">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Live preview
            </span>
            <div className="flex gap-1">
              {(["desktop", "tablet", "mobile"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`rounded-md px-2 py-1 text-xs capitalize ${
                    device === d ? "bg-primary/10 text-primary" : "text-muted hover:text-ink"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-ink/10 bg-base p-3 shadow-soft">
            <div className={`mx-auto ${deviceWidth} transition-all`}>
              <Preview s={s} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function SecCard({
  title,
  enabled,
  onToggle,
  hideToggle,
  children,
}: {
  title: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  hideToggle?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {!hideToggle && <Toggle checked={enabled} onChange={onToggle} />}
      </div>
      {enabled && <div className="mt-5 space-y-4">{children}</div>}
    </section>
  );
}

function LogoEditor({
  logos,
  onChange,
}: {
  logos: string[];
  onChange: (v: string[]) => void;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= logos.length) return;
    const next = [...logos];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {logos.map((logo, i) => (
          <div key={i} className="rounded-xl border border-ink/10 bg-base p-2">
            <div className="grid h-16 place-items-center overflow-hidden rounded-lg bg-surface">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="max-h-12 w-auto object-contain" />
              ) : (
                <span className="text-xl text-muted">🖼</span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-1">
              <ImagePicker value={logo || null} onChange={(u) => onChange(logos.map((x, idx) => (idx === i ? u || "" : x)))} />
              <div className="flex flex-col gap-1">
                <button onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-6 w-6 place-items-center rounded border border-ink/10 text-[10px] disabled:opacity-30">↑</button>
                <button onClick={() => move(i, i + 1)} disabled={i === logos.length - 1} className="grid h-6 w-6 place-items-center rounded border border-ink/10 text-[10px] disabled:opacity-30">↓</button>
              </div>
              <button onClick={() => onChange(logos.filter((_, idx) => idx !== i))} className="grid h-6 w-6 place-items-center rounded border border-ink/10 text-[10px] hover:border-red-300 hover:text-red-500">✕</button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...logos, ""])} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary">
        + Add logo
      </button>
    </div>
  );
}

function TestimonialEditor({
  items,
  onChange,
}: {
  items: Testimonial[];
  onChange: (v: Testimonial[]) => void;
}) {
  const upd = (i: number, patch: Partial<Testimonial>) =>
    onChange(items.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-3">
      {items.map((t, i) => (
        <div key={i} className="rounded-xl border border-ink/10 bg-base p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <input value={t.name} onChange={(e) => upd(i, { name: e.target.value })} placeholder="Customer name" className="rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={t.company} onChange={(e) => upd(i, { company: e.target.value })} placeholder="Company" className="rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <textarea value={t.review} onChange={(e) => upd(i, { review: e.target.value })} placeholder="Review" rows={2} className="mt-2 w-full resize-none rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
          <div className="mt-2 flex items-center justify-between gap-2">
            <ImagePicker label="Photo" value={t.photo} onChange={(u) => upd(i, { photo: u })} />
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="rounded-md border border-ink/10 px-3 py-1.5 text-xs text-muted hover:border-red-300 hover:text-red-500">Delete</button>
          </div>
        </div>
      ))}
      <button onClick={() => onChange([...items, { name: "", company: "", review: "", photo: null }])} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary">
        + Add testimonial
      </button>
    </div>
  );
}

function FaqEditor({
  faqs,
  onChange,
  onSave,
}: {
  faqs: Faq[];
  onChange: (v: Faq[]) => void;
  onSave: () => void;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= faqs.length) return;
    const next = [...faqs];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">
        FAQs save separately (they publish immediately) and generate FAQ schema on the page.
      </p>
      {faqs.map((f, i) => (
        <div key={i} className="rounded-xl border border-ink/10 bg-base p-3">
          <div className="flex items-center gap-2">
            <input value={f.question} onChange={(e) => onChange(faqs.map((x, idx) => (idx === i ? { ...x, question: e.target.value } : x)))} placeholder="Question" className="flex-1 rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm font-medium outline-none focus:border-primary" />
            <button onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↑</button>
            <button onClick={() => move(i, i + 1)} disabled={i === faqs.length - 1} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↓</button>
            <button onClick={() => onChange(faqs.filter((_, idx) => idx !== i))} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
          </div>
          <textarea value={f.answer} onChange={(e) => onChange(faqs.map((x, idx) => (idx === i ? { ...x, answer: e.target.value } : x)))} placeholder="Answer" rows={2} className="mt-2 w-full resize-none rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
      ))}
      <div className="flex items-center gap-2">
        <button onClick={() => onChange([...faqs, { question: "", answer: "" }])} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary">+ Add FAQ</button>
        <button onClick={onSave} className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15">Save FAQs</button>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-ink/20"}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  prefix,
  counter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  prefix?: string;
  counter?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-xs font-medium text-muted">
        <span>{label}</span>
        {counter && <span>{value.length}/{counter}</span>}
      </span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      ) : prefix ? (
        <div className="flex items-center overflow-hidden rounded-xl border border-ink/10 bg-base">
          <span className="px-3 py-2.5 text-sm text-muted">{prefix}</span>
          <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent py-2.5 pr-4 text-sm outline-none" />
        </div>
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary" />
      )}
    </label>
  );
}

type Row = { title: string; desc: string };
function ListEditor({
  rows,
  onChange,
  placeholders,
  addLabel,
}: {
  rows: Row[];
  onChange: (rows: Row[]) => void;
  fields: ["title", "desc"];
  placeholders: [string, string];
  addLabel: string;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return;
    const next = [...rows];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="rounded-xl border border-ink/10 bg-base p-3">
          <div className="flex items-center gap-2">
            <input
              value={r.title}
              onChange={(e) => onChange(rows.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))}
              placeholder={placeholders[0]}
              className="flex-1 rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm font-medium outline-none focus:border-primary"
            />
            <button onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs text-muted disabled:opacity-30">↑</button>
            <button onClick={() => move(i, i + 1)} disabled={i === rows.length - 1} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs text-muted disabled:opacity-30">↓</button>
            <button onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs text-muted hover:border-red-300 hover:text-red-500">✕</button>
          </div>
          <input
            value={r.desc}
            onChange={(e) => onChange(rows.map((x, idx) => (idx === i ? { ...x, desc: e.target.value } : x)))}
            placeholder={placeholders[1]}
            className="mt-2 w-full rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      ))}
      <button onClick={() => onChange([...rows, { title: "", desc: "" }])} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary">
        {addLabel}
      </button>
    </div>
  );
}

function StringListEditor({
  values,
  onChange,
  placeholder,
  addLabel,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={v}
            onChange={(e) => onChange(values.map((x, idx) => (idx === i ? e.target.value : x)))}
            placeholder={placeholder}
            className="flex-1 rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs text-muted hover:border-red-300 hover:text-red-500">✕</button>
        </div>
      ))}
      <button onClick={() => onChange([...values, ""])} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary">
        {addLabel}
      </button>
    </div>
  );
}

function Preview({ s }: { s: ServiceSections }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-surface">
      {s.hero.enabled && (
        <div className="bg-base/60 p-5">
          {s.hero.eyebrow && <span className="eyebrow !text-[10px]">{s.hero.eyebrow}</span>}
          <h3 className="mt-2 font-display text-xl font-bold grad-text">{s.hero.heading}</h3>
          <p className="mt-2 text-xs text-muted line-clamp-3">{s.hero.subheading}</p>
          {s.hero.ctaText && <span className="btn btn-primary mt-3 !px-4 !py-2 !text-xs">{s.hero.ctaText}</span>}
          {s.hero.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.hero.image} alt="" className="mt-3 aspect-video w-full rounded-lg object-cover" />
          )}
        </div>
      )}
      {s.about.enabled && (
        <div className="border-t border-ink/10 p-5">
          <h4 className="font-display text-sm font-bold">{s.about.title}</h4>
          <div className="prose-jhb mt-1 text-xs text-muted" dangerouslySetInnerHTML={{ __html: s.about.descriptionHtml }} />
        </div>
      )}
      {s.benefits.enabled && s.benefits.items.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <h4 className="font-display text-sm font-bold">{s.benefits.title}</h4>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {s.benefits.items.slice(0, 4).map((b, i) => (
              <div key={i} className="rounded-lg bg-base p-2">
                <p className="text-[11px] font-semibold">{b.title}</p>
                <p className="text-[10px] text-muted line-clamp-2">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {s.process.enabled && s.process.steps.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <h4 className="font-display text-sm font-bold">{s.process.title}</h4>
          <ol className="mt-2 space-y-1">
            {s.process.steps.map((st, i) => (
              <li key={i} className="text-[11px] text-muted">
                <b className="grad-text">{String(i + 1).padStart(2, "0")}</b> {st.title}
              </li>
            ))}
          </ol>
        </div>
      )}
      {s.whyUs.enabled && (
        <div className="border-t border-ink/10 p-5">
          <h4 className="font-display text-sm font-bold">{s.whyUs.title}</h4>
          <ul className="mt-2 space-y-1">
            {s.whyUs.features.slice(0, 5).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-[11px] text-muted">
                <span className="grid h-4 w-4 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-[8px] text-white">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
      {s.clients.enabled && s.clients.logos.filter(Boolean).length > 0 && (
        <div className="border-t border-ink/10 p-5 text-center">
          <h4 className="font-display text-sm font-bold">{s.clients.title}</h4>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {s.clients.logos.filter(Boolean).slice(0, 6).map((l, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={l} alt="" className="h-7 w-auto rounded bg-base object-contain p-1" />
            ))}
          </div>
        </div>
      )}
      {s.testimonials.enabled && s.testimonials.items.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <h4 className="font-display text-sm font-bold">{s.testimonials.title}</h4>
          <div className="mt-2 space-y-2">
            {s.testimonials.items.slice(0, 2).map((t, i) => (
              <div key={i} className="rounded-lg bg-base p-2">
                <p className="text-[10px] text-muted line-clamp-2">“{t.review}”</p>
                <p className="mt-1 text-[11px] font-semibold">{t.name}{t.company ? `, ${t.company}` : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {s.office.enabled && (
        <div className="border-t border-ink/10 p-5">
          <h4 className="font-display text-sm font-bold">{s.office.title}</h4>
          <p className="mt-1 whitespace-pre-line text-[11px] text-muted">{s.office.address}</p>
          {s.office.mapEmbedUrl && <p className="mt-1 text-[10px] text-primary">🗺 Map embedded</p>}
        </div>
      )}
      {s.cta.enabled && (
        <div className="border-t border-ink/10 bg-gradient-to-br from-primary/10 to-secondary/10 p-5 text-center">
          <h4 className="font-display text-sm font-bold">{s.cta.heading}</h4>
          <p className="mt-1 text-[11px] text-muted">{s.cta.description}</p>
          {s.cta.buttonText && <span className="btn btn-primary mt-2 !px-4 !py-2 !text-xs">{s.cta.buttonText}</span>}
        </div>
      )}
    </div>
  );
}
