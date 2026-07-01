"use client";

import { useEffect, useState } from "react";
import type { AuthorPublisher, AuthorPublisherDoc, SeoAuthor, SeoPublisher } from "@jhb/shared/content";
import { AUTHOR_PUBLISHER_DEFAULT } from "@jhb/shared/content";
import { loadAuthorPublisher, saveAuthorPublisherDraft, publishAuthorPublisher } from "@/app/actions";
import ImagePicker from "./ImagePicker";

// Self-contained "Author & Publisher (SEO)" card — drop in anywhere with a
// `path` (per-page override) or `mode="global"` (the defaults). It loads + saves
// the shared jhb_content doc itself, so it needs no props threaded through the
// host editor. SEO-only: never rendered on the public site.
const input = "w-full rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50";
const lbl = "mb-1 block text-[11px] font-medium text-muted";

type Toast = { type: "success" | "error"; msg: string } | null;

export default function AuthorPublisherEditor({
  path,
  mode = "page",
}: {
  path?: string;
  mode?: "page" | "global";
}) {
  const isGlobal = mode === "global" || !path;
  const [doc, setDoc] = useState<AuthorPublisherDoc | null>(null);
  const [open, setOpen] = useState(isGlobal);
  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [toast, setToast] = useState<Toast>(null);
  const flash = (t: Toast) => { setToast(t); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    let alive = true;
    loadAuthorPublisher().then((r) => { if (alive && r.ok) setDoc(r.doc); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!doc) {
    return (
      <section className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
        <p className="text-sm text-muted">Loading Author &amp; Publisher (SEO)…</p>
      </section>
    );
  }

  // The slice this card edits.
  const key = path || "";
  const override = !isGlobal ? (doc.overrides[key] ?? { ...AUTHOR_PUBLISHER_DEFAULT, useGlobal: true }) : null;
  const useGlobal = isGlobal ? false : override!.useGlobal !== false;
  const editing: AuthorPublisher = isGlobal ? doc.global : { author: override!.author, publisher: override!.publisher };
  // What actually applies (for the schema preview).
  const effective: AuthorPublisher = isGlobal || useGlobal ? doc.global : editing;

  const writeGlobal = (patch: AuthorPublisher) => setDoc({ ...doc, global: patch });
  const writeOverride = (patch: Partial<AuthorPublisher & { useGlobal: boolean }>) =>
    setDoc({ ...doc, overrides: { ...doc.overrides, [key]: { ...(doc.overrides[key] ?? { ...AUTHOR_PUBLISHER_DEFAULT, useGlobal: true }), ...patch } } });

  const setAuthor = (p: Partial<SeoAuthor>) => {
    const next = { ...editing.author, ...p };
    if (isGlobal) writeGlobal({ ...doc.global, author: next });
    else writeOverride({ author: next, publisher: editing.publisher, useGlobal: false });
  };
  const setPublisher = (p: Partial<SeoPublisher>) => {
    const next = { ...editing.publisher, ...p };
    if (isGlobal) writeGlobal({ ...doc.global, publisher: next });
    else writeOverride({ publisher: next, author: editing.author, useGlobal: false });
  };
  const setUseGlobal = (v: boolean) => writeOverride({ useGlobal: v });
  const applyGlobal = () => writeOverride({ author: { ...doc.global.author }, publisher: { ...doc.global.publisher }, useGlobal: false });
  const copyAuthor = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify(effective, null, 2)); flash({ type: "success", msg: "Author & publisher copied." }); } catch { /* ignore */ }
  };

  const persist = async (publish: boolean) => {
    setBusy(publish ? "publish" : "save");
    const fn = publish ? publishAuthorPublisher : saveAuthorPublisherDraft;
    const res = await fn(doc as unknown as Record<string, unknown>);
    setBusy("");
    flash(res.ok ? { type: "success", msg: publish ? "Published." : "Draft saved." } : { type: "error", msg: res.error || "Failed." });
  };

  const fieldsDisabled = !isGlobal && useGlobal;

  return (
    <section className="rounded-2xl border border-ink/10 bg-surface shadow-soft">
      {toast && (
        <div className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-2.5 text-sm font-medium shadow-soft-lg ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{toast.msg}</div>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
        <span className="flex items-center gap-2">
          <span className={`text-xs transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
          <span className="font-display text-base font-semibold">Author &amp; Publisher (SEO)</span>
          <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] font-medium text-muted">{isGlobal ? "Global defaults" : "This page"}</span>
        </span>
        <span className="text-[11px] text-muted">Structured data only — not shown on the site</span>
      </button>

      {open && (
        <div className="border-t border-ink/10 p-5">
          {!isGlobal && (
            <label className="mb-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={useGlobal} onChange={(e) => setUseGlobal(e.target.checked)} />
              <span>Use Global Author &amp; Publisher{useGlobal ? "" : " (overriding for this page)"}</span>
            </label>
          )}

          <fieldset disabled={fieldsDisabled} className={fieldsDisabled ? "opacity-60" : ""}>
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Author */}
              <div className="rounded-xl border border-ink/10 bg-base p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Author (Person)</p>
                <div className="mt-3 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block"><span className={lbl}>Author name</span><input className={input} value={editing.author.name} onChange={(e) => setAuthor({ name: e.target.value })} /></label>
                    <label className="block"><span className={lbl}>Job title</span><input className={input} value={editing.author.jobTitle} onChange={(e) => setAuthor({ jobTitle: e.target.value })} /></label>
                  </div>
                  <label className="block"><span className={lbl}>Profile URL</span><input className={input} value={editing.author.profileUrl} onChange={(e) => setAuthor({ profileUrl: e.target.value })} placeholder="https://…" /></label>
                  <label className="block"><span className={lbl}>Email (optional)</span><input className={input} value={editing.author.email} onChange={(e) => setAuthor({ email: e.target.value })} /></label>
                  <label className="block"><span className={lbl}>Bio / description</span><textarea rows={2} className={`${input} resize-none`} value={editing.author.bio} onChange={(e) => setAuthor({ bio: e.target.value })} /></label>
                  <ImagePicker label="Author image (optional)" value={editing.author.image || null} onChange={(u) => setAuthor({ image: u || "" })} alt={false} />
                </div>
              </div>

              {/* Publisher */}
              <div className="rounded-xl border border-ink/10 bg-base p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Publisher (Organization)</p>
                <div className="mt-3 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block"><span className={lbl}>Publisher name</span><input className={input} value={editing.publisher.name} onChange={(e) => setPublisher({ name: e.target.value })} /></label>
                    <label className="block"><span className={lbl}>Organization type</span>
                      <select className={input} value={editing.publisher.orgType} onChange={(e) => setPublisher({ orgType: e.target.value })}>
                        {["Organization", "LocalBusiness", "Corporation", "ProfessionalService", "OnlineBusiness"].map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </label>
                  </div>
                  <label className="block"><span className={lbl}>Publisher website</span><input className={input} value={editing.publisher.website} onChange={(e) => setPublisher({ website: e.target.value })} placeholder="https://…" /></label>
                  <label className="block"><span className={lbl}>Organization description</span><textarea rows={2} className={`${input} resize-none`} value={editing.publisher.description} onChange={(e) => setPublisher({ description: e.target.value })} /></label>
                  <ImagePicker label="Publisher logo" value={editing.publisher.logo || null} onChange={(u) => setPublisher({ logo: u || "" })} alt={false} />
                </div>
              </div>
            </div>
          </fieldset>

          {/* actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!isGlobal && <button type="button" onClick={applyGlobal} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium hover:bg-ink/[0.04]">Apply global</button>}
            <button type="button" onClick={copyAuthor} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium hover:bg-ink/[0.04]">Copy author details</button>
            <span className="flex-1" />
            <button type="button" onClick={() => persist(false)} disabled={busy !== ""} className="btn btn-ghost !px-4 !py-1.5 !text-xs disabled:opacity-60">{busy === "save" ? "Saving…" : "Save draft"}</button>
            <button type="button" onClick={() => persist(true)} disabled={busy !== ""} className="btn btn-primary !px-4 !py-1.5 !text-xs disabled:opacity-60">{busy === "publish" ? "Publishing…" : "Publish"}</button>
          </div>

          {/* structured-data preview */}
          <details className="mt-3 rounded-lg border border-ink/10 bg-base p-2">
            <summary className="cursor-pointer text-[11px] font-medium text-muted">Structured data (JSON-LD) this generates</summary>
            <pre className="mt-2 max-h-56 overflow-auto rounded bg-ink/[0.03] p-3 text-[10px] leading-relaxed">{JSON.stringify(schemaPreview(effective), null, 2)}</pre>
          </details>
        </div>
      )}
    </section>
  );
}

// Inline preview of the author/publisher schema fields (mirrors the shared
// builder so the admin sees what ships).
function schemaPreview(ap: AuthorPublisher): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (ap.author.name) {
    const person: Record<string, unknown> = { "@type": "Person", name: ap.author.name };
    if (ap.author.jobTitle) person.jobTitle = ap.author.jobTitle;
    if (ap.author.profileUrl) person.url = ap.author.profileUrl;
    if (ap.author.image) person.image = ap.author.image;
    if (ap.author.bio) person.description = ap.author.bio;
    if (ap.author.email) person.email = ap.author.email;
    out.author = person;
    out.creator = person;
  }
  if (ap.publisher.name) {
    const org: Record<string, unknown> = { "@type": ap.publisher.orgType || "Organization", name: ap.publisher.name };
    if (ap.publisher.website) org.url = ap.publisher.website;
    if (ap.publisher.logo) org.logo = { "@type": "ImageObject", url: ap.publisher.logo };
    if (ap.publisher.description) org.description = ap.publisher.description;
    out.publisher = org;
    out.copyrightHolder = org;
  }
  return out;
}
