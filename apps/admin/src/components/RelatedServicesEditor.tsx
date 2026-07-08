"use client";

import Icon, { ICON_NAMES } from "@jhb/shared/icon";
import { cid } from "@jhb/shared/containers";
import type {
  InternalPage,
  RelatedHover,
  RelatedServiceCard,
  RelatedServicesContent,
} from "@jhb/shared/service-pages";
import RichEditor from "./RichEditor";
import ImagePicker from "./ImagePicker";

const input = "w-full rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary";
const lbl = "mb-1 block text-[11px] font-medium text-muted";

export type ServiceSummary = { key: string; title: string; slug: string; icon: string };

export default function RelatedServicesEditor({
  value,
  onChange,
  services,
  internalPages = [],
}: {
  value: RelatedServicesContent;
  onChange: (v: RelatedServicesContent) => void;
  services: ServiceSummary[];
  internalPages?: InternalPage[];
}) {
  const set = (patch: Partial<RelatedServicesContent>) => onChange({ ...value, ...patch });
  const setCard = (id: string, patch: Partial<RelatedServiceCard>) =>
    set({ cards: value.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const addCard = () =>
    set({
      cards: [
        ...value.cards,
        { id: cid(), name: "New service", icon: "spark", image: null, description: "", target: "", customUrl: "", bg: "", border: "", iconColor: "", textColor: "", hover: "lift", enabled: true },
      ],
    });
  const removeCard = (id: string) => set({ cards: value.cards.filter((c) => c.id !== id) });
  const dupCard = (id: string) => {
    const i = value.cards.findIndex((c) => c.id === id);
    if (i === -1) return;
    set({ cards: [...value.cards.slice(0, i + 1), { ...value.cards[i], id: cid() }, ...value.cards.slice(i + 1)] });
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.cards.length) return;
    const n = [...value.cards];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m);
    set({ cards: n });
  };
  // Auto-link: picking a Target Service fills the card name + icon (both stay editable).
  const onTarget = (id: string, key: string) => {
    const svc = services.find((s) => s.key === key);
    setCard(id, svc ? { target: key, name: svc.title, icon: svc.icon || "spark" } : { target: "" });
  };
  const colorField = (label: string, v: string, on: (val: string) => void) => (
    <span className="flex items-center gap-1.5">
      <span className="text-[11px] text-muted">{label}</span>
      <input type="color" value={v || "#ffffff"} onChange={(e) => on(e.target.value)} className="h-7 w-9 cursor-pointer rounded border border-ink/10" />
      {v ? <button type="button" onClick={() => on("")} title="Clear" className="rounded border border-ink/10 px-1.5 py-0.5 text-[10px] text-muted hover:bg-ink/[0.04]">✕</button> : null}
    </span>
  );

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-xs text-muted">
        <input type="checkbox" checked={value.enabled} onChange={(e) => set({ enabled: e.target.checked })} />
        Show the Related Services section on this page
      </label>

      <label className="block"><span className={lbl}>Eyebrow (optional)</span><input className={input} value={value.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} /></label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block"><span className={lbl}>Heading (lead)</span><input className={input} value={value.headingLead} onChange={(e) => set({ headingLead: e.target.value })} placeholder="Explore Related" /></label>
        <label className="block"><span className={lbl}>Heading (highlight)</span><input className={input} value={value.headingHighlight} onChange={(e) => set({ headingHighlight: e.target.value })} placeholder="Services" /></label>
        <label className="block"><span className={lbl}>Heading (tail)</span><input className={input} value={value.headingTail} onChange={(e) => set({ headingTail: e.target.value })} placeholder="(optional)" /></label>
      </div>
      <div><span className={lbl}>Subtitle (rich text)</span><RichEditor value={value.subtitle} onChange={(html) => set({ subtitle: html })} internalPages={internalPages} /></div>

      <div className="space-y-2">
        <span className={lbl}>Related service cards</span>
        {value.cards.map((card, i) => (
          <div
            key={card.id}
            className={`rounded-xl border border-ink/10 bg-base p-3 ${!card.enabled ? "opacity-50" : ""}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-muted">Card {i + 1}</span>
              </span>
              <div className="flex items-center gap-1">
                <label className="mr-1 flex items-center gap-1 text-[11px] text-muted" title="Show this card on the live page">
                  <input type="checkbox" checked={card.enabled} onChange={(e) => setCard(card.id, { enabled: e.target.checked })} /> On
                </label>
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↑</button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === value.cards.length - 1} className="rounded-lg border border-ink/10 px-2 py-1 text-xs disabled:opacity-40">↓</button>
                <button type="button" onClick={() => dupCard(card.id)} className="rounded-lg border border-ink/10 px-2 py-1 text-xs hover:bg-ink/[0.04]">Duplicate</button>
                <button type="button" onClick={() => removeCard(card.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500">✕</button>
              </div>
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="block"><span className={lbl}>Target service</span>
                <select className={input} value={card.target} onChange={(e) => onTarget(card.id, e.target.value)}>
                  <option value="">— Custom URL only —</option>
                  {services.map((s) => <option key={s.key} value={s.key}>{s.title}</option>)}
                </select>
              </label>
              <label className="block"><span className={lbl}>Service name</span><input className={input} value={card.name} onChange={(e) => setCard(card.id, { name: e.target.value })} /></label>
            </div>
            <label className="mt-2 block"><span className={lbl}>Custom URL (optional — overrides the target)</span><input className={input} value={card.customUrl} onChange={(e) => setCard(card.id, { customUrl: e.target.value })} placeholder="/my-page or https://…" /></label>
            <label className="mt-2 block"><span className={lbl}>Description (optional)</span><input className={input} value={card.description} onChange={(e) => setCard(card.id, { description: e.target.value })} /></label>

            <div className="mt-2">
              <span className={lbl}>Icon {card.image ? "(overridden by the image below)" : ""}</span>
              <div className="flex flex-wrap gap-1">
                {ICON_NAMES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCard(card.id, { icon: n })}
                    title={n}
                    className={`grid h-8 w-8 place-items-center rounded-lg border transition ${card.icon === n && !card.image ? "border-primary text-primary" : "border-ink/10 text-muted hover:border-primary"}`}
                  >
                    <Icon name={n} className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2"><ImagePicker label="Icon image (optional — replaces the icon)" value={card.image} onChange={(url) => setCard(card.id, { image: url })} alt={false} /></div>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              {colorField("Background", card.bg, (bg) => setCard(card.id, { bg }))}
              {colorField("Border", card.border, (border) => setCard(card.id, { border }))}
              {colorField("Icon", card.iconColor, (iconColor) => setCard(card.id, { iconColor }))}
              {colorField("Text", card.textColor, (textColor) => setCard(card.id, { textColor }))}
              <label className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted">Hover</span>
                <select className="rounded-lg border border-ink/10 bg-surface px-2 py-1 text-xs" value={card.hover} onChange={(e) => setCard(card.id, { hover: e.target.value as RelatedHover })}>
                  <option value="lift">Lift</option>
                  <option value="glow">Glow</option>
                  <option value="none">None</option>
                </select>
              </label>
            </div>
          </div>
        ))}
        <button type="button" onClick={addCard} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs font-medium hover:bg-ink/[0.04]">+ Add card</button>
      </div>
    </div>
  );
}
