"use client";

import { useState } from "react";
import type { InternalPage, ServiceFeature, WhatsIncludedContent } from "@jhb/shared/service-pages";
import type { ContainerAlign, ContainerBg, ContainerPad } from "@jhb/shared/containers";
import RichEditor from "./RichEditor";
import ImagePicker from "./ImagePicker";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.round(Math.random() * 1e6)}`;

const newItem = (): ServiceFeature => ({
  id: uid(),
  title: "",
  desc: "",
  link: "",
  linkText: "",
  icon: "",
  image: null,
});

const BG_OPTIONS: { value: ContainerBg; label: string }[] = [
  { value: "none", label: "None" },
  { value: "subtle", label: "Subtle" },
  { value: "gradient", label: "Gradient" },
  { value: "dark", label: "Dark" },
];
const PAD_OPTIONS: { value: ContainerPad; label: string }[] = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];
const ALIGN_OPTIONS: { value: ContainerAlign; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

/**
 * Fully controlled editor for the per-service-page "What's Included" section.
 * The section *chrome* (badge, heading, description, columns, button, styling)
 * lives in `value`; the cards are the page's `features` array, passed as
 * `items`. Both are owned by the parent (ServicePageEditor) so autosave + live
 * preview pick up every change instantly. Supports add / edit / delete /
 * duplicate / drag-reorder of items.
 */
export default function WhatsIncludedEditor({
  value,
  onChange,
  items,
  onChangeItems,
  internalPages,
}: {
  value: WhatsIncludedContent;
  onChange: (v: WhatsIncludedContent) => void;
  items: ServiceFeature[];
  onChangeItems: (v: ServiceFeature[]) => void;
  internalPages: InternalPage[];
}) {
  const [drag, setDrag] = useState<number | null>(null);

  const set = (patch: Partial<WhatsIncludedContent>) => onChange({ ...value, ...patch });

  // ----- item helpers -----
  const setItem = (i: number, patch: Partial<ServiceFeature>) =>
    onChangeItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const addItem = () => onChangeItems([...items, newItem()]);
  const removeItem = (i: number) => onChangeItems(items.filter((_, idx) => idx !== i));
  const duplicateItem = (i: number) => {
    const copy: ServiceFeature = { ...items[i], id: uid() };
    onChangeItems([...items.slice(0, i + 1), copy, ...items.slice(i + 1)]);
  };
  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const n = [...items];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m);
    onChangeItems(n);
  };
  const dropItem = (target: number) => {
    if (drag === null || drag === target) return setDrag(null);
    moveItem(drag, target);
    setDrag(null);
  };

  return (
    <div className="space-y-4">
      {/* section-level enable */}
      <div className="flex items-center justify-between rounded-xl border border-ink/10 bg-base p-3">
        <div>
          <p className="text-xs font-semibold text-ink/90">Show this section</p>
          <p className="text-[11px] text-muted">Turn off to hide “What’s Included” on the live page.</p>
        </div>
        <button
          type="button"
          onClick={() => set({ enabled: !value.enabled })}
          className="flex items-center gap-1.5 rounded-lg border border-ink/10 px-2 py-1 text-xs"
        >
          <span className={`relative h-4 w-7 rounded-full transition-colors ${value.enabled ? "bg-primary" : "bg-ink/20"}`}>
            <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${value.enabled ? "left-[14px]" : "left-0.5"}`} />
          </span>
          {value.enabled ? "On" : "Off"}
        </button>
      </div>

      {/* chrome fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Badge (eyebrow)</span>
          <input value={value.badge} onChange={(e) => set({ badge: e.target.value })} className="input" placeholder="e.g. What you get (optional)" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Columns</span>
          <select
            value={value.columns}
            onChange={(e) => set({ columns: Number(e.target.value) as 1 | 2 | 3 })}
            className="input"
          >
            <option value={1}>1 column</option>
            <option value={2}>2 columns</option>
            <option value={3}>3 columns</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Heading</span>
          <input value={value.heading} onChange={(e) => set({ heading: e.target.value })} className="input" placeholder="What's" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Highlight (gradient)</span>
          <input value={value.highlight} onChange={(e) => set({ highlight: e.target.value })} className="input" placeholder="Included" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium text-muted">Description</span>
        <textarea value={value.description} onChange={(e) => set({ description: e.target.value })} rows={2} className="input resize-none" />
      </label>

      {/* styling */}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Background</span>
          <select value={value.bg} onChange={(e) => set({ bg: e.target.value as ContainerBg })} className="input">
            {BG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Spacing</span>
          <select value={value.padding} onChange={(e) => set({ padding: e.target.value as ContainerPad })} className="input">
            {PAD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Heading alignment</span>
          <select value={value.align} onChange={(e) => set({ align: e.target.value as ContainerAlign })} className="input">
            {ALIGN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      </div>

      {/* optional CTA button */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Button label (optional)</span>
          <input value={value.button.label} onChange={(e) => set({ button: { ...value.button, label: e.target.value } })} className="input" placeholder="e.g. Get started" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Button URL</span>
          <input value={value.button.href} onChange={(e) => set({ button: { ...value.button, href: e.target.value } })} className="input" placeholder="https://… or /contact" />
        </label>
      </div>

      {/* items */}
      <div className="border-t border-ink/10 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Included items ({items.length})
          </span>
          <button type="button" onClick={addItem} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add item</button>
        </div>
        <p className="mt-1 text-[11px] text-muted">Drag ⠿ to reorder. Each item shows an icon/image, title, description and an optional link.</p>

        <div className="mt-3 space-y-3">
          {items.map((it, i) => (
            <div
              key={it.id ?? i}
              draggable
              onDragStart={() => setDrag(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dropItem(i)}
              className={`rounded-xl border bg-surface p-3 ${drag === i ? "border-primary opacity-60" : "border-ink/10"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <span className="cursor-grab select-none text-muted active:cursor-grabbing" title="Drag to reorder">⠿</span>
                  <span className="text-xs font-semibold text-muted">Item {i + 1}</span>
                </span>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveItem(i, i - 1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => moveItem(i, i + 1)} disabled={i === items.length - 1} className="grid h-8 w-8 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => duplicateItem(i)} className="rounded border border-ink/10 px-2 py-1 text-xs hover:bg-ink/[0.04]">Duplicate</button>
                  <button type="button" onClick={() => { if (confirm("Delete this item?")) removeItem(i); }} className="grid h-8 w-8 place-items-center rounded border border-red-200 text-xs text-red-500 hover:bg-red-50">✕</button>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-muted">Icon (emoji)</span>
                  <input
                    value={it.icon ?? ""}
                    onChange={(e) => setItem(i, { icon: e.target.value })}
                    disabled={!!it.image}
                    title={it.image ? "Overridden by image" : "Emoji shown on the card (numbered badge if empty)"}
                    maxLength={4}
                    className="w-20 rounded-lg border border-ink/10 bg-base px-3 py-1.5 text-center text-base outline-none focus:border-primary disabled:opacity-50"
                    placeholder="✨"
                  />
                </label>
                <div className="min-w-0 flex-1">
                  <ImagePicker
                    label="Image (optional — overrides the icon)"
                    value={it.image ?? null}
                    onChange={(url) => setItem(i, { image: url || null })}
                    alt={false}
                  />
                </div>
              </div>

              <div className="mt-2">
                <span className="mb-1 block text-[11px] font-medium text-muted">Title (rich text — select a word, click 🔗 to link)</span>
                <RichEditor value={it.title} onChange={(html) => setItem(i, { title: html })} internalPages={internalPages} />
              </div>
              <div className="mt-2">
                <span className="mb-1 block text-[11px] font-medium text-muted">Description (rich text — supports word links)</span>
                <RichEditor value={it.desc} onChange={(html) => setItem(i, { desc: html })} internalPages={internalPages} />
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-muted">Link URL (optional)</span>
                  <input value={it.link ?? ""} onChange={(e) => setItem(i, { link: e.target.value })} className="input" placeholder="https://… or /contact" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-muted">Link text</span>
                  <input value={it.linkText ?? ""} onChange={(e) => setItem(i, { linkText: e.target.value })} className="input" placeholder="Learn more" />
                </label>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="rounded-lg border border-dashed border-ink/15 p-4 text-center text-xs text-muted">No items yet. Click “Add item”.</p>
          )}
        </div>
      </div>
    </div>
  );
}
