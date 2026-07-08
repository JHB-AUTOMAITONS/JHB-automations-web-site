"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { restoreVersion, deleteVersion } from "@/app/actions";
import { withTimeout, actionErrorMessage } from "@/lib/asyncAction";
import LocalDateTime from "./LocalDateTime";

export type VersionRow = {
  id: string;
  module: string;
  label: string | null;
  version_number: number;
  summary: string | null;
  user_email: string | null;
  created_at: string;
};

type Toast = { type: "success" | "error"; msg: string } | null;

export default function VersionHistory({ versions }: { versions: VersionRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  };

  // Group by module, newest version first within each group.
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; rows: VersionRow[] }>();
    for (const v of versions) {
      const g = map.get(v.module) ?? { label: v.label || v.module, rows: [] };
      g.rows.push(v);
      map.set(v.module, g);
    }
    for (const g of map.values()) g.rows.sort((a, b) => b.version_number - a.version_number);
    return Array.from(map.entries()).sort((a, b) =>
      (a[1].label || "").localeCompare(b[1].label || "")
    );
  }, [versions]);

  const restore = async (v: VersionRow) => {
    if (busy) return;
    if (!confirm(`Restore "${v.label || v.module}" to version ${v.version_number}?\n\nThis overwrites the current content with this snapshot. A new version is saved so you can undo the restore.`))
      return;
    setBusy(v.id);
    try {
      const res = await withTimeout(restoreVersion(v.id));
      if (res.ok) {
        flash({ type: "success", msg: `Restored to version ${v.version_number}. Now live.` });
        router.refresh();
      } else flash({ type: "error", msg: res.error || "Restore failed." });
    } catch (e) {
      flash({ type: "error", msg: actionErrorMessage(e, "Restore failed. Please try again.") });
    } finally {
      setBusy(null);
    }
  };

  const remove = async (v: VersionRow) => {
    if (busy) return;
    if (!confirm(`Permanently delete version ${v.version_number} of "${v.label || v.module}"? This cannot be undone.`))
      return;
    setBusy(v.id);
    try {
      const res = await withTimeout(deleteVersion(v.id));
      if (res.ok) {
        flash({ type: "success", msg: "Version deleted." });
        router.refresh();
      } else flash({ type: "error", msg: res.error || "Delete failed." });
    } catch (e) {
      flash({ type: "error", msg: actionErrorMessage(e, "Delete failed. Please try again.") });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      {toast && (
        <div className={`fixed right-6 top-6 z-[60] rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>
      )}

      <h1 className="font-display text-2xl font-bold sm:text-3xl">Version History</h1>
      <p className="mt-1 text-sm text-muted">
        Every save creates a full snapshot. Restore any module to an earlier version — restoring is
        confirmed first and itself saved as a new version, so nothing is ever lost.
      </p>

      {groups.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-ink/10 bg-surface p-10 text-center text-sm text-muted shadow-soft">
          No version snapshots yet. Edit and save a module (Home, JHB Products, Service Pages, SEO or
          Settings) and its versions will appear here.
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {groups.map(([module, g]) => (
            <section key={module} className="overflow-hidden rounded-2xl border border-ink/10 bg-surface shadow-soft">
              <div className="flex items-center justify-between border-b border-ink/10 bg-ink/[0.02] px-5 py-3">
                <h2 className="font-display text-base font-semibold">{g.label}</h2>
                <span className="text-xs text-muted">{g.rows.length} version{g.rows.length === 1 ? "" : "s"}</span>
              </div>
              <ul className="divide-y divide-ink/5">
                {g.rows.map((v, idx) => (
                  <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">v{v.version_number}</span>
                        {idx === 0 && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Current</span>}
                        <span className="truncate text-ink">{v.summary || "Saved"}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        <LocalDateTime value={v.created_at} mode="datetime" /> · {v.user_email || "unknown"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => restore(v)}
                        disabled={busy === v.id || idx === 0}
                        title={idx === 0 ? "This is the current version" : "Restore this version"}
                        className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary disabled:opacity-40"
                      >
                        {busy === v.id ? "Restoring…" : "Restore"}
                      </button>
                      <button
                        onClick={() => remove(v)}
                        disabled={busy === v.id}
                        className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-500 disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
