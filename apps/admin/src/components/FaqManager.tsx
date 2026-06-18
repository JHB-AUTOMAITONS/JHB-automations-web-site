"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveServiceFaqs } from "@/app/actions";
import type { InternalPage } from "@jhb/shared/service-pages";
import RichEditor from "./RichEditor";

type Faq = { question: string; answer: string };
type Service = { key: string; title: string };
type Toast = { type: "success" | "error"; msg: string } | null;

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export default function FaqManager({
  services,
  faqsByService,
  internalPages = [],
}: {
  services: Service[];
  faqsByService: Record<string, Faq[]>;
  internalPages?: InternalPage[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(services[0]?.key ?? "");
  const [items, setItems] = useState<Faq[]>(faqsByService[selected] ?? []);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const switchService = (key: string) => {
    setSelected(key);
    setItems(faqsByService[key] ?? []);
  };

  const update = (i: number, field: keyof Faq, v: string) =>
    setItems((p) => p.map((x, idx) => (idx === i ? { ...x, [field]: v } : x)));
  const add = () =>
    setItems((p) => [...p, { question: "", answer: "" }]);
  const remove = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    setItems((p) => {
      const next = [...p];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const onDrop = (target: number) => {
    if (dragIndex === null || dragIndex === target) return;
    move(dragIndex, target);
    setDragIndex(null);
  };

  const save = async () => {
    setBusy(true);
    const res = await saveServiceFaqs(selected, items);
    setBusy(false);
    if (res.ok) {
      flash({ type: "success", msg: "FAQs saved." });
      // keep local copy in sync so switching away/back shows saved state
      faqsByService[selected] = items;
      router.refresh();
    } else {
      flash({ type: "error", msg: res.error || "Save failed." });
    }
  };

  return (
    <div className="mt-8">
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Service:</span>
          <select
            value={selected}
            onChange={(e) => switchService(e.target.value)}
            className="rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {services.map((s) => (
              <option key={s.key} value={s.key}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <a
            href={`${WEBSITE_URL}/services/${selected}#faq`}
            target="_blank"
            className="text-xs text-primary hover:underline"
          >
            View on site ↗
          </a>
          <button
            onClick={add}
            className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-primary"
          >
            + Add FAQ
          </button>
          <button
            onClick={save}
            disabled={busy}
            className="btn btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save FAQs"}
          </button>
        </div>
      </div>

      {/* list */}
      <div className="mt-5 space-y-3">
        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-surface p-8 text-center text-sm text-muted">
            No FAQs for this service yet. Click <b>Add FAQ</b> to create one.
          </div>
        )}
        {items.map((f, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            className={`rounded-2xl border bg-surface p-4 shadow-soft transition-shadow ${
              dragIndex === i ? "border-primary opacity-60" : "border-ink/10"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-2 cursor-grab select-none text-muted active:cursor-grabbing"
                title="Drag to reorder"
              >
                ⠿
              </span>
              <div className="flex-1 space-y-2">
                <input
                  value={f.question}
                  onChange={(e) => update(i, "question", e.target.value)}
                  placeholder="Question"
                  className="w-full rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm font-medium outline-none focus:border-primary"
                />
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-muted">Answer (rich text)</label>
                  <RichEditor
                    value={f.answer}
                    onChange={(html) => update(i, "answer", html)}
                    internalPages={internalPages}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs text-muted transition-colors hover:text-ink disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(i, i + 1)}
                  disabled={i === items.length - 1}
                  className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs text-muted transition-colors hover:text-ink disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={() => remove(i)}
                  className="grid h-7 w-7 place-items-center rounded-md border border-ink/10 text-xs text-muted transition-colors hover:border-red-300 hover:text-red-500"
                  aria-label="Delete FAQ"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
