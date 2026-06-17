"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveContent } from "@/app/actions";
import type { StatsContent, StatItem } from "@jhb/shared/content";

/**
 * "Why Choose Us" statistics editor — moved here from the old standalone
 * Content page. Saves to jhb_content ("stats") and goes live instantly
 * (independent of the Home draft/publish flow).
 */
export default function StatsManager({ initial }: { initial: StatsContent }) {
  const router = useRouter();
  const [items, setItems] = useState<StatItem[]>(initial.items);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const update = (i: number, k: keyof StatItem, v: string) =>
    setItems((p) =>
      p.map((it, idx) => (idx === i ? { ...it, [k]: k === "value" ? Number(v) || 0 : v } : it))
    );

  const save = async () => {
    setState("saving");
    const res = await saveContent("stats", { items });
    setState(res.ok ? "saved" : "error");
    if (res.ok) router.refresh();
    setTimeout(() => setState("idle"), 2500);
  };

  const cls =
    "w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {items.map((it, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_90px_2fr]">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Value</span>
              <input value={String(it.value)} onChange={(e) => update(i, "value", e.target.value)} className={cls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Suffix</span>
              <input value={it.suffix} onChange={(e) => update(i, "suffix", e.target.value)} className={cls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Label</span>
              <input value={it.label} onChange={(e) => update(i, "label", e.target.value)} className={cls} />
            </label>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button onClick={save} disabled={state === "saving"} className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">
          Save Statistics
        </button>
        {state === "saving" && <span className="text-xs text-muted">Saving…</span>}
        {state === "saved" && <span className="text-xs text-green-600">✓ Saved</span>}
        {state === "error" && <span className="text-xs text-red-500">Error saving</span>}
      </div>
    </div>
  );
}
