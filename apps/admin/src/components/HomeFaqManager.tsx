"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { HomeFaq } from "@jhb/shared/home-faqs";
import {
  createHomeFaq,
  updateHomeFaq,
  deleteHomeFaq,
  setHomeFaqActive,
  reorderHomeFaqs,
  seedHomeFaqs,
} from "@/app/actions";

type Toast = { type: "success" | "error"; msg: string } | null;
type Row = { id: string; question: string; answer: string; active: boolean };

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export default function HomeFaqManager({ initial }: { initial: HomeFaq[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>(initial.map((f) => ({ id: f.id, question: f.question, answer: f.answer, active: f.active })));
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ question: "", answer: "", active: true });

  useEffect(() => {
    if (!orderDirty) setRows(initial.map((f) => ({ id: f.id, question: f.question, answer: f.answer, active: f.active })));
  }, [initial, orderDirty]);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const orig = (id: string) => initial.find((f) => f.id === id);
  const isDirty = (r: Row) => {
    const o = orig(r.id);
    return !o || o.question !== r.question || o.answer !== r.answer;
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
    if (res.ok) {
      flash({ type: "success", msg: ok });
      router.refresh();
      return true;
    }
    flash({ type: "error", msg: res.error || "Action failed." });
    return false;
  };

  const saveRow = (r: Row) => run(() => updateHomeFaq(r.id, { question: r.question, answer: r.answer, active: r.active }), "FAQ saved.");
  const saveOrder = async () => {
    const okk = await run(() => reorderHomeFaqs(rows.map((r) => r.id)), "Order saved.");
    if (okk) setOrderDirty(false);
  };
  const add = async () => {
    if (!addForm.question.trim() || !addForm.answer.trim()) return flash({ type: "error", msg: "Question and answer are required." });
    const okk = await run(() => createHomeFaq(addForm), "FAQ added.");
    if (okk) {
      setAddOpen(false);
      setAddForm({ question: "", answer: "", active: true });
    }
  };

  return (
    <div className="mt-8">
      {toast && (
        <div className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft">
        <p className="text-sm text-muted">
          <span className="font-semibold text-ink">{rows.length}</span> FAQ{rows.length === 1 ? "" : "s"} ·{" "}
          <span className="font-semibold text-green-600">{rows.filter((r) => r.active).length}</span> active
        </p>
        <div className="flex items-center gap-2">
          <a href={`${WEBSITE_URL}/#faq`} target="_blank" className="text-xs text-primary hover:underline">Preview on site ↗</a>
          {orderDirty && <button onClick={saveOrder} disabled={busy} className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-60">Save order</button>}
          <button onClick={() => setAddOpen(true)} className="btn btn-primary !px-5 !py-2.5 !text-sm">+ Add FAQ</button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-ink/15 bg-surface p-10 text-center">
          <p className="text-sm text-muted">No FAQs yet.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => setAddOpen(true)} className="btn btn-primary !px-5 !py-2.5 !text-sm">+ Add your first FAQ</button>
            <button onClick={() => run(seedHomeFaqs, "Imported default FAQs.")} disabled={busy} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-60">Import current FAQs</button>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {rows.map((r, i) => (
            <div
              key={r.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className={`rounded-2xl border bg-surface p-4 shadow-soft ${dragIndex === i ? "border-primary opacity-60" : "border-ink/10"} ${!r.active ? "opacity-70" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-2 cursor-grab select-none text-muted active:cursor-grabbing" title="Drag to reorder">⠿</span>
                <div className="flex-1 space-y-2">
                  <input value={r.question} onChange={(e) => set(i, { question: e.target.value })} placeholder="Question" className="input font-medium" />
                  <textarea value={r.answer} onChange={(e) => set(i, { answer: e.target.value })} placeholder="Answer" rows={2} className="input resize-none" />
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.active ? "bg-green-100 text-green-700" : "bg-ink/[0.06] text-muted"}`}>{r.active ? "Active" : "Inactive"}</span>
                    <button onClick={() => run(() => setHomeFaqActive(r.id, !r.active), r.active ? "Unpublished." : "Published.")} disabled={busy} className="text-xs font-medium text-muted hover:text-primary disabled:opacity-60">{r.active ? "Unpublish" : "Publish"}</button>
                    {isDirty(r) && <button onClick={() => saveRow(r)} disabled={busy} className="rounded-lg border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary/5 disabled:opacity-60">Save</button>}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs disabled:opacity-30">↑</button>
                  <button onClick={() => move(i, i + 1)} disabled={i === rows.length - 1} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs disabled:opacity-30">↓</button>
                  <button onClick={() => { if (confirm("Delete this FAQ?")) run(() => deleteHomeFaq(r.id), "FAQ deleted."); }} className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-lg rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Add FAQ</h2>
              <button onClick={() => setAddOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-ink/[0.05]">✕</button>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block"><span className="mb-1 block text-xs font-medium text-muted">Question *</span>
                <input value={addForm.question} onChange={(e) => setAddForm((f) => ({ ...f, question: e.target.value }))} className="input" /></label>
              <label className="block"><span className="mb-1 block text-xs font-medium text-muted">Answer *</span>
                <textarea value={addForm.answer} onChange={(e) => setAddForm((f) => ({ ...f, answer: e.target.value }))} rows={4} className="input resize-none" /></label>
              <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={addForm.active} onChange={(e) => setAddForm((f) => ({ ...f, active: e.target.checked }))} />Active (visible on site)</label>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button onClick={() => setAddOpen(false)} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:text-ink">Cancel</button>
              <button onClick={add} disabled={busy} className="btn btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60">Add FAQ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
