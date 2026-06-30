"use client";

import { useState } from "react";
import { cloneContainer, createContainer, type ContainerType, type PageContainer } from "@jhb/shared/containers";
import { TEMPLATE_BY_ID } from "@jhb/shared/container-templates";
import { AddContainerModal, ContainerCard } from "@/components/ContainerParts";

export type NativeSection = { label: string; zone: string };

/**
 * Reusable "Add Container" engine for ANY page editor. Drop it into a manager:
 *
 *   const cb = usePageContainers(initial.containers ?? [], SECTIONS);
 *   // between section editors:  {cb.slot("after-hero")}
 *   // once at the end:          {cb.modal}
 *   // on save:                  save({ ...doc, containers: cb.containers })
 *
 * SECTIONS lists the page's native sections (label + the zone that follows each)
 * — the same zone keys the public <PageContainers zone> points use. This is the
 * single source of the unified, identical editing experience on every page;
 * future pages get the whole system by calling this hook.
 */
export function usePageContainers(initial: PageContainer[], sections: NativeSection[], topZone = "top") {
  const [containers, setContainers] = useState<PageContainer[]>(initial);
  // `setContainers` accepts an updater, so it plugs straight into the shared engine.
  const { slot, modal } = useContainerSlots(containers, setContainers, sections, topZone);
  return { containers, setContainers, slot, modal };
}

/**
 * Controlled variant of the same engine — for editors that already own the
 * container array elsewhere (e.g. Products, where each product row owns its
 * own `containers`). Pass the current value and an updater; it renders the
 * identical inline "Add Container" slots + modal, no internal copy of state.
 *
 *   const cb = useContainerSlots(p.containers ?? [], (next) => set(i, { containers: next(p.containers ?? []) }), SECTIONS);
 *   // between section editors:  {cb.slot("after-hero")}   once at the end: {cb.modal}
 */
export function useContainerSlots(
  containers: PageContainer[],
  setContainers: (updater: (cs: PageContainer[]) => PageContainer[]) => void,
  sections: NativeSection[],
  topZone = "top",
) {
  const [addZone, setAddZone] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const zoneItems = (zone: string) => containers.filter((c) => c.zone === zone);
  const addContainer = (zone: string, type: ContainerType) => {
    setContainers((cs) => [...cs, createContainer(type, zone)]);
    setAddZone(null);
  };
  const addTemplate = (zone: string, templateId: string) => {
    const t = TEMPLATE_BY_ID[templateId];
    if (!t) return;
    setContainers((cs) => [...cs, t.create(zone)]);
    setAddZone(null);
  };
  const updateContainer = (id: string, c: PageContainer) => setContainers((cs) => cs.map((x) => (x.id === id ? c : x)));
  const removeContainer = (id: string) => setContainers((cs) => cs.filter((x) => x.id !== id));
  const duplicateContainer = (id: string) =>
    setContainers((cs) => {
      const i = cs.findIndex((x) => x.id === id);
      if (i === -1) return cs;
      return [...cs.slice(0, i + 1), cloneContainer(cs[i]), ...cs.slice(i + 1)];
    });
  const moveInZone = (id: string, dir: -1 | 1) =>
    setContainers((cs) => {
      const c = cs.find((x) => x.id === id);
      if (!c) return cs;
      const sib = cs.filter((x) => x.zone === c.zone);
      const pos = sib.findIndex((x) => x.id === id);
      const t = pos + dir;
      if (t < 0 || t >= sib.length) return cs;
      const a = cs.findIndex((x) => x.id === id);
      const b = cs.findIndex((x) => x.id === sib[t].id);
      const n = [...cs];
      [n[a], n[b]] = [n[b], n[a]];
      return n;
    });
  const moveToZone = (id: string, zone: string) => setContainers((cs) => cs.map((x) => (x.id === id ? { ...x, zone } : x)));
  const reorderWithinZone = (targetId: string) =>
    setContainers((cs) => {
      if (!dragId || dragId === targetId) return cs;
      const drag = cs.find((x) => x.id === dragId);
      const target = cs.find((x) => x.id === targetId);
      if (!drag || !target || drag.zone !== target.zone) return cs;
      const without = cs.filter((x) => x.id !== dragId);
      const ti = without.findIndex((x) => x.id === targetId);
      return [...without.slice(0, ti), drag, ...without.slice(ti)];
    });

  const slot = (zone: string) => (
    <>
      <button
        type="button"
        onClick={() => setAddZone(zone)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink/15 py-2 text-xs font-medium text-muted transition hover:border-primary hover:bg-primary/5 hover:text-primary"
      >
        <span aria-hidden>＋</span> Add Container
      </button>
      {zoneItems(zone).map((c) => (
        <ContainerCard
          key={c.id}
          container={c}
          sections={sections}
          topZone={topZone}
          onChange={(nc) => updateContainer(c.id, nc)}
          onMoveUp={() => moveInZone(c.id, -1)}
          onMoveDown={() => moveInZone(c.id, 1)}
          onDuplicate={() => duplicateContainer(c.id)}
          onDelete={() => removeContainer(c.id)}
          onMoveToZone={(z) => moveToZone(c.id, z)}
          dragId={dragId}
          setDragId={setDragId}
          onReorderDrop={(targetId) => reorderWithinZone(targetId)}
        />
      ))}
    </>
  );

  const modal =
    addZone !== null ? (
      <AddContainerModal
        onClose={() => setAddZone(null)}
        onPick={(t) => {
          if (addZone !== null) addContainer(addZone, t);
        }}
        onPickTemplate={(id) => {
          if (addZone !== null) addTemplate(addZone, id);
        }}
      />
    ) : null;

  return { slot, modal };
}
