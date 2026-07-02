"use client";

import { Fragment, useState } from "react";
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
  // `addAt` remembers WHERE the modal will insert: the zone plus the position
  // within that zone (0 = before the first container, n = after the last).
  const [addAt, setAddAt] = useState<{ zone: string; index: number } | null>(null);

  const zoneItems = (zone: string) => containers.filter((c) => c.zone === zone);
  // Splice a new container into the flat array so it lands at `index` within its
  // zone. This is what lets the "＋" buttons between every card insert exactly
  // where they sit instead of always appending to the end.
  const insertAt = (zone: string, index: number, item: PageContainer) =>
    setContainers((cs) => {
      const sib = cs.filter((c) => c.zone === zone);
      let flat: number;
      if (index >= sib.length) {
        const last = sib[sib.length - 1];
        flat = last ? cs.findIndex((c) => c.id === last.id) + 1 : cs.length;
      } else {
        flat = cs.findIndex((c) => c.id === sib[index].id);
      }
      return [...cs.slice(0, flat), item, ...cs.slice(flat)];
    });
  const addContainer = (zone: string, index: number, type: ContainerType) => {
    insertAt(zone, index, createContainer(type, zone));
    setAddAt(null);
  };
  const addTemplate = (zone: string, index: number, templateId: string) => {
    const t = TEMPLATE_BY_ID[templateId];
    if (!t) return;
    insertAt(zone, index, t.create(zone));
    setAddAt(null);
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

  // A "＋ Add Container" insert affordance. `prominent` = the always-solid button
  // shown after the last card and on an empty zone; the before/between ones stay
  // faint until hover but remain in the DOM so an insert point always exists next
  // to every container (this is the fix for the button vanishing between cards).
  const insertBtn = (zone: string, index: number, prominent: boolean) => (
    <button
      key={`ins-${zone}-${index}`}
      type="button"
      onClick={() => setAddAt({ zone, index })}
      className={
        prominent
          ? "flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink/15 py-2 text-xs font-medium text-muted transition hover:border-primary hover:bg-primary/5 hover:text-primary"
          : "flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-ink/10 py-1 text-[11px] font-medium text-muted/60 opacity-60 transition hover:border-primary hover:bg-primary/5 hover:text-primary hover:opacity-100"
      }
    >
      <span aria-hidden>＋</span> Add Container
    </button>
  );

  const slot = (zone: string) => {
    const items = zoneItems(zone);
    if (items.length === 0) return insertBtn(zone, 0, true);
    return (
      <>
        {insertBtn(zone, 0, false)}
        {items.map((c, i) => (
          <Fragment key={c.id}>
            <ContainerCard
              container={c}
              sections={sections}
              topZone={topZone}
              onChange={(nc) => updateContainer(c.id, nc)}
              onMoveUp={() => moveInZone(c.id, -1)}
              onMoveDown={() => moveInZone(c.id, 1)}
              onDuplicate={() => duplicateContainer(c.id)}
              onDelete={() => removeContainer(c.id)}
              onMoveToZone={(z) => moveToZone(c.id, z)}
            />
            {insertBtn(zone, i + 1, i === items.length - 1)}
          </Fragment>
        ))}
      </>
    );
  };

  const modal =
    addAt !== null ? (
      <AddContainerModal
        onClose={() => setAddAt(null)}
        onPick={(t) => addContainer(addAt.zone, addAt.index, t)}
        onPickTemplate={(id) => addTemplate(addAt.zone, addAt.index, id)}
      />
    ) : null;

  return { slot, modal };
}
