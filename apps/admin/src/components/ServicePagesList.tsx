"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ServicePageSummary } from "@jhb/shared/service-pages";
import {
  duplicateServicePage,
  resetServicePage,
} from "@/app/actions";
import { withTimeout, actionErrorMessage } from "@/lib/asyncAction";
import LocalDateTime from "./LocalDateTime";

type Toast = { type: "success" | "error"; msg: string } | null;
const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

const EDITED_FMT: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" };

export default function ServicePagesList({ items }: { items: ServicePageSummary[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [dupFrom, setDupFrom] = useState<ServicePageSummary | null>(null);
  const [dupTo, setDupTo] = useState("");

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await withTimeout(fn());
      if (res.ok) {
        flash({ type: "success", msg: ok });
        router.refresh();
      } else flash({ type: "error", msg: res.error || "Action failed." });
    } catch (e) {
      flash({ type: "error", msg: actionErrorMessage(e, "Action failed. Please try again.") });
    } finally {
      setBusy(false);
    }
  };

  const doDuplicate = async () => {
    if (!dupFrom || !dupTo) return;
    await run(() => duplicateServicePage(dupFrom.key, dupTo), "Content copied.");
    setDupFrom(null);
    setDupTo("");
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

      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-surface shadow-soft">
        <div className="divide-y divide-ink/[0.06]">
          {items.map((s) => (
            <div key={s.key} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-display text-sm font-semibold">{s.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      s.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {s.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  /{s.slug} · edited{" "}
                  <LocalDateTime value={s.content_updated_at} options={EDITED_FMT} fallback="—" />
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  href={`/service-pages/${s.key}`}
                  className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary"
                >
                  Edit
                </Link>
                <a
                  href={`${WEBSITE_URL}/${s.slug}`}
                  target="_blank"
                  className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary"
                >
                  Preview ↗
                </a>
                <button
                  onClick={() => {
                    setDupFrom(s);
                    setDupTo("");
                  }}
                  disabled={busy}
                  className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-60"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Reset "${s.title}" content to defaults? Stored content will be cleared.`))
                      run(() => resetServicePage(s.key), "Reset to defaults.");
                  }}
                  disabled={busy}
                  className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-500 disabled:opacity-60"
                >
                  Reset
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* duplicate modal */}
      {dupFrom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft-lg">
            <h3 className="font-display text-base font-bold">Duplicate content</h3>
            <p className="mt-1 text-sm text-muted">
              Copy <b>{dupFrom.title}</b>&apos;s content into another service (saved as draft).
            </p>
            <select
              value={dupTo}
              onChange={(e) => setDupTo(e.target.value)}
              className="input mt-3"
            >
              <option value="">Select target service…</option>
              {items
                .filter((i) => i.key !== dupFrom.key)
                .map((i) => (
                  <option key={i.key} value={i.key}>{i.title}</option>
                ))}
            </select>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setDupFrom(null)} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:text-ink">
                Cancel
              </button>
              <button onClick={doDuplicate} disabled={!dupTo || busy} className="btn btn-primary !px-5 !py-2 !text-sm disabled:opacity-60">
                Copy content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
