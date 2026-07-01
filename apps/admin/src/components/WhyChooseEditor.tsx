"use client";

import { useState } from "react";
import {
  type WhyChooseBenefit,
  type WhyChooseContainer,
} from "@jhb/shared/service-pages";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.round(Math.random() * 1e6)}`;

const newBenefit = (): WhyChooseBenefit => ({
  id: uid(),
  title: "",
  enabled: true,
});

const newContainer = (): WhyChooseContainer => ({
  id: uid(),
  enabled: true,
  badge: "Why Choose Us",
  heading: "The JHB",
  highlight: "Advantage",
  description: "",
  benefits: [newBenefit()],
});

/**
 * Fully controlled editor for the per-service-page "Why Choose Us" section.
 * Supports multiple containers (add / duplicate / delete / reorder / toggle),
 * each with its own dynamic benefit list. The parent (ServicePageEditor) owns
 * the array, so its autosave + live preview pick up every change instantly.
 */
export default function WhyChooseEditor({
  value,
  onChange,
}: {
  value: WhyChooseContainer[];
  onChange: (v: WhyChooseContainer[]) => void;
}) {
  const [dragC, setDragC] = useState<number | null>(null);

  const setContainer = (ci: number, patch: Partial<WhyChooseContainer>) =>
    onChange(value.map((c, i) => (i === ci ? { ...c, ...patch } : c)));

  const addContainer = () => onChange([...value, newContainer()]);
  const removeContainer = (ci: number) => onChange(value.filter((_, i) => i !== ci));
  const duplicateContainer = (ci: number) => {
    const src = value[ci];
    const copy: WhyChooseContainer = {
      ...src,
      id: uid(),
      benefits: src.benefits.map((b) => ({ ...b, id: uid() })),
    };
    onChange([...value.slice(0, ci + 1), copy, ...value.slice(ci + 1)]);
  };
  const moveContainer = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const n = [...value];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m);
    onChange(n);
  };
  const dropContainer = (target: number) => {
    if (dragC === null || dragC === target) return setDragC(null);
    moveContainer(dragC, target);
    setDragC(null);
  };

  // ----- benefit helpers (scoped to a container) -----
  const setBenefits = (ci: number, benefits: WhyChooseBenefit[]) =>
    setContainer(ci, { benefits });
  const setBenefit = (ci: number, bi: number, patch: Partial<WhyChooseBenefit>) =>
    setBenefits(ci, value[ci].benefits.map((b, i) => (i === bi ? { ...b, ...patch } : b)));
  const addBenefit = (ci: number) => setBenefits(ci, [...value[ci].benefits, newBenefit()]);
  const removeBenefit = (ci: number, bi: number) =>
    setBenefits(ci, value[ci].benefits.filter((_, i) => i !== bi));
  const moveBenefit = (ci: number, from: number, to: number) => {
    const list = value[ci].benefits;
    if (to < 0 || to >= list.length) return;
    const n = [...list];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m);
    setBenefits(ci, n);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          Multiple containers render top-to-bottom on the service page. Disabled
          containers/benefits are hidden. Changes appear in the preview instantly.
        </p>
        <button
          type="button"
          onClick={addContainer}
          className="shrink-0 rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium hover:bg-ink/[0.04]"
        >
          + Add Container
        </button>
      </div>

      {value.length === 0 && (
        <p className="rounded-xl border border-dashed border-ink/15 p-6 text-center text-sm text-muted">
          No containers yet. Click “Add Container” to create one.
        </p>
      )}

      {value.map((c, ci) => (
        <div
          key={c.id}
          draggable
          onDragStart={() => setDragC(ci)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => dropContainer(ci)}
          className={`rounded-2xl border bg-base p-4 ${
            dragC === ci ? "border-primary opacity-60" : "border-ink/10"
          } ${!c.enabled ? "opacity-70" : ""}`}
        >
          {/* container toolbar */}
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="cursor-grab select-none text-muted active:cursor-grabbing" title="Drag to reorder">⠿</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Container {ci + 1}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setContainer(ci, { enabled: !c.enabled })} className="flex items-center gap-1.5 rounded-lg border border-ink/10 px-2 py-1 text-xs">
                <span className={`relative h-4 w-7 rounded-full transition-colors ${c.enabled ? "bg-primary" : "bg-ink/20"}`}>
                  <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${c.enabled ? "left-[14px]" : "left-0.5"}`} />
                </span>
                {c.enabled ? "On" : "Off"}
              </button>
              <button type="button" onClick={() => moveContainer(ci, ci - 1)} disabled={ci === 0} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↑</button>
              <button type="button" onClick={() => moveContainer(ci, ci + 1)} disabled={ci === value.length - 1} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↓</button>
              <button type="button" onClick={() => duplicateContainer(ci)} className="rounded-lg border border-ink/10 px-2 py-1 text-xs hover:bg-ink/[0.04]">Duplicate</button>
              <button type="button" onClick={() => { if (confirm("Delete this container?")) removeContainer(ci); }} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50">Delete</button>
            </div>
          </div>

          {/* left-side fields */}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-muted">Badge</span>
              <input value={c.badge} onChange={(e) => setContainer(ci, { badge: e.target.value })} className="input" placeholder="Why Choose Us" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-muted">Heading</span>
                <input value={c.heading} onChange={(e) => setContainer(ci, { heading: e.target.value })} className="input" placeholder="The JHB" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-muted">Highlight (gradient)</span>
                <input value={c.highlight} onChange={(e) => setContainer(ci, { highlight: e.target.value })} className="input" placeholder="Advantage" />
              </label>
            </div>
          </div>
          <label className="mt-3 block">
            <span className="mb-1 block text-[11px] font-medium text-muted">Description</span>
            <textarea value={c.description} onChange={(e) => setContainer(ci, { description: e.target.value })} rows={2} className="input resize-none" />
          </label>

          {/* benefits */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Benefits ({c.benefits.length})
              </span>
              <button type="button" onClick={() => addBenefit(ci)} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add Benefit</button>
            </div>
            <div className="mt-2 space-y-2">
              {c.benefits.map((b, bi) => (
                <div key={b.id} className={`rounded-xl border border-ink/10 bg-surface p-3 ${!b.enabled ? "opacity-70" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <input value={b.title} onChange={(e) => setBenefit(ci, bi, { title: e.target.value })} placeholder="Benefit title" className="min-w-[10rem] flex-1 rounded-lg border border-ink/10 bg-base px-3 py-1.5 text-sm outline-none focus:border-primary" />
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setBenefit(ci, bi, { enabled: !b.enabled })} className="rounded-lg border border-ink/10 px-2 py-1 text-xs" title={b.enabled ? "Enabled" : "Disabled"}>{b.enabled ? "On" : "Off"}</button>
                      <button type="button" onClick={() => moveBenefit(ci, bi, bi - 1)} disabled={bi === 0} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↑</button>
                      <button type="button" onClick={() => moveBenefit(ci, bi, bi + 1)} disabled={bi === c.benefits.length - 1} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↓</button>
                      <button type="button" onClick={() => removeBenefit(ci, bi)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50">✕</button>
                    </div>
                  </div>
                </div>
              ))}
              {c.benefits.length === 0 && (
                <p className="rounded-lg border border-dashed border-ink/15 p-4 text-center text-xs text-muted">No benefits yet.</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
