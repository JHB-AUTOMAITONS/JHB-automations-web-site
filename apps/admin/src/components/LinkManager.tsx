"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveServiceLinks } from "@/app/actions";

type Service = { key: string; title: string };
type Page = { label: string; url: string };
type LinkRow = { anchor_text: string; url: string; new_tab: boolean };
type Toast = { type: "success" | "error"; msg: string } | null;

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export default function LinkManager({
  services,
  internalPages,
  linksByService,
}: {
  services: Service[];
  internalPages: Page[];
  linksByService: Record<string, LinkRow[]>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(services[0]?.key ?? "");
  const [rows, setRows] = useState<LinkRow[]>(linksByService[selected] ?? []);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const knownUrls = useMemo(
    () => new Set(internalPages.map((p) => p.url)),
    [internalPages]
  );

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const switchService = (key: string) => {
    setSelected(key);
    setRows(linksByService[key] ?? []);
  };

  const upd = (i: number, patch: Partial<LinkRow>) =>
    setRows((p) => p.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= rows.length) return;
    setRows((p) => {
      const n = [...p];
      const [m] = n.splice(from, 1);
      n.splice(to, 0, m);
      return n;
    });
  };

  // ---- validation ----
  const issues = (i: number): string[] => {
    const r = rows[i];
    const out: string[] = [];
    const url = r.url.trim();
    const external = /^https?:\/\//i.test(url);
    if (!url) out.push("URL required");
    else if (!external && !url.startsWith("/")) out.push("Internal URL must start with /");
    else if (!external && !knownUrls.has(url.split("#")[0].split("?")[0]))
      out.push("Page not found — may be broken/deleted");
    const dupe = rows.some(
      (o, idx) =>
        idx !== i &&
        o.anchor_text.trim().toLowerCase() === r.anchor_text.trim().toLowerCase() &&
        r.anchor_text.trim()
    );
    if (dupe) out.push("Duplicate anchor text");
    return out;
  };

  const hasBlocking = rows.some((r, i) => {
    const url = r.url.trim();
    const external = /^https?:\/\//i.test(url);
    return !r.anchor_text.trim() || !url || (!external && !url.startsWith("/"));
  });

  const save = async () => {
    setBusy(true);
    const res = await saveServiceLinks(selected, rows);
    setBusy(false);
    if (res.ok) {
      flash({ type: "success", msg: "Links saved." });
      linksByService[selected] = rows;
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Save failed." });
  };

  const isExternal = (u: string) => /^https?:\/\//i.test(u.trim());

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

      <datalist id="internal-pages">
        {internalPages.map((p) => (
          <option key={p.url} value={p.url}>
            {p.label}
          </option>
        ))}
      </datalist>

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
              <option key={s.key} value={s.key}>{s.title}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <a
            href={`${WEBSITE_URL}/services/${selected}`}
            target="_blank"
            className="text-xs text-primary hover:underline"
          >
            View on site ↗
          </a>
          <button
            onClick={() => setRows((p) => [...p, { anchor_text: "", url: "", new_tab: false }])}
            className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:border-primary hover:text-primary"
          >
            + Add link
          </button>
          <button
            onClick={save}
            disabled={busy || hasBlocking}
            title={hasBlocking ? "Fix invalid rows first" : ""}
            className="btn btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save links"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* table */}
        <div className="space-y-3">
          {rows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-ink/15 bg-surface p-8 text-center text-sm text-muted">
              No links yet. Click <b>Add link</b> to map a phrase to a URL.
            </div>
          )}
          {rows.map((r, i) => {
            const probs = issues(i);
            return (
              <div key={i} className="rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft">
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <input
                    value={r.anchor_text}
                    onChange={(e) => upd(i, { anchor_text: e.target.value })}
                    placeholder="Linked text (e.g. SEO Services)"
                    className="rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm font-medium outline-none focus:border-primary"
                  />
                  <input
                    value={r.url}
                    list="internal-pages"
                    onChange={(e) => upd(i, { url: e.target.value })}
                    placeholder="/seo-services or https://…"
                    className="rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↑</button>
                    <button onClick={() => move(i, i + 1)} disabled={i === rows.length - 1} className="grid h-8 w-8 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↓</button>
                    <button onClick={() => setRows((p) => p.filter((_, idx) => idx !== i))} className="grid h-8 w-8 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${isExternal(r.url) ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
                    {isExternal(r.url) ? "External" : "Internal"}
                  </span>
                  <label className="flex items-center gap-1.5 text-muted">
                    <input type="checkbox" checked={r.new_tab || isExternal(r.url)} disabled={isExternal(r.url)} onChange={(e) => upd(i, { new_tab: e.target.checked })} />
                    Open in new tab
                  </label>
                  {probs.map((p) => (
                    <span key={p} className="text-amber-600">⚠ {p}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* live preview */}
        <div className="xl:sticky xl:top-6 xl:h-fit">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Live preview
          </div>
          <div className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
            <p className="text-sm text-muted">These render as links on the page:</p>
            <ul className="mt-3 space-y-2">
              {rows.filter((r) => r.anchor_text && r.url).map((r, i) => (
                <li key={i} className="text-sm">
                  <a
                    href={isExternal(r.url) ? r.url : `${WEBSITE_URL}${r.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary underline decoration-primary/40 underline-offset-2"
                  >
                    {r.anchor_text}
                  </a>
                  <span className="ml-2 text-xs text-muted">→ {r.url}</span>
                </li>
              ))}
              {rows.filter((r) => r.anchor_text && r.url).length === 0 && (
                <li className="text-sm text-muted">Nothing to preview yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
