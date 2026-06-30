"use client";

import { useState } from "react";
import type { BlogFaq } from "@jhb/shared/posts";
import RichText from "./RichText";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `faq-${Date.now()}-${Math.round(Math.random() * 1e6)}`;

const newFaq = (): BlogFaq => ({ id: uid(), question: "", answer: "", visible: true });

/**
 * Per-post FAQ editor. The parent (PostEditor) owns the array + the section
 * toggle, so its live preview and Save Draft / Publish pick up every change
 * instantly. Each item carries a stable id so the uncontrolled RichText answer
 * editors stay bound to their FAQ across reorder / delete / duplicate.
 */
export default function BlogFaqEditor({
  value,
  onChange,
  enabled,
  onToggleEnabled,
}: {
  value: BlogFaq[];
  onChange: (v: BlogFaq[]) => void;
  enabled: boolean;
  onToggleEnabled: (v: boolean) => void;
}) {
  const [drag, setDrag] = useState<number | null>(null);

  const setFaq = (i: number, patch: Partial<BlogFaq>) =>
    onChange(value.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const add = () => onChange([...value, newFaq()]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const duplicate = (i: number) => {
    const copy: BlogFaq = { ...value[i], id: uid() };
    onChange([...value.slice(0, i + 1), copy, ...value.slice(i + 1)]);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const n = [...value];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m);
    onChange(n);
  };
  const drop = (target: number) => {
    if (drag === null || drag === target) return setDrag(null);
    move(drag, target);
    setDrag(null);
  };

  const visibleCount = value.filter((f) => f.visible).length;

  return (
    <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">FAQ Section</h2>
          <p className="text-xs text-muted">
            Blog-specific questions shown as an accordion near the end of this post.
            {value.length > 0 && ` ${visibleCount} of ${value.length} visible.`}
          </p>
        </div>
        {/* whole-section toggle */}
        <button
          type="button"
          onClick={() => onToggleEnabled(!enabled)}
          className="flex items-center gap-2 rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium"
          title="Enable or disable the entire FAQ section"
        >
          <span className={`relative h-4 w-7 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-ink/20"}`}>
            <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${enabled ? "left-[14px]" : "left-0.5"}`} />
          </span>
          {enabled ? "Section on" : "Section off"}
        </button>
      </div>

      {!enabled && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          The FAQ section is turned off — it won’t appear on the live post even if items exist.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {value.map((f, i) => (
          <div
            key={f.id}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(i)}
            className={`rounded-2xl border bg-base p-4 ${
              drag === i ? "border-primary opacity-60" : "border-ink/10"
            } ${!f.visible ? "opacity-70" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="cursor-grab select-none text-muted active:cursor-grabbing" title="Drag to reorder">⠿</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">FAQ {i + 1}</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFaq(i, { visible: !f.visible })}
                  className="flex items-center gap-1.5 rounded-lg border border-ink/10 px-2 py-1 text-xs"
                  title={f.visible ? "Visible" : "Hidden"}
                >
                  <span className={`relative h-4 w-7 rounded-full transition-colors ${f.visible ? "bg-primary" : "bg-ink/20"}`}>
                    <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${f.visible ? "left-[14px]" : "left-0.5"}`} />
                  </span>
                  {f.visible ? "On" : "Off"}
                </button>
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↑</button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === value.length - 1} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↓</button>
                <button type="button" onClick={() => duplicate(i)} className="rounded-lg border border-ink/10 px-2 py-1 text-xs hover:bg-ink/[0.04]">Duplicate</button>
                <button type="button" onClick={() => { if (confirm("Delete this FAQ?")) remove(i); }} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50">Delete</button>
              </div>
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-[11px] font-medium text-muted">Question</span>
              <input
                value={f.question}
                onChange={(e) => setFaq(i, { question: e.target.value })}
                placeholder="e.g. How long does setup take?"
                className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>

            <div className="mt-3">
              <span className="mb-1 block text-[11px] font-medium text-muted">Answer (rich text)</span>
              <RichText value={f.answer} onChange={(html) => setFaq(i, { answer: html })} />
            </div>
          </div>
        ))}

        {value.length === 0 && (
          <p className="rounded-xl border border-dashed border-ink/15 p-6 text-center text-sm text-muted">
            No FAQs yet. Add as many as you like — they’re saved with this post only.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-3 w-full rounded-xl border border-dashed border-ink/20 py-2.5 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-primary"
      >
        + Add FAQ
      </button>
    </section>
  );
}
