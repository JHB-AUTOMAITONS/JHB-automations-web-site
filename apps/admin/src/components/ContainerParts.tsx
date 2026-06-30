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

/**
 * Type-picker modal opened by a "＋ Add Container" button. Lists pre-designed
 * section templates (e.g. "The JHB Advantage") alongside the generic container
 * types — picking either inserts a fully-editable container at this position.
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold">Add a container</h3>
          <button type="button" onClick={onClose} className="rounded-lg border border-ink/10 px-2.5 py-1 text-xs">✕</button>
        </div>
        <p className="mt-1 text-xs text-muted">Choose a type — it inserts at this position and becomes editable right here.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {CONTAINER_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onPick(t)}
              className="rounded-xl border border-ink/10 bg-base px-3 py-3 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              {CONTAINER_LABELS[t]}
            </button>
          ))}
          {SECTION_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onPickTemplate(t.id)}
              title={t.description}
              className="rounded-xl border border-ink/10 bg-base px-3 py-3 text-sm font-medium transition hover:border-primary hover:text-primary"
            >
              {t.label}
            </button>
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
  dragId,
  setDragId,
  onReorderDrop,
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
  dragId: string | null;
  setDragId: (id: string | null) => void;
  onReorderDrop: (targetId: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      draggable
      onDragStart={() => setDragId(container.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        onReorderDrop(container.id);
        setDragId(null);
      }}
      onDragEnd={() => setDragId(null)}
      className={`rounded-2xl border-2 border-dashed border-primary/40 bg-base p-4 ${dragId === container.id ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="cursor-grab select-none text-muted active:cursor-grabbing" title="Drag to reorder">⠿</span>
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
