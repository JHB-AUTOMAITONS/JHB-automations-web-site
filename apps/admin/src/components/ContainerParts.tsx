"use client";

import { useState } from "react";
import {
  CONTAINER_LABELS,
  CONTAINER_TYPES,
  type ContainerType,
  type PageContainer,
} from "@jhb/shared/containers";
import { SECTION_TEMPLATES } from "@jhb/shared/container-templates";
import { ContainerBody, StyleControls } from "./ContainerEditors";

// UI metadata for the Add-Container picker: category, icon and a short description
// per container type. Purely presentational (labels come from the shared
// CONTAINER_LABELS); a new container type just needs one entry here.
const CONTAINER_META: Record<ContainerType, { cat: string; icon: string; desc: string }> = {
  hero: { cat: "Hero", icon: "🦸", desc: "All-in-one: heading, rich description, buttons, image, background." },
  herodesc: { cat: "Hero", icon: "📝", desc: "Rich-text hero description block." },
  features: { cat: "Content", icon: "✨", desc: "Grid of icon · title · text features." },
  about: { cat: "Content", icon: "ℹ️", desc: "Two-column about block with image." },
  cards: { cat: "Content", icon: "🗂️", desc: "Flexible grid of editable cards." },
  richtext: { cat: "Content", icon: "✍️", desc: "Free rich-text block." },
  faq: { cat: "Content", icon: "❓", desc: "Accordion of questions & answers." },
  team: { cat: "Content", icon: "👥", desc: "Team member cards." },
  image: { cat: "Media", icon: "🖼️", desc: "A single image with caption." },
  imagebanner: { cat: "Media", icon: "🌄", desc: "Full-width banner image with overlay." },
  gallery: { cat: "Media", icon: "🏞️", desc: "Responsive image gallery grid." },
  video: { cat: "Media", icon: "🎬", desc: "Embed a YouTube / Vimeo / MP4 video." },
  services: { cat: "Marketing", icon: "🛠️", desc: "Grid of service cards with links." },
  testimonials: { cat: "Marketing", icon: "💬", desc: "Customer quotes grid." },
  cta: { cat: "Marketing", icon: "📣", desc: "Call-to-action band with a button." },
  advantage: { cat: "Marketing", icon: "🏆", desc: "Why-choose-us checklist section." },
  imagecontent: { cat: "Layout", icon: "🧩", desc: "Image beside rich content + bullets." },
  workflow: { cat: "Layout", icon: "🔀", desc: "Sequential process / timeline." },
  contactform: { cat: "Forms", icon: "✉️", desc: "Working contact / lead form." },
  custom: { cat: "Advanced", icon: "⚙️", desc: "Raw HTML / embed block." },
};
const CATEGORY_ORDER = ["Hero", "Content", "Media", "Marketing", "Layout", "Forms", "Advanced"];

function PickerCard({ icon, label, desc, title, onClick }: { icon: string; label: string; desc: string; title?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="group flex items-start gap-3 rounded-xl border border-ink/10 bg-base p-3 text-left transition hover:border-primary hover:bg-primary/5 hover:shadow-soft"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-lg">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink/90 transition group-hover:text-primary">{label}</span>
        <span className="block text-[11px] leading-snug text-muted">{desc}</span>
      </span>
    </button>
  );
}

/**
 * Type-picker modal opened by a "＋ Add Container" button. Groups every container
 * type into searchable categories (icon + description) and lists the pre-designed
 * section templates (e.g. "The JHB Advantage") on top — picking either inserts a
 * fully-editable container at this position.
 */
export function AddContainerModal({
  onClose,
  onPick,
  onPickTemplate,
}: {
  onClose: () => void;
  onPick: (t: ContainerType) => void;
  onPickTemplate: (templateId: string) => void;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const match = (label: string, desc: string) =>
    !query || label.toLowerCase().includes(query) || desc.toLowerCase().includes(query);

  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: CONTAINER_TYPES.filter((t) => CONTAINER_META[t].cat === cat && match(CONTAINER_LABELS[t], CONTAINER_META[t].desc)),
  })).filter((g) => g.items.length > 0);
  const templates = SECTION_TEMPLATES.filter((t) => match(t.label, t.description ?? ""));
  const empty = groups.length === 0 && templates.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="my-8 w-full max-w-2xl rounded-2xl border border-ink/10 bg-surface shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
        {/* sticky header + search */}
        <div className="sticky top-0 z-10 rounded-t-2xl border-b border-ink/10 bg-surface/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">Add a container</h3>
            <button type="button" onClick={onClose} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs hover:bg-ink/[0.04]">✕</button>
          </div>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search container types…"
            className="mt-3 w-full rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <p className="mt-2 text-[11px] text-muted">Pick a type — it inserts at this position and becomes editable right here.</p>
        </div>

        <div className="max-h-[62vh] overflow-y-auto p-4">
          {empty && <p className="py-10 text-center text-sm text-muted">No containers match “{q}”.</p>}

          {templates.length > 0 && (
            <div className="mb-5">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Templates</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {templates.map((t) => (
                  <PickerCard key={t.id} icon="🧱" label={t.label} desc={t.description ?? ""} title={t.description} onClick={() => onPickTemplate(t.id)} />
                ))}
              </div>
            </div>
          )}

          {groups.map((g) => (
            <div key={g.cat} className="mb-5">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.cat}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {g.items.map((t) => (
                  <PickerCard key={t} icon={CONTAINER_META[t].icon} label={CONTAINER_LABELS[t]} desc={CONTAINER_META[t].desc} onClick={() => onPick(t)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** One inserted container, shown inline in the editor as a normal editable card. */
export function ContainerCard({
  container,
  sections,
  topZone,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onMoveToZone,
}: {
  container: PageContainer;
  sections: { label: string; zone: string }[];
  topZone: string;
  onChange: (c: PageContainer) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveToZone: (zone: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-base p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {CONTAINER_LABELS[container.type]} · added
          </span>
        </span>
        <div className="flex items-center gap-1">
          <select
            value={container.zone}
            onChange={(e) => onMoveToZone(e.target.value)}
            title="Move to another position"
            className="rounded-lg border border-ink/10 bg-surface px-1.5 py-1 text-[11px] outline-none focus:border-primary"
          >
            <option value={topZone}>Top of page</option>
            {sections.map((s) => (
              <option key={s.zone} value={s.zone}>After {s.label}</option>
            ))}
          </select>
          <button type="button" onClick={onMoveUp} className="rounded-lg border border-ink/10 px-2 py-1 text-xs">↑</button>
          <button type="button" onClick={onMoveDown} className="rounded-lg border border-ink/10 px-2 py-1 text-xs">↓</button>
          <button type="button" onClick={onDuplicate} className="rounded-lg border border-ink/10 px-2 py-1 text-xs hover:bg-ink/[0.04]">Duplicate</button>
          <button type="button" onClick={() => setCollapsed((c) => !c)} className="rounded-lg border border-ink/10 px-2 py-1 text-xs">{collapsed ? "Expand" : "Collapse"}</button>
          <button type="button" onClick={() => { if (confirm("Delete this container?")) onDelete(); }} className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50">Delete</button>
        </div>
      </div>
      {!collapsed && (
        <div className="mt-3 space-y-3">
          <ContainerBody container={container} onChange={onChange} />
          <details className="rounded-lg border border-ink/10 bg-surface p-2">
            <summary className="cursor-pointer text-[11px] font-medium text-muted">Style — background, spacing, alignment</summary>
            <div className="mt-2"><StyleControls style={container.style} onChange={(st) => onChange({ ...container, style: st })} /></div>
          </details>
        </div>
      )}
    </div>
  );
}
