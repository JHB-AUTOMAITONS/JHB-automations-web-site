"use client";

import { useState } from "react";
import { aiSiteAudit, type SiteAudit } from "../actions";

function scoreColor(s: number) {
  return s >= 90 ? "text-green-600" : s >= 70 ? "text-amber-600" : "text-red-600";
}
function scoreBg(s: number) {
  return s >= 90 ? "bg-green-100 text-green-700" : s >= 70 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
}

export default function ReportsPage() {
  const [limit, setLimit] = useState("20");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [audit, setAudit] = useState<SiteAudit | null>(null);

  const run = async () => {
    setBusy(true); setError(""); setAudit(null);
    try {
      const res = await aiSiteAudit({ limit: Number(limit) || 20 });
      if (res.ok) setAudit(res.audit);
      else setError(res.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Audit failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">SEO Reports — Site Audit</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Crawls your published pages (from sitemap.xml), scores each with the built-in SEO engine, and lists the
        highest-impact issues. Runs free — no API key needed.
      </p>

      <div className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Max pages</span>
          <input
            type="number"
            min={1}
            max={50}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="w-24 rounded-xl border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
        <button onClick={run} disabled={busy} className="btn btn-primary !py-2.5 !text-sm disabled:opacity-60">
          {busy ? "Auditing…" : "🔬 Run site audit"}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {busy && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-ink/10 bg-surface p-6 text-sm text-muted shadow-soft">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Crawling & scoring pages…
        </div>
      )}

      {audit && (
        <div className="mt-6 space-y-6">
          {/* overall */}
          <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
            <div className="text-center">
              <div className={`font-display text-5xl font-bold ${scoreColor(audit.overallScore)}`}>{audit.overallScore}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted">Overall / 100</div>
            </div>
            <div className="text-sm text-muted">
              <p><strong className="text-ink">{audit.pagesAnalyzed}</strong> pages analyzed{audit.totalFound > audit.pagesAnalyzed ? ` of ${audit.totalFound} found` : ""}.</p>
              <p className="mt-1">{audit.note}</p>
              <p className="mt-1 text-xs">Base: {audit.base}</p>
            </div>
          </div>

          {/* issue summary */}
          {audit.issueCounts.length > 0 && (
            <div className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">Top issues across the site</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {audit.issueCounts.map((i) => (
                  <span key={i.title} className="rounded-full border border-ink/10 bg-base px-3 py-1 text-xs">
                    {i.title} <strong className="text-red-600">×{i.count}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* per-page */}
          <div className="overflow-hidden rounded-2xl border border-ink/10">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-2.5">Score</th>
                  <th className="px-4 py-2.5">Page</th>
                  <th className="px-4 py-2.5">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {audit.pages.map((p) => (
                  <tr key={p.url} className="bg-base/50 align-top">
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${scoreBg(p.score)}`}>{p.score}</span>
                    </td>
                    <td className="max-w-[22rem] px-4 py-3">
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">
                        {p.url.replace(audit.base, "") || "/"}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {p.issues.length === 0 ? (
                        <span className="text-xs text-green-600">No major issues 🎉</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {p.issues.map((iss, idx) => (
                            <span key={idx} className="rounded-md bg-ink/[0.04] px-2 py-0.5 text-[11px] text-muted ring-1 ring-ink/10">{iss}</span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
