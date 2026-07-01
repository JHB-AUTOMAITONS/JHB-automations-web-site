"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ToolsHub, ToolCategory, CrmFeature, HubBenefit, ToolsHubFaq } from "@jhb/shared/tools-hub";
import { TOOLS_HUB_DEFAULT } from "@jhb/shared/tools-hub";
import type { InternalPage } from "@jhb/shared/service-pages";
import type { PageContainer } from "@jhb/shared/containers";
import { saveToolsHub } from "@/app/actions";
import EditorHeader from "./EditorHeader";
import RichEditor from "./RichEditor";
import ImagePicker from "./ImagePicker";
import { usePageContainers } from "@/lib/usePageContainers";
import { PageContainersView } from "@jhb/shared/container-view";
import FaqAccordionView from "@jhb/shared/faq-accordion-view";

// The tools-hub page's native sections in live-render order, each paired with
// the zone that sits AFTER it (matches the <PageContainersView zone> points in
// the public ToolsHubView). The top zone is "top".
const TOOLSHUB_SECTIONS = [
  { label: "Hero", zone: "after-hero" },
  { label: "Tool Categories", zone: "after-categories" },
  { label: "CRM Software", zone: "after-crm" },
  { label: "Other Tools", zone: "after-other-tools" },
  { label: "Benefits", zone: "after-benefits" },
  { label: "FAQ", zone: "after-faq" },
  { label: "Call to Action", zone: "bottom" },
];

type Toast = { type: "success" | "error"; msg: string } | null;

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const n = [...arr];
  const [m] = n.splice(from, 1);
  n.splice(to, 0, m);
  return n;
}

export default function ToolsHubManager({
  initial,
  internalPages = [],
}: {
  initial: ToolsHub;
  internalPages?: InternalPage[];
}) {
  const router = useRouter();
  // Defensive deep-default. The loader shallow-merges the saved doc over the
  // defaults, so a record saved before a nested field existed can arrive with a
  // PARTIAL nested object (e.g. `sections` missing newer keys, or `crm` missing
  // `workflow`/`benefits`). Re-apply the defaults per nested object so every
  // field the editor binds is always defined — no `undefined` inputs, and every
  // section renders & stays editable regardless of the stored shape.
  const [form, setForm] = useState<ToolsHub>(() => ({
    ...TOOLS_HUB_DEFAULT,
    ...initial,
    hero: { ...TOOLS_HUB_DEFAULT.hero, ...initial.hero },
    crm: { ...TOOLS_HUB_DEFAULT.crm, ...initial.crm },
    cta: { ...TOOLS_HUB_DEFAULT.cta, ...initial.cta },
    seo: { ...TOOLS_HUB_DEFAULT.seo, ...initial.seo },
    sections: { ...TOOLS_HUB_DEFAULT.sections, ...initial.sections },
  }));
  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [toast, setToast] = useState<Toast>(null);
  const [showPreview, setShowPreview] = useState(true);

  // Inline "Add Container" engine — same one used on the Home page.
  const cb = usePageContainers(initial.containers ?? [], TOOLSHUB_SECTIONS);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const save = async () => {
    setBusy("publish");
    const res = await saveToolsHub({ ...form, containers: cb.containers } as unknown as Record<string, unknown>);
    setBusy("");
    if (res.ok) {
      flash({ type: "success", msg: "Saved & live." });
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Save failed." });
  };

  // section setters
  const setHero = (k: keyof ToolsHub["hero"], v: string | null) => setForm((p) => ({ ...p, hero: { ...p.hero, [k]: v } }));
  const setCrm = (k: keyof ToolsHub["crm"], v: unknown) => setForm((p) => ({ ...p, crm: { ...p.crm, [k]: v } }));
  const setCta = (k: keyof ToolsHub["cta"], v: string) => setForm((p) => ({ ...p, cta: { ...p.cta, [k]: v } }));
  const setSeo = (k: keyof ToolsHub["seo"], v: string) => setForm((p) => ({ ...p, seo: { ...p.seo, [k]: v } }));
  const setSection = (k: keyof ToolsHub["sections"], v: string) => setForm((p) => ({ ...p, sections: { ...p.sections, [k]: v } }));

  // categories
  const setCat = (i: number, patch: Partial<ToolCategory>) =>
    setForm((p) => ({ ...p, categories: p.categories.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) }));
  const addCat = () =>
    setForm((p) => ({ ...p, categories: [...p.categories, { id: `tool-${p.categories.length + 1}`, title: "", desc: "", icon: "app", image: null }] }));
  const rmCat = (i: number) => setForm((p) => ({ ...p, categories: p.categories.filter((_, idx) => idx !== i) }));
  const moveCat = (i: number, d: number) => setForm((p) => ({ ...p, categories: move(p.categories, i, i + d) }));
  // "Other Automation Tools" cards = the non-CRM categories (the SAME array; the
  // live page renders them in both the Tool Categories grid and the Other Tools
  // section). These reorder/duplicate the non-CRM subset in place: reorder swaps
  // two non-CRM cards by absolute index so the CRM card is never disturbed.
  const moveOther = (absIndex: number, dir: -1 | 1) =>
    setForm((p) => {
      const subset = p.categories.map((_, idx) => idx).filter((idx) => p.categories[idx].id !== "crm");
      const pos = subset.indexOf(absIndex);
      const target = pos + dir;
      if (target < 0 || target >= subset.length) return p;
      const next = [...p.categories];
      const b = subset[target];
      [next[absIndex], next[b]] = [next[b], next[absIndex]];
      return { ...p, categories: next };
    });
  const dupCat = (absIndex: number) =>
    setForm((p) => {
      const copy: ToolCategory = { ...p.categories[absIndex], id: `tool-copy-${p.categories.length + 1}-${Math.round(Math.random() * 1e6)}` };
      return { ...p, categories: [...p.categories.slice(0, absIndex + 1), copy, ...p.categories.slice(absIndex + 1)] };
    });

  // crm features
  const setFeat = (i: number, patch: Partial<CrmFeature>) => setCrm("features", form.crm.features.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const addFeat = () => setCrm("features", [...form.crm.features, { title: "", desc: "" }]);
  const rmFeat = (i: number) => setCrm("features", form.crm.features.filter((_, idx) => idx !== i));

  // crm benefits + workflow (string[])
  const setStr = (key: "benefits" | "workflow", i: number, v: string) => setCrm(key, form.crm[key].map((x, idx) => (idx === i ? v : x)));
  const addStr = (key: "benefits" | "workflow") => setCrm(key, [...form.crm[key], ""]);
  const rmStr = (key: "benefits" | "workflow", i: number) => setCrm(key, form.crm[key].filter((_, idx) => idx !== i));
  const moveStr = (key: "benefits" | "workflow", i: number, d: number) => setCrm(key, move(form.crm[key], i, i + d));

  // hub benefits
  const setBen = (i: number, patch: Partial<HubBenefit>) => setForm((p) => ({ ...p, benefits: p.benefits.map((b, idx) => (idx === i ? { ...b, ...patch } : b)) }));
  const addBen = () => setForm((p) => ({ ...p, benefits: [...p.benefits, { title: "", desc: "" }] }));
  const rmBen = (i: number) => setForm((p) => ({ ...p, benefits: p.benefits.filter((_, idx) => idx !== i) }));

  // faqs
  const setFaq = (i: number, patch: Partial<ToolsHubFaq>) => setForm((p) => ({ ...p, faqs: p.faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) }));
  const addFaq = () => setForm((p) => ({ ...p, faqs: [...p.faqs, { question: "", answer: "" }] }));
  const rmFaq = (i: number) => setForm((p) => ({ ...p, faqs: p.faqs.filter((_, idx) => idx !== i) }));
  const moveFaq = (i: number, d: number) => setForm((p) => ({ ...p, faqs: move(p.faqs, i, i + d) }));

  const WEBSITE = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";
  // Non-CRM tool cards shown in the "Other Automation Tools" section. Keep each
  // card's absolute index in `categories` so edits write back to the shared array.
  const otherCats = form.categories
    .map((c, idx) => ({ c, idx }))
    .filter((x) => x.c.id !== "crm");

  return (
    <div>
      <EditorHeader
        title="JHB Automation Tools"
        subtitle="Edit the tools hub — categories, CRM content, benefits, FAQs & SEO. Saves go live instantly."
        busy={busy}
        toast={toast}
        onPublish={save}
        publishLabel="Save changes"
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((s) => !s)}
        extra={<a href={`${WEBSITE}/jhb-automation-tools`} target="_blank" className="text-xs text-primary hover:underline">Preview ↗</a>}
      />

      <div className={`mt-8 grid gap-6 ${showPreview ? "xl:grid-cols-[1fr_440px]" : ""}`}>
        {/* ---- Editor ---- */}
        <div className="space-y-6">
      {cb.slot("top")}

      {/* Hero */}
      <Card title="Hero Section">
        <Field label="Badge" value={form.hero.badge} onChange={(v) => setHero("badge", v)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Heading" value={form.hero.heading} onChange={(v) => setHero("heading", v)} />
          <Field label="Highlighted phrase" value={form.hero.highlight} onChange={(v) => setHero("highlight", v)} />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-muted">Description</span>
          <RichEditor
            value={form.hero.description}
            onChange={(html) => setHero("description", html)}
            internalPages={internalPages}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="CTA label" value={form.hero.ctaLabel} onChange={(v) => setHero("ctaLabel", v)} />
          <Field label="CTA link" value={form.hero.ctaHref} onChange={(v) => setHero("ctaHref", v)} />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-muted">Hero image (optional)</span>
          <ImagePicker value={form.hero.image} onChange={(u) => setHero("image", u)} alt={false} />
        </div>
      </Card>

      {cb.slot("after-hero")}

      {/* Tool Categories */}
      <Card title="Tool Categories">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Eyebrow" value={form.sections.categoriesEyebrow} onChange={(v) => setSection("categoriesEyebrow", v)} />
          <Field label="Heading" value={form.sections.categoriesHeadingLead} onChange={(v) => setSection("categoriesHeadingLead", v)} />
          <Field label="Highlighted word(s)" value={form.sections.categoriesHeadingHighlight} onChange={(v) => setSection("categoriesHeadingHighlight", v)} />
        </div>
        <div className="space-y-3">
          {form.categories.map((c, i) => (
            <div key={i} className="rounded-xl border border-ink/10 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">#{i + 1}</span>
                <div className="flex gap-1">
                  <button onClick={() => moveCat(i, -1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↑</button>
                  <button onClick={() => moveCat(i, 1)} disabled={i === form.categories.length - 1} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↓</button>
                  <button onClick={() => rmCat(i)} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
                </div>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_120px]">
                <input value={c.title} onChange={(e) => setCat(i, { title: e.target.value })} placeholder="Tool title" className="input" />
                <input value={c.icon} onChange={(e) => setCat(i, { icon: e.target.value })} placeholder="icon key" className="input" title="Icon key: crm, flow, rocket, chat, settings, spark, app, code, cart, doc, search" />
              </div>
              <textarea value={c.desc} onChange={(e) => setCat(i, { desc: e.target.value })} placeholder="Short description" rows={2} className="input mt-2 resize-none" />
              <div className="mt-2">
                <ImagePicker value={c.image} onChange={(u) => setCat(i, { image: u })} alt={false} />
              </div>
            </div>
          ))}
          <button onClick={addCat} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary">+ Add tool category</button>
        </div>
      </Card>

      {cb.slot("after-categories")}

      {/* CRM content */}
      <Card title="CRM Software Section">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Section eyebrow" value={form.sections.crmEyebrow} onChange={(v) => setSection("crmEyebrow", v)} />
          <Field label="CRM heading" value={form.crm.heading} onChange={(v) => setCrm("heading", v)} />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-muted">CRM overview (rich text — supports links)</span>
          <RichEditor value={form.crm.overviewHtml} onChange={(html) => setCrm("overviewHtml", html)} internalPages={internalPages} />
        </div>

        <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted">CRM features</p>
        <div className="space-y-2">
          {form.crm.features.map((f, i) => (
            <div key={i} className="rounded-xl border border-ink/10 p-3">
              <div className="flex gap-2">
                <input value={f.title} onChange={(e) => setFeat(i, { title: e.target.value })} placeholder="Feature title" className="input flex-1" />
                <button onClick={() => rmFeat(i)} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
              </div>
              <textarea value={f.desc} onChange={(e) => setFeat(i, { desc: e.target.value })} placeholder="Feature description" rows={2} className="input mt-2 resize-none" />
            </div>
          ))}
          <button onClick={addFeat} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary">+ Add CRM feature</button>
        </div>

        <Field label="Workflow sub-heading" value={form.sections.crmWorkflowHeading} onChange={(v) => setSection("crmWorkflowHeading", v)} />
        <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted">CRM workflow steps</p>
        <StrList items={form.crm.workflow} onChange={(i, v) => setStr("workflow", i, v)} onAdd={() => addStr("workflow")} onRemove={(i) => rmStr("workflow", i)} onMove={(i, d) => moveStr("workflow", i, d)} placeholder="Workflow step" addLabel="+ Add step" />

        <Field label="Benefits sub-heading" value={form.sections.crmBenefitsHeading} onChange={(v) => setSection("crmBenefitsHeading", v)} />
        <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted">CRM benefits</p>
        <StrList items={form.crm.benefits} onChange={(i, v) => setStr("benefits", i, v)} onAdd={() => addStr("benefits")} onRemove={(i) => rmStr("benefits", i)} onMove={(i, d) => moveStr("benefits", i, d)} placeholder="Benefit" addLabel="+ Add benefit" />
      </Card>

      {cb.slot("after-crm")}

      {/* Other Automation Tools — heading + the non-CRM tool cards. These cards
          are the same `categories` the Tool Categories grid uses; the live page
          shows them in both places, so editing here updates both instantly. */}
      <Card title="Other Automation Tools">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Eyebrow" value={form.sections.otherToolsEyebrow} onChange={(v) => setSection("otherToolsEyebrow", v)} />
          <Field label="Heading (Lead)" value={form.sections.otherToolsHeadingLead} onChange={(v) => setSection("otherToolsHeadingLead", v)} />
          <Field label="Heading (Highlight)" value={form.sections.otherToolsHeadingHighlight} onChange={(v) => setSection("otherToolsHeadingHighlight", v)} />
        </div>
        <p className="-mt-1 text-[11px] text-muted">
          These are the non-CRM tool cards. They also appear in the Tool Categories grid above — edits stay in sync, exactly like the live page renders them in both places.
        </p>
        <div className="space-y-3">
          {otherCats.map(({ c, idx }, pos) => (
            <div key={c.id} className="rounded-xl border border-ink/10 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">#{pos + 1}</span>
                <div className="flex gap-1">
                  <button onClick={() => moveOther(idx, -1)} disabled={pos === 0} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30" title="Move up">↑</button>
                  <button onClick={() => moveOther(idx, 1)} disabled={pos === otherCats.length - 1} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30" title="Move down">↓</button>
                  <button onClick={() => dupCat(idx)} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs hover:border-primary hover:text-primary" title="Duplicate">⧉</button>
                  <button onClick={() => rmCat(idx)} className="grid h-7 w-7 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500" title="Delete">✕</button>
                </div>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_120px]">
                <input value={c.title} onChange={(e) => setCat(idx, { title: e.target.value })} placeholder="Tool title" className="input" />
                <input value={c.icon} onChange={(e) => setCat(idx, { icon: e.target.value })} placeholder="icon key" className="input" title="Icon key: crm, flow, rocket, chat, settings, spark, app, code, cart, doc, search" />
              </div>
              <textarea value={c.desc} onChange={(e) => setCat(idx, { desc: e.target.value })} placeholder="Short description" rows={2} className="input mt-2 resize-none" />
              <div className="mt-2">
                <ImagePicker value={c.image} onChange={(u) => setCat(idx, { image: u })} alt={false} />
              </div>
            </div>
          ))}
          <button onClick={addCat} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary">+ Add tool</button>
        </div>
      </Card>

      {/* Hub benefits */}
      <Card title="Benefits Section">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Eyebrow" value={form.sections.benefitsEyebrow} onChange={(v) => setSection("benefitsEyebrow", v)} />
          <Field label="Heading" value={form.sections.benefitsHeadingLead} onChange={(v) => setSection("benefitsHeadingLead", v)} />
          <Field label="Highlighted word(s)" value={form.sections.benefitsHeadingHighlight} onChange={(v) => setSection("benefitsHeadingHighlight", v)} />
        </div>
        <div className="space-y-2">
          {form.benefits.map((b, i) => (
            <div key={i} className="rounded-xl border border-ink/10 p-3">
              <div className="flex gap-2">
                <input value={b.title} onChange={(e) => setBen(i, { title: e.target.value })} placeholder="Benefit title" className="input flex-1" />
                <button onClick={() => rmBen(i)} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
              </div>
              <textarea value={b.desc} onChange={(e) => setBen(i, { desc: e.target.value })} placeholder="Benefit description" rows={2} className="input mt-2 resize-none" />
            </div>
          ))}
          <button onClick={addBen} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary">+ Add benefit</button>
        </div>
      </Card>

      {cb.slot("after-benefits")}

      {/* FAQs */}
      <Card title="FAQ Section">
        <div className="space-y-2">
          {form.faqs.map((f, i) => (
            <div key={i} className="rounded-xl border border-ink/10 p-3">
              <div className="flex gap-2">
                <input value={f.question} onChange={(e) => setFaq(i, { question: e.target.value })} placeholder="Question" className="input flex-1 font-medium" />
                <div className="flex gap-1">
                  <button onClick={() => moveFaq(i, -1)} disabled={i === 0} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↑</button>
                  <button onClick={() => moveFaq(i, 1)} disabled={i === form.faqs.length - 1} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↓</button>
                  <button onClick={() => rmFaq(i)} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
                </div>
              </div>
              <div className="mt-2">
                <RichEditor value={f.answer} onChange={(html) => setFaq(i, { answer: html })} internalPages={internalPages} />
              </div>
            </div>
          ))}
          <button onClick={addFaq} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary">+ Add FAQ</button>
        </div>
      </Card>

      {cb.slot("after-faq")}

      {/* CTA */}
      <Card title="CTA Section">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Heading" value={form.cta.heading} onChange={(v) => setCta("heading", v)} />
          <Field label="Button label" value={form.cta.buttonLabel} onChange={(v) => setCta("buttonLabel", v)} />
          <Field label="Button link" value={form.cta.buttonHref} onChange={(v) => setCta("buttonHref", v)} />
        </div>
        <Field label="Text" value={form.cta.text} onChange={(v) => setCta("text", v)} textarea />
      </Card>

      {cb.slot("bottom")}

      {/* SEO */}
      <Card title="SEO Settings">
        <Field label="Meta title" value={form.seo.metaTitle} onChange={(v) => setSeo("metaTitle", v)} />
        <Field label="Meta description" value={form.seo.metaDescription} onChange={(v) => setSeo("metaDescription", v)} textarea />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Open Graph title" value={form.seo.ogTitle} onChange={(v) => setSeo("ogTitle", v)} />
          <Field label="Open Graph description" value={form.seo.ogDescription} onChange={(v) => setSeo("ogDescription", v)} />
        </div>
      </Card>

      {cb.modal}
        </div>

        {/* ---- Live preview ---- */}
        {showPreview && (
          <div className="xl:sticky xl:top-6 xl:h-fit">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Live preview
            </div>
            <HubPreview hub={form} containers={cb.containers} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- live preview (mirrors ToolsHubView, interleaving page-builder zones) ---- */
function HubPreview({ hub, containers }: { hub: ToolsHub; containers: PageContainer[] }) {
  const others = hub.categories.filter((c) => c.id !== "crm");
  const s = hub.sections;
  return (
    <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-ink/10 bg-base shadow-soft xl:max-h-[calc(100vh-10rem)]">
      <PageContainersView containers={containers} zone="top" />

      {/* hero */}
      <div className="bg-surface p-5 text-center">
        <span className="eyebrow !text-[10px]">{hub.hero.badge}</span>
        <h3 className="mt-2 font-display text-lg font-bold leading-tight">
          {hub.hero.heading} <span className="grad-text">{hub.hero.highlight}</span>
        </h3>
        <div
          className="prose-jhb mt-2 text-xs text-muted [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: hub.hero.description }}
        />
        {hub.hero.ctaLabel && <span className="btn btn-primary mt-3 !px-4 !py-2 !text-xs">{hub.hero.ctaLabel}</span>}
        {hub.hero.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hub.hero.image} alt="" className="mt-3 aspect-[16/9] w-full rounded-lg object-cover" />
        )}
      </div>
      <PageContainersView containers={containers} zone="after-hero" />

      {/* tool categories */}
      <div className="border-t border-ink/10 p-5">
        {s.categoriesEyebrow && (
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary">{s.categoriesEyebrow}</p>
        )}
        {(s.categoriesHeadingLead || s.categoriesHeadingHighlight) && (
          <h4 className="mt-1 text-center font-display text-sm font-bold">
            {s.categoriesHeadingLead} <span className="grad-text">{s.categoriesHeadingHighlight}</span>
          </h4>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {hub.categories.map((c, i) => (
            <div key={i} className="rounded-lg border border-ink/10 bg-surface p-2.5">
              <p className="text-[11px] font-semibold leading-tight">{c.title}</p>
              <p className="mt-1 text-[10px] text-muted">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <PageContainersView containers={containers} zone="after-categories" />

      {/* CRM software */}
      <div className="border-t border-ink/10 p-5">
        {s.crmEyebrow && (
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary">{s.crmEyebrow}</p>
        )}
        <h4 className="mt-1 text-center font-display text-base font-bold grad-text">{hub.crm.heading}</h4>
        <div
          className="prose-jhb mt-1 text-center text-[11px] text-muted [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: hub.crm.overviewHtml }}
        />

        {/* CRM features — ALL items, no slice */}
        {hub.crm.features.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {hub.crm.features.map((f, i) => (
              <div key={i} className="rounded-lg border border-ink/10 bg-surface p-2.5">
                <p className="text-[11px] font-semibold leading-tight">{f.title}</p>
                <p className="mt-1 text-[10px] text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* CRM workflow steps */}
        {hub.crm.workflow.length > 0 && (
          <div className="mt-4">
            {s.crmWorkflowHeading && (
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">{s.crmWorkflowHeading}</p>
            )}
            <ol className="space-y-1.5">
              {hub.crm.workflow.map((step, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg border border-ink/10 bg-surface px-2.5 py-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">{i + 1}</span>
                  <span className="text-[11px]">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* CRM benefits */}
        {hub.crm.benefits.length > 0 && (
          <div className="mt-4">
            {s.crmBenefitsHeading && (
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">{s.crmBenefitsHeading}</p>
            )}
            <ul className="space-y-1.5">
              {hub.crm.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-2 rounded-lg border border-ink/10 bg-surface px-2.5 py-2 text-[11px]">
                  <span className="shrink-0 text-primary">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <PageContainersView containers={containers} zone="after-crm" />

      {/* other tools */}
      {others.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          {s.otherToolsEyebrow && (
            <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary">{s.otherToolsEyebrow}</p>
          )}
          {(s.otherToolsHeadingLead || s.otherToolsHeadingHighlight) && (
            <h4 className="mt-1 text-center font-display text-sm font-bold">
              {s.otherToolsHeadingLead} <span className="grad-text">{s.otherToolsHeadingHighlight}</span>
            </h4>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {others.map((c, i) => (
              <div key={i} className="rounded-lg border border-ink/10 bg-surface p-2.5">
                <p className="text-[11px] font-semibold leading-tight">{c.title}</p>
                <p className="mt-1 text-[10px] text-muted">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <PageContainersView containers={containers} zone="after-other-tools" />

      {/* benefits */}
      {hub.benefits.length > 0 && (
        <div className="border-t border-ink/10 p-5">
          {s.benefitsEyebrow && (
            <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary">{s.benefitsEyebrow}</p>
          )}
          {(s.benefitsHeadingLead || s.benefitsHeadingHighlight) && (
            <h4 className="mt-1 text-center font-display text-sm font-bold">
              {s.benefitsHeadingLead} <span className="grad-text">{s.benefitsHeadingHighlight}</span>
            </h4>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {hub.benefits.map((b, i) => (
              <div key={i} className="rounded-lg border border-ink/10 bg-surface p-2.5">
                <p className="text-[11px] font-semibold leading-tight">{b.title}</p>
                <p className="mt-1 text-[10px] text-muted">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <PageContainersView containers={containers} zone="after-benefits" />

      {/* faq — same accordion component as the live tools hub */}
      {hub.faqs.filter((f) => f.question).length > 0 && (
        <div className="border-t border-ink/10 p-5">
          <p className="text-center text-[10px] font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <div className="mt-3">
            <FaqAccordionView items={hub.faqs} />
          </div>
        </div>
      )}
      <PageContainersView containers={containers} zone="after-faq" />

      {/* cta */}
      <div className="border-t border-ink/10 bg-gradient-to-br from-primary/10 to-secondary/10 p-5 text-center">
        <h4 className="font-display text-base font-bold">{hub.cta.heading}</h4>
        <p className="mt-1 text-[11px] text-muted">{hub.cta.text}</p>
        {hub.cta.buttonLabel && <span className="btn btn-primary mt-3 !px-4 !py-2 !text-xs">{hub.cta.buttonLabel}</span>}
      </div>
      <PageContainersView containers={containers} zone="bottom" />
    </div>
  );
}

/* ---- helpers ---- */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {textarea ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="input resize-none" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className="input" />
      )}
    </label>
  );
}

function StrList({
  items,
  onChange,
  onAdd,
  onRemove,
  onMove,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (i: number, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onMove: (i: number, d: number) => void;
  placeholder: string;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input value={v} onChange={(e) => onChange(i, e.target.value)} placeholder={placeholder} className="input flex-1" />
          <button onClick={() => onMove(i, -1)} disabled={i === 0} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↑</button>
          <button onClick={() => onMove(i, 1)} disabled={i === items.length - 1} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↓</button>
          <button onClick={() => onRemove(i)} className="grid h-9 w-9 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
        </div>
      ))}
      <button onClick={onAdd} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary">{addLabel}</button>
    </div>
  );
}
