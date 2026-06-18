"use client";

import { useState } from "react";
import { saveAbout } from "@/app/actions";
import { ABOUT_DEFAULT, type AboutDoc, type AboutValue } from "@jhb/shared/about";

export default function AboutManager({ initial }: { initial: AboutDoc }) {
  const [d, setD] = useState<AboutDoc>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const set = (k: keyof AboutDoc) => (v: string) => setD((p) => ({ ...p, [k]: v }));
  const setValue = (i: number, patch: Partial<AboutValue>) =>
    setD((p) => ({ ...p, values: p.values.map((v, idx) => (idx === i ? { ...v, ...patch } : v)) }));
  const addValue = () =>
    setD((p) => ({ ...p, values: [...p.values, { icon: "✨", title: "", desc: "" }] }));
  const removeValue = (i: number) =>
    setD((p) => ({ ...p, values: p.values.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setState("saving");
    setError("");
    const res = await saveAbout(d as unknown as Record<string, unknown>);
    if (res.ok) setState("saved");
    else {
      setState("error");
      setError(res.error || "Error saving");
    }
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <div className="mt-8 space-y-6">
      <Section title="SEO / Meta">
        <Field label="Meta title" value={d.metaTitle} onChange={set("metaTitle")} />
        <Area label="Meta description" value={d.metaDescription} onChange={set("metaDescription")} />
      </Section>

      <Section title="Hero">
        <Field label="Eyebrow" value={d.heroEyebrow} onChange={set("heroEyebrow")} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Title (lead)" value={d.heroTitleLead} onChange={set("heroTitleLead")} />
          <Field label="Title (highlight)" value={d.heroTitleHighlight} onChange={set("heroTitleHighlight")} />
          <Field label="Title (tail)" value={d.heroTitleTail} onChange={set("heroTitleTail")} />
        </div>
        <Area label="Subtitle" value={d.heroSubtitle} onChange={set("heroSubtitle")} />
      </Section>

      <Section title="Mission">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Icon (emoji)" value={d.missionIcon} onChange={set("missionIcon")} />
          <Field label="Heading (lead)" value={d.missionLabel} onChange={set("missionLabel")} />
          <Field label="Heading (highlight)" value={d.missionHighlight} onChange={set("missionHighlight")} />
        </div>
        <Area label="Body" value={d.missionBody} onChange={set("missionBody")} />
      </Section>

      <Section title="Vision">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Icon (emoji)" value={d.visionIcon} onChange={set("visionIcon")} />
          <Field label="Heading (lead)" value={d.visionLabel} onChange={set("visionLabel")} />
          <Field label="Heading (highlight)" value={d.visionHighlight} onChange={set("visionHighlight")} />
        </div>
        <Area label="Body" value={d.visionBody} onChange={set("visionBody")} />
      </Section>

      <Section title="Values">
        <Field label="Eyebrow" value={d.valuesEyebrow} onChange={set("valuesEyebrow")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Heading (lead)" value={d.valuesHeadingLead} onChange={set("valuesHeadingLead")} />
          <Field label="Heading (highlight)" value={d.valuesHeadingHighlight} onChange={set("valuesHeadingHighlight")} />
        </div>
        <div className="space-y-3">
          {d.values.map((v, i) => (
            <div key={i} className="flex flex-wrap items-start gap-3 rounded-xl border border-ink/10 bg-base p-3">
              <input
                value={v.icon}
                onChange={(e) => setValue(i, { icon: e.target.value })}
                className="w-14 rounded-lg border border-ink/10 bg-surface px-2 py-2 text-center text-lg outline-none focus:border-primary"
                aria-label="Icon"
              />
              <div className="min-w-[12rem] flex-1 space-y-2">
                <input
                  placeholder="Title"
                  value={v.title}
                  onChange={(e) => setValue(i, { title: e.target.value })}
                  className="w-full rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm font-medium outline-none focus:border-primary"
                />
                <textarea
                  placeholder="Description"
                  value={v.desc}
                  onChange={(e) => setValue(i, { desc: e.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <button onClick={() => removeValue(i)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50">Remove</button>
            </div>
          ))}
          <button onClick={addValue} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium hover:bg-ink/[0.04]">+ Add value</button>
        </div>
      </Section>

      <Section title="Call to action">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title (lead)" value={d.ctaTitleLead} onChange={set("ctaTitleLead")} />
          <Field label="Title (highlight)" value={d.ctaTitleHighlight} onChange={set("ctaTitleHighlight")} />
        </div>
        <Area label="Body" value={d.ctaBody} onChange={set("ctaBody")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Button label" value={d.ctaButtonLabel} onChange={set("ctaButtonLabel")} />
          <Field label="Button link" value={d.ctaButtonHref} onChange={set("ctaButtonHref")} />
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={state === "saving"} className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">
          Save About Page
        </button>
        <button
          onClick={() => setD(ABOUT_DEFAULT)}
          className="rounded-xl border border-ink/10 px-4 py-2.5 text-sm font-medium hover:bg-ink/[0.04]"
        >
          Reset to defaults
        </button>
        {state === "saving" && <span className="text-xs text-muted">Saving…</span>}
        {state === "saved" && <span className="text-xs text-green-600">✓ Saved</span>}
        {state === "error" && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
