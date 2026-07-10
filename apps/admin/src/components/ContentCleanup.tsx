"use client";

import { useState } from "react";
import { cleanAllContent, type CleanupTableReport } from "@/app/actions";

// Admin maintenance tool: strip pasted-from-Word/Google-Docs/Office formatting
// artifacts from ALL stored content in one pass. Dry-run first (no writes) so the
// admin can review exactly what would change before applying.
export default function ContentCleanup() {
  const [report, setReport] = useState<CleanupTableReport[] | null>(null);
  const [busy, setBusy] = useState<null | "dry" | "apply">(null);
  const [applied, setApplied] = useState(false);
  const [err, setErr] = useState("");

  const run = async (apply: boolean) => {
    if (
      apply &&
      !window.confirm(
        "Permanently clean pasted-from-Word formatting from ALL stored content?\n\nOnly fields that contain Word/Office junk are changed; normal formatting (headings, bold, lists, tables, links, images) is preserved. Run a preview first if unsure.",
      )
    ) {
      return;
    }
    setBusy(apply ? "apply" : "dry");
    setErr("");
    try {
      const res = await cleanAllContent(apply);
      if (!res.ok) {
        setErr(res.error || "Cleanup failed.");
        return;
      }
      setReport(res.report ?? []);
      setApplied(apply);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const totalFields = (report ?? []).reduce((n, r) => n + r.fieldsCleaned, 0);
  const totalRecords = (report ?? []).reduce((n, r) => n + r.recordsChanged, 0);

  return (
    <div className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => run(false)}
          disabled={busy !== null}
          className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {busy === "dry" ? "Scanning…" : "Preview (dry-run)"}
        </button>
        <button
          type="button"
          onClick={() => run(true)}
          disabled={busy !== null}
          className="btn btn-primary !px-5 !py-2 !text-sm disabled:opacity-60"
        >
          {busy === "apply" ? "Cleaning…" : "Clean content now"}
        </button>
        <span className="text-xs text-muted">
          Dry-run only reports what would change — nothing is written until you click “Clean content now”.
        </span>
      </div>

      {err && <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}

      {report && (
        <div className="mt-4">
          <p className="text-sm font-semibold">
            {applied ? "✓ Cleaned" : "Preview"}: {totalFields} field{totalFields === 1 ? "" : "s"} across {totalRecords}{" "}
            record{totalRecords === 1 ? "" : "s"}
            {applied ? " updated." : " would be cleaned."}
            {!applied && totalFields > 0 && " Click “Clean content now” to apply."}
            {totalFields === 0 && " No Word/Office artifacts found — content is already clean."}
          </p>
          <div className="mt-3 overflow-x-auto rounded-xl border border-ink/10">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink/10 bg-ink/[0.02] text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">Table</th>
                  <th className="px-3 py-2 font-semibold">Scanned</th>
                  <th className="px-3 py-2 font-semibold">Records changed</th>
                  <th className="px-3 py-2 font-semibold">Fields cleaned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {report.map((r) => (
                  <tr key={r.table} className={r.error ? "bg-red-50" : r.fieldsCleaned > 0 ? "bg-green-50/40" : ""}>
                    <td className="px-3 py-2 font-mono text-xs">{r.table}</td>
                    <td className="px-3 py-2 text-muted">{r.scanned}</td>
                    <td className="px-3 py-2">{r.recordsChanged}</td>
                    <td className="px-3 py-2 font-semibold">
                      {r.error ? <span className="text-red-600">error: {r.error}</span> : r.fieldsCleaned}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.some((r) => r.samples.length > 0) && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Sample changes (before → after)</p>
              <div className="mt-2 space-y-1">
                {report.flatMap((r) => r.samples).slice(0, 12).map((s, i) => (
                  <p key={i} className="truncate rounded bg-ink/[0.03] px-2 py-1 font-mono text-[11px] text-muted" title={s}>
                    {s}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
