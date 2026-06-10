"use client";

import { useState } from "react";
import { saveContent } from "@/app/actions";
import type { HeroContent, StatsContent, StatItem } from "@jhb/shared/content";

export default function ContentEditor({
  hero,
  stats,
}: {
  hero: HeroContent;
  stats: StatsContent;
}) {
  return (
    <div className="mt-8 space-y-6">
      <HeroForm initial={hero} />
      <StatsForm initial={stats} />
    </div>
  );
}

function Status({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "saving") return <span className="text-xs text-muted">Saving…</span>;
  if (state === "saved") return <span className="text-xs text-green-600">✓ Saved</span>;
  if (state === "error") return <span className="text-xs text-red-500">Error saving</span>;
  return null;
}

function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {desc && <p className="mt-1 text-sm text-muted">{desc}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {textarea ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}

function HeroForm({ initial }: { initial: HeroContent }) {
  const [h, setH] = useState<HeroContent>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const set = (k: keyof HeroContent) => (v: string) => setH((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setState("saving");
    const res = await saveContent("hero", h as unknown as Record<string, unknown>);
    setState(res.ok ? "saved" : "error");
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <Card title="Hero Section" desc="The main headline area at the top of your homepage.">
      <Field label="Badge text" value={h.badge} onChange={set("badge")} />
      <Field label="Headline" value={h.title} onChange={set("title")} textarea />
      <Field label="Highlighted phrase (gradient)" value={h.highlight} onChange={set("highlight")} />
      <Field label="Subtitle" value={h.subtitle} onChange={set("subtitle")} textarea />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Primary button label" value={h.ctaPrimaryLabel} onChange={set("ctaPrimaryLabel")} />
        <Field label="Primary button link" value={h.ctaPrimaryHref} onChange={set("ctaPrimaryHref")} />
        <Field label="Secondary button label" value={h.ctaSecondaryLabel} onChange={set("ctaSecondaryLabel")} />
        <Field label="Secondary button link" value={h.ctaSecondaryHref} onChange={set("ctaSecondaryHref")} />
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button onClick={save} disabled={state === "saving"} className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">
          Save Hero
        </button>
        <Status state={state} />
      </div>
    </Card>
  );
}

function StatsForm({ initial }: { initial: StatsContent }) {
  const [items, setItems] = useState<StatItem[]>(initial.items);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const update = (i: number, k: keyof StatItem, v: string) =>
    setItems((p) =>
      p.map((it, idx) =>
        idx === i
          ? { ...it, [k]: k === "value" ? Number(v) || 0 : v }
          : it
      )
    );

  const save = async () => {
    setState("saving");
    const res = await saveContent("stats", { items });
    setState(res.ok ? "saved" : "error");
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <Card title="Statistics" desc="The animated numbers in the “Why Choose Us” band.">
      <div className="space-y-4">
        {items.map((it, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_80px_2fr]">
            <Field label="Value" value={String(it.value)} onChange={(v) => update(i, "value", v)} />
            <Field label="Suffix" value={it.suffix} onChange={(v) => update(i, "suffix", v)} />
            <Field label="Label" value={it.label} onChange={(v) => update(i, "label", v)} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button onClick={save} disabled={state === "saving"} className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">
          Save Statistics
        </button>
        <Status state={state} />
      </div>
    </Card>
  );
}
