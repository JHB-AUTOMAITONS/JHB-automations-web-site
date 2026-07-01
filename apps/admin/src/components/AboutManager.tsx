"use client";

import { useMemo, useState } from "react";
import { saveAboutDraft, publishAbout } from "@/app/actions";
import { ABOUT_DEFAULT, type AboutDoc, type AboutValue } from "@jhb/shared/about";
import { usePageContainers } from "@/lib/usePageContainers";
import EditorHeader from "./EditorHeader";
import AboutPreview from "./AboutPreview";

const ABOUT_SECTIONS = [
  { label: "Hero", zone: "after-hero" },
  { label: "Mission & Vision", zone: "after-mission" },
  { label: "Stats", zone: "after-stats" },
  { label: "Values", zone: "after-values" },
  { label: "Call to Action", zone: "bottom" },
];

type Toast = { type: "success" | "error"; msg: string } | null;

export default function AboutManager({
  initial,
  initialStatus = "draft",
}: {
  initial: AboutDoc;
  initialStatus?: "draft" | "published";
}) {
  const [d, setD] = useState<AboutDoc>(initial);
  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [status, setStatus] = useState<"draft" | "published">(initialStatus);
  const [toast, setToast] = useState<Toast>(null);
  const [showPreview, setShowPreview] = useState(true);
  const cb = usePageContainers(initial.containers, ABOUT_SECTIONS);

  const flash = (t: Toast) => { setToast(t); setTimeout(() => setToast(null), 3500); };

  // The exact doc the public page would render — fed live into <AboutPreview>.
  const liveDoc = useMemo<AboutDoc>(() => ({ ...d, containers: cb.containers }), [d, cb.containers]);

  const assemble = () => ({ ...d, containers: cb.containers } as unknown as Record<string, unknown>);

  const set = (k: keyof AboutDoc) => (v: string) => setD((p) => ({ ...p, [k]: v }));
  const setValue = (i: number, patch: Partial<AboutValue>) =>
    setD((p) => ({ ...p, values: p.values.map((v, idx) => (idx === i ? { ...v, ...patch } : v)) }));
  const addValue = () =>
    setD((p) => ({ ...p, values: [...p.values, { icon: "✨", title: "", desc: "" }] }));
  const removeValue = (i: number) =>
    setD((p) => ({ ...p, values: p.values.filter((_, idx) => idx !== i) }));

  const saveDraft = async () => {
    setBusy("save");
    const res = await saveAboutDraft(assemble());
    setBusy("");
    if (res.ok) {
      setStatus("draft");
      flash({ type: "success", msg: "Draft saved." });
    } else {
      flash({ type: "error", msg: res.error || "Save failed." });
    }
  };

  const publish = async () => {
    setBusy("publish");
    const res = await publishAbout(assemble());
    setBusy("");
    if (res.ok) {
      setStatus("published");
      flash({ type: "success", msg: "Published! Live on the website." });
    } else {
      flash({ type: "error", msg: res.error || "Publish failed." });
    }
  };

  return (
    <div className="space-y-6">
      <EditorHeader
        title="About Page"
        subtitle="All copy on the public /about page — hero, mission, vision, values and call-to-action."
        status={status}
        busy={busy}
        toast={toast}
        onSave={saveDraft}
        onPublish={publish}
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((s) => !s)}
        extra={
          <button
            type="button"
            onClick={() => setD(ABOUT_DEFAULT)}
            className="rounded-lg border border-ink/10 px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-ink"
          >
            Reset
          </button>
        }
      />

      <div className={`mt-2 grid gap-6 ${showPreview ? "xl:grid-cols-[minmax(0,1fr)_minmax(360px,540px)]" : ""}`}>
        <div className="space-y-6">
        <Section title="SEO / Meta">
          <Field label="Meta title" value={d.metaTitle} onChange={set("metaTitle")} />
          <Area label="Meta description" value={d.metaDescription} onChange={set("metaDescription")} />
        </Section>

        {cb.slot("top")}

        <Section title="Hero">
          <Field label="Eyebrow" value={d.heroEyebrow} onChange={set("heroEyebrow")} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Title (lead)" value={d.heroTitleLead} onChange={set("heroTitleLead")} />
            <Field label="Title (highlight)" value={d.heroTitleHighlight} onChange={set("heroTitleHighlight")} />
            <Field label="Title (tail)" value={d.heroTitleTail} onChange={set("heroTitleTail")} />
          </div>
          <Area label="Subtitle" value={d.heroSubtitle} onChange={set("heroSubtitle")} />
        </Section>

        {cb.slot("after-hero")}

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

        {cb.slot("after-mission")}
        {cb.slot("after-stats")}

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

        {cb.slot("after-values")}

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

        {cb.slot("bottom")}
        </div>

        {showPreview && (
          <AboutPreview
            about={liveDoc}
            footer="Live preview of your saved + unsaved draft. Publish to push it live."
          />
        )}
      </div>

      {cb.modal}
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
