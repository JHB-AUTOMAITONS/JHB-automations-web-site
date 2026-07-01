"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ToolsHub, ToolCategory, CrmFeature, HubBenefit, ToolsHubFaq } from "@jhb/shared/tools-hub";
import type { InternalPage } from "@jhb/shared/service-pages";
import { saveToolsHub } from "@/app/actions";
import RichEditor from "./RichEditor";
import ImagePicker from "./ImagePicker";

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
  const [form, setForm] = useState<ToolsHub>(initial);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const save = async () => {
    setBusy(true);
    const res = await saveToolsHub(form as unknown as Record<string, unknown>);
    setBusy(false);
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

  // categories
  const setCat = (i: number, patch: Partial<ToolCategory>) =>
    setForm((p) => ({ ...p, categories: p.categories.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) }));
  const addCat = () =>
    setForm((p) => ({ ...p, categories: [...p.categories, { id: `tool-${p.categories.length + 1}`, title: "", desc: "", icon: "app", image: null }] }));
  const rmCat = (i: number) => setForm((p) => ({ ...p, categories: p.categories.filter((_, idx) => idx !== i) }));
  const moveCat = (i: number, d: number) => setForm((p) => ({ ...p, categories: move(p.categories, i, i + d) }));

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

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed right-6 top-6 z-[60] rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">JHB Automation Tools</h1>
          <p className="mt-1 text-sm text-muted">Edit the tools hub — categories, CRM content, benefits, FAQs &amp; SEO. Saves go live instantly.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`${WEBSITE}/jhb-automation-tools`} target="_blank" className="text-xs text-primary hover:underline">Preview ↗</a>
          <button onClick={save} disabled={busy} className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button>
        </div>
      </div>

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

      {/* Tool Categories */}
      <Card title="Tool Categories">
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

      {/* CRM content */}
      <Card title="CRM Software Section">
        <Field label="CRM heading" value={form.crm.heading} onChange={(v) => setCrm("heading", v)} />
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

        <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted">CRM workflow steps</p>
        <StrList items={form.crm.workflow} onChange={(i, v) => setStr("workflow", i, v)} onAdd={() => addStr("workflow")} onRemove={(i) => rmStr("workflow", i)} onMove={(i, d) => moveStr("workflow", i, d)} placeholder="Workflow step" addLabel="+ Add step" />

        <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-muted">CRM benefits</p>
        <StrList items={form.crm.benefits} onChange={(i, v) => setStr("benefits", i, v)} onAdd={() => addStr("benefits")} onRemove={(i) => rmStr("benefits", i)} onMove={(i, d) => moveStr("benefits", i, d)} placeholder="Benefit" addLabel="+ Add benefit" />
      </Card>

      {/* Hub benefits */}
      <Card title="Benefits Section">
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

      {/* CTA */}
      <Card title="CTA Section">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Heading" value={form.cta.heading} onChange={(v) => setCta("heading", v)} />
          <Field label="Button label" value={form.cta.buttonLabel} onChange={(v) => setCta("buttonLabel", v)} />
          <Field label="Button link" value={form.cta.buttonHref} onChange={(v) => setCta("buttonHref", v)} />
        </div>
        <Field label="Text" value={form.cta.text} onChange={(v) => setCta("text", v)} textarea />
      </Card>

      {/* SEO */}
      <Card title="SEO Settings">
        <Field label="Meta title" value={form.seo.metaTitle} onChange={(v) => setSeo("metaTitle", v)} />
        <Field label="Meta description" value={form.seo.metaDescription} onChange={(v) => setSeo("metaDescription", v)} textarea />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Open Graph title" value={form.seo.ogTitle} onChange={(v) => setSeo("ogTitle", v)} />
          <Field label="Open Graph description" value={form.seo.ogDescription} onChange={(v) => setSeo("ogDescription", v)} />
        </div>
      </Card>

      <div className="flex justify-end">
        <button onClick={save} disabled={busy} className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">{busy ? "Saving…" : "Save changes"}</button>
      </div>
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
