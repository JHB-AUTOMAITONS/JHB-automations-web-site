"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientLogo } from "@jhb/shared/client-logos";
import {
  updateClientLogo,
  createClientLogo,
  deleteClientLogo,
  reorderClientLogos,
} from "@/app/actions";
import LogoUploader, { uploadOptimizedLogo } from "./LogoUploader";

type Toast = { type: "success" | "error"; msg: string } | null;
type Row = { id: string; logo_url: string | null; alt_text: string; active: boolean };

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

const toRow = (c: ClientLogo): Row => ({
  id: c.id,
  logo_url: c.logo_url,
  alt_text: c.alt_text ?? "",
  active: c.active,
});

export default function ClientLogoManager({ initial }: { initial: ClientLogo[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initial.map(toRow));
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [adding, setAdding] = useState<{ done: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const addRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!orderDirty) setRows(initial.map(toRow));
  }, [initial, orderDirty]);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const orig = (id: string) => initial.find((c) => c.id === id);
  const isDirty = (r: Row) => {
    const o = orig(r.id);
    if (!o) return false;
    return (o.logo_url ?? null) !== (r.logo_url ?? null) || (o.alt_text ?? "") !== r.alt_text || o.active !== r.active;
  };

  const set = (i: number, patch: Partial<Row>) => setRows((p) => p.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return;
    setRows((p) => {
      const n = [...p];
      const [m] = n.splice(from, 1);
      n.splice(to, 0, m);
      return n;
    });
    setOrderDirty(true);
  };
  const onDrop = (target: number) => {
    if (dragIndex === null || dragIndex === target) return setDragIndex(null);
    move(dragIndex, target);
    setDragIndex(null);
  };

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) => {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (res.ok) { flash({ type: "success", msg: ok }); router.refresh(); return true; }
    flash({ type: "error", msg: res.error || "Action failed." });
    return false;
  };

  const saveRow = (r: Row) =>
    run(() => updateClientLogo(r.id, { logo_url: r.logo_url, alt_text: r.alt_text, active: r.active }), "Saved.");

  // Persist a logo immediately on upload/remove — no separate Save click needed.
  const onLogoChange = async (i: number, url: string | null) => {
    const r = { ...rows[i], logo_url: url };
    set(i, { logo_url: url });
    setBusy(true);
    const res = await updateClientLogo(r.id, { logo_url: r.logo_url, alt_text: r.alt_text, active: r.active });
    setBusy(false);
    if (res.ok) { flash({ type: "success", msg: url ? "Logo uploaded & saved." : "Logo removed." }); router.refresh(); }
    else flash({ type: "error", msg: res.error || "Save failed." });
  };

  const saveOrder = async () => {
    if (await run(() => reorderClientLogos(rows.map((r) => r.id)), "Order saved.")) setOrderDirty(false);
  };

  // Add one or more logos (optimized upload → new rows). Name auto-derived (internal only).
  const addLogos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    setAdding({ done: 0, total: arr.length });
    setBusy(true);
    for (let i = 0; i < arr.length; i++) {
      try {
        const base = arr[i].name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || `logo-${i + 1}`;
        const r = await uploadOptimizedLogo(arr[i]);
        await createClientLogo(base, r.url, `${base} logo`);
      } catch {
        /* skip a failed file, continue */
      }
      setAdding({ done: i + 1, total: arr.length });
    }
    setBusy(false);
    setAdding(null);
    flash({ type: "success", msg: `Added ${arr.length} logo${arr.length === 1 ? "" : "s"}.` });
    router.refresh();
  };

  return (
    <div className="mt-8">
      {toast && (
        <div className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>
      )}

      {/* Add logos */}
      <div className="rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft">
        <input ref={addRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" multiple className="hidden" onChange={(e) => addLogos(e.target.files)} />
        <div
          onClick={() => !busy && addRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!busy) addLogos(e.dataTransfer.files); }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-ink/15 hover:border-primary/50"}`}
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-xl text-primary">⬆</span>
          <p className="mt-3 font-medium">{adding ? `Adding ${adding.done}/${adding.total}…` : "Add client logos"}</p>
          <p className="mt-1 text-xs text-muted">Drop logos or click to browse — PNG, SVG, WebP, JPG · auto-compressed to WebP · bulk supported</p>
        </div>
      </div>

      {/* toolbar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft">
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{rows.length}</span> logo{rows.length === 1 ? "" : "s"} ·{" "}
          <span className="font-semibold text-green-600">{rows.filter((r) => r.active && r.logo_url).length}</span> shown on site
        </p>
        <div className="flex items-center gap-2">
          <a href={`${WEBSITE_URL}/#clients`} target="_blank" className="text-xs text-primary hover:underline">Preview ↗</a>
          {orderDirty && <button onClick={saveOrder} disabled={busy} className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60">Save order</button>}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-ink/15 bg-surface p-10 text-center text-sm text-muted">
          No logos yet. Upload one above.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((r, i) => (
            <div
              key={r.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className={`rounded-2xl border bg-surface p-4 shadow-soft ${dragIndex === i ? "border-primary opacity-60" : "border-ink/10"} ${!r.active ? "opacity-70" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-muted">
                  <span className="cursor-grab select-none active:cursor-grabbing" title="Drag to reorder">⠿</span>
                  #{i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs disabled:opacity-30">↑</button>
                  <button onClick={() => move(i, i + 1)} disabled={i === rows.length - 1} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs disabled:opacity-30">↓</button>
                  <button onClick={() => { if (confirm("Delete this logo?")) run(() => deleteClientLogo(r.id), "Logo deleted."); }} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
                </div>
              </div>

              <div className="mt-3">
                <LogoUploader value={r.logo_url} onChange={(u) => onLogoChange(i, u)} />
              </div>

              <label className="mt-3 block"><span className="mb-1 block text-[11px] font-medium text-muted">Image alt text</span>
                <input value={r.alt_text} onChange={(e) => set(i, { alt_text: e.target.value })} placeholder="Describe the logo for SEO & accessibility" className="input" /></label>

              <div className="mt-2 flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={r.active} onChange={(e) => set(i, { active: e.target.checked })} />Show on website</label>
                {isDirty(r) && <button onClick={() => saveRow(r)} disabled={busy} className="btn btn-primary !px-4 !py-1.5 !text-xs disabled:opacity-60">Save</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
