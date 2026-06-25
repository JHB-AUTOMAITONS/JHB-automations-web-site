"use client";

import { useState } from "react";
import type { InternalPage } from "@jhb/shared/service-pages";
import { SERVICE_CARD_ICONS, type ServiceCard } from "@jhb/shared/home";
import RichEditor from "./RichEditor";
import ImagePicker from "./ImagePicker";

const makeCard = (): ServiceCard => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `card-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  title: "",
  short: "",
  icon: "spark",
  image: null,
  slug: "",
  enabled: true,
});

/**
 * Dynamic Home "Service Cards" editor. Fully controlled — the parent
 * (HomeManager) owns the `cards` array so the Live Preview updates instantly and
 * the cards persist through the normal Save draft / Publish flow.
 */
export default function ServiceCardsManager({
  cards,
  onChange,
  internalPages = [],
}: {
  cards: ServiceCard[];
  onChange: (cards: ServiceCard[]) => void;
  internalPages?: InternalPage[];
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const set = (i: number, patch: Partial<ServiceCard>) =>
    onChange(cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const add = () => onChange([...cards, makeCard()]);
  const remove = (i: number) => onChange(cards.filter((_, idx) => idx !== i));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= cards.length) return;
    const n = [...cards];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m);
    onChange(n);
  };
  const onDrop = (target: number) => {
    if (dragIndex === null || dragIndex === target) return setDragIndex(null);
    move(dragIndex, target);
    setDragIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Service Cards ({cards.length})
        </p>
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium hover:bg-ink/[0.04]"
        >
          + Add New Card
        </button>
      </div>
      <p className="text-xs text-muted">
        Drag the ⠿ handle (or use ↑/↓) to reorder. Disabled cards are hidden on the
        website. Changes appear in the Live Preview instantly and go live on Publish.
      </p>

      {cards.length === 0 && (
        <p className="rounded-xl border border-dashed border-ink/15 p-6 text-center text-sm text-muted">
          No service cards yet. Click “Add New Card” to create one.
        </p>
      )}

      {cards.map((c, i) => (
        <div
          key={c.id}
          draggable
          onDragStart={() => setDragIndex(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(i)}
          className={`rounded-xl border bg-base p-3 ${
            dragIndex === i ? "border-primary opacity-60" : "border-ink/10"
          } ${!c.enabled ? "opacity-70" : ""}`}
        >
          <div className="flex items-start gap-2">
            <span
              className="mt-1.5 cursor-grab select-none text-muted active:cursor-grabbing"
              title="Drag to reorder"
            >
              ⠿
            </span>
            <div className="flex-1 space-y-3">
              {/* enable toggle + reorder + delete */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => set(i, { enabled: !c.enabled })}
                  className="flex items-center gap-2 text-xs font-medium"
                >
                  <span
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      c.enabled ? "bg-primary" : "bg-ink/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                        c.enabled ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </span>
                  <span className={c.enabled ? "text-green-700" : "text-muted"}>
                    {c.enabled ? "Enabled" : "Disabled"}
                  </span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === cards.length - 1}
                    className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this service card?")) remove(i);
                    }}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* title */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted">Card title</label>
                <RichEditor
                  value={c.title}
                  onChange={(html) => set(i, { title: html })}
                  internalPages={internalPages}
                />
              </div>

              {/* description */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted">
                  Card description
                </label>
                <RichEditor
                  value={c.short}
                  onChange={(html) => set(i, { short: html })}
                  internalPages={internalPages}
                />
              </div>

              {/* icon + slug */}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-muted">
                    Icon {c.image ? "(overridden by image)" : ""}
                  </span>
                  <select
                    value={c.icon}
                    onChange={(e) => set(i, { icon: e.target.value })}
                    disabled={!!c.image}
                    className="w-full rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
                  >
                    {SERVICE_CARD_ICONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-medium text-muted">
                    Slug / link (optional)
                  </span>
                  <div className="flex items-center overflow-hidden rounded-lg border border-ink/10 bg-surface">
                    <span className="px-2 py-2 text-xs text-muted">/</span>
                    <input
                      value={c.slug}
                      onChange={(e) =>
                        set(i, {
                          slug: e.target.value
                            .trim()
                            .toLowerCase()
                            .replace(/[^a-z0-9-]+/g, "-")
                            .replace(/^-+/, ""),
                        })
                      }
                      placeholder="leave empty for no link"
                      className="flex-1 bg-transparent py-2 pr-3 text-sm outline-none"
                    />
                  </div>
                </label>
              </div>

              {/* image (optional, overrides icon) */}
              <ImagePicker
                label="Image (optional — overrides the icon)"
                value={c.image}
                onChange={(url) => set(i, { image: url || null })}
                alt={false}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
