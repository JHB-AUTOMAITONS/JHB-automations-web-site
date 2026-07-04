"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveServiceLinks } from "@/app/actions";

type Service = { key: string; title: string };
type Page = { label: string; url: string };
type LinkType = "dofollow" | "nofollow";
type LinkRow = {
  anchor_text: string;
  url: string;
  new_tab: boolean;
  link_type: LinkType;
  sponsored: boolean;
  ugc: boolean;
};
type Toast = { type: "success" | "error"; msg: string } | null;

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

const isExternal = (u: string) => /^https?:\/\//i.test(u.trim());

// Compute the rel="" tokens for preview + parity with the public renderer.
function relTokens(r: LinkRow): string[] {
  const tokens: string[] = [];
  if (r.link_type === "nofollow") tokens.push("nofollow");
  if (r.sponsored) tokens.push("sponsored");
  if (r.ugc) tokens.push("ugc");
  if (r.new_tab || isExternal(r.url)) tokens.push("noopener", "noreferrer");
  return tokens;
}

const newRow = (): LinkRow => ({
  anchor_text: "",
  url: "",
  new_tab: false,
  link_type: "dofollow",
  sponsored: false,
  ugc: false,
});

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
  const [openSettings, setOpenSettings] = useState<number | null>(null);

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
    setOpenSettings(null);
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
    setOpenSettings(null);
  };

  // ---- validation ----
  const issues = (i: number): string[] => {
    const r = rows[i];
    const out: string[] = [];
    const url = r.url.trim();
    const external = isExternal(url);
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

  const hasBlocking = rows.some((r) => {
    const url = r.url.trim();
    const external = isExternal(url);
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
            href={`${WEBSITE_URL}/${selected}`}
            target="_blank"
            className="text-xs text-primary hover:underline"
          >
            View on site ↗
          </a>
          <button
            onClick={() => setRows((p) => [...p, newRow()])}
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
            const external = isExternal(r.url);
            const newTab = r.new_tab || external;
            return (
              <div
                key={i}
                className="relative rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft"
              >
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
                    <button
                      onClick={() => setOpenSettings(openSettings === i ? null : i)}
                      title="Link settings (SEO attributes, new tab)"
                      aria-label="Link settings"
                      className={`grid h-8 w-8 place-items-center rounded border text-xs transition-colors ${
                        openSettings === i
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-ink/10 hover:border-primary hover:text-primary"
                      }`}
                    >
                      ⚙
                    </button>
                    <button onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-8 w-8 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↑</button>
                    <button onClick={() => move(i, i + 1)} disabled={i === rows.length - 1} className="grid h-8 w-8 place-items-center rounded border border-ink/10 text-xs disabled:opacity-30">↓</button>
                    <button onClick={() => { setRows((p) => p.filter((_, idx) => idx !== i)); setOpenSettings(null); }} className="grid h-8 w-8 place-items-center rounded border border-ink/10 text-xs hover:border-red-300 hover:text-red-500">✕</button>
                  </div>
                </div>

                {/* attribute summary */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${external ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
                    {external ? "External" : "Internal"}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 font-semibold ${r.link_type === "nofollow" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                    {r.link_type === "nofollow" ? "Nofollow" : "Dofollow"}
                  </span>
                  {r.sponsored && <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 font-semibold text-ink/70">Sponsored</span>}
                  {r.ugc && <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 font-semibold text-ink/70">UGC</span>}
                  {newTab && <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 font-semibold text-ink/70">New tab ↗</span>}
                  {probs.map((p) => (
                    <span key={p} className="text-amber-600">⚠ {p}</span>
                  ))}
                </div>

                {/* settings popover */}
                {openSettings === i && (
                  <>
                    <button
                      aria-label="Close settings"
                      onClick={() => setOpenSettings(null)}
                      className="fixed inset-0 z-30 cursor-default"
                    />
                    <div className="absolute right-4 top-16 z-40 w-72 rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft-lg">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Link settings</h4>
                        <button
                          onClick={() => setOpenSettings(null)}
                          className="grid h-6 w-6 place-items-center rounded text-muted hover:bg-ink/[0.05] hover:text-ink"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Link attribute */}
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                        Link attribute
                      </p>
                      <div className="space-y-1.5">
                        <label
                          className="flex cursor-pointer items-center gap-2 text-sm"
                          title="Allows search engines to follow this link."
                        >
                          <input
                            type="radio"
                            name={`linktype-${i}`}
                            checked={r.link_type === "dofollow"}
                            onChange={() => upd(i, { link_type: "dofollow" })}
                          />
                          Dofollow <span className="text-[10px] text-muted">(default)</span>
                          <span className="ml-auto text-muted" title="Allows search engines to follow this link.">ⓘ</span>
                        </label>
                        <label
                          className="flex cursor-pointer items-center gap-2 text-sm"
                          title="Tells search engines not to pass ranking authority."
                        >
                          <input
                            type="radio"
                            name={`linktype-${i}`}
                            checked={r.link_type === "nofollow"}
                            onChange={() => upd(i, { link_type: "nofollow" })}
                          />
                          Nofollow
                          <span className="ml-auto text-muted" title="Tells search engines not to pass ranking authority.">ⓘ</span>
                        </label>
                      </div>

                      {/* Additional SEO attributes */}
                      <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-muted">
                        Additional SEO attributes
                      </p>
                      <div className="space-y-1.5">
                        <label
                          className="flex cursor-pointer items-center gap-2 text-sm"
                          title="Marks paid or promotional links."
                        >
                          <input
                            type="checkbox"
                            checked={r.sponsored}
                            onChange={(e) => upd(i, { sponsored: e.target.checked })}
                          />
                          Sponsored
                          <span className="ml-auto text-muted" title="Marks paid or promotional links.">ⓘ</span>
                        </label>
                        <label
                          className="flex cursor-pointer items-center gap-2 text-sm"
                          title="Marks user-generated content links."
                        >
                          <input
                            type="checkbox"
                            checked={r.ugc}
                            onChange={(e) => upd(i, { ugc: e.target.checked })}
                          />
                          UGC
                          <span className="ml-auto text-muted" title="Marks user-generated content links.">ⓘ</span>
                        </label>
                      </div>

                      {/* Behavior */}
                      <p className="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-muted">
                        Behavior
                      </p>
                      <label
                        className="flex cursor-pointer items-center gap-2 text-sm"
                        title={external ? "External links always open in a new tab." : "Open this link in a new browser tab."}
                      >
                        <input
                          type="checkbox"
                          checked={newTab}
                          disabled={external}
                          onChange={(e) => upd(i, { new_tab: e.target.checked })}
                        />
                        Open in new tab
                        {external && <span className="text-[10px] text-muted">(auto for external)</span>}
                      </label>

                      {/* computed rel preview */}
                      <div className="mt-4 rounded-lg bg-base p-2 text-[11px] text-muted">
                        <span className="font-semibold text-ink/70">Output:</span>{" "}
                        <code className="break-all text-secondary">
                          {`<a href="${r.url || "…"}"${newTab ? ' target="_blank"' : ""}${
                            relTokens(r).length ? ` rel="${relTokens(r).join(" ")}"` : ""
                          }>`}
                        </code>
                      </div>
                    </div>
                  </>
                )}
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
            <ul className="mt-3 space-y-3">
              {rows.filter((r) => r.anchor_text && r.url).map((r, i) => {
                const external = isExternal(r.url);
                const newTab = r.new_tab || external;
                const rel = relTokens(r);
                return (
                  <li key={i} className="border-b border-ink/[0.06] pb-3 last:border-0 last:pb-0">
                    <a
                      href={external ? r.url : `${WEBSITE_URL}${r.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary"
                    >
                      {r.anchor_text}
                    </a>
                    <div className="mt-0.5 text-xs text-muted">→ {r.url}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${r.link_type === "nofollow" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                        {r.link_type === "nofollow" ? "Nofollow" : "Dofollow"}
                      </span>
                      {r.sponsored && <span className="rounded bg-ink/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-ink/70">Sponsored</span>}
                      {r.ugc && <span className="rounded bg-ink/[0.06] px-1.5 py-0.5 text-[10px] font-semibold text-ink/70">UGC</span>}
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${newTab ? "bg-ink/[0.06] text-ink/70" : "bg-ink/[0.03] text-muted"}`}>
                        {newTab ? "New tab" : "Same tab"}
                      </span>
                    </div>
                    {rel.length > 0 && (
                      <code className="mt-1 block break-all text-[10px] text-secondary">
                        rel=&quot;{rel.join(" ")}&quot;
                      </code>
                    )}
                  </li>
                );
              })}
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
