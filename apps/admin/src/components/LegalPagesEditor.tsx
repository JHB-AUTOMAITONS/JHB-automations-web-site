"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LegalDoc, LegalPages } from "@jhb/shared/content";
import { saveLegalDraft, publishLegal } from "@/app/actions";
import EditorHeader from "./EditorHeader";
import RichText from "./RichText";
import ImagePicker from "./ImagePicker";

type Toast = { type: "success" | "error"; msg: string } | null;

export default function LegalPagesEditor({ initial }: { initial: LegalPages }) {
  const router = useRouter();
  const [data, setData] = useState<LegalPages>(initial);
  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [toast, setToast] = useState<Toast>(null);

  const flash = (t: Toast) => { setToast(t); setTimeout(() => setToast(null), 3500); };
  const setDoc = (which: keyof LegalPages, patch: Partial<LegalDoc>) =>
    setData((d) => ({ ...d, [which]: { ...d[which], ...patch } }));

  const saveDraft = async () => {
    setBusy("save");
    const res = await saveLegalDraft(data as unknown as Record<string, unknown>);
    setBusy("");
    if (res.ok) { flash({ type: "success", msg: "Draft saved — not live yet." }); router.refresh(); }
    else flash({ type: "error", msg: res.error || "Save failed." });
  };
  const publish = async () => {
    setBusy("publish");
    const res = await publishLegal(data as unknown as Record<string, unknown>);
    setBusy("");
    if (res.ok) { flash({ type: "success", msg: "Published — live on the site." }); router.refresh(); }
    else flash({ type: "error", msg: res.error || "Publish failed." });
  };

  return (
    <section className="mt-10 border-t border-ink/10 pt-8">
      <EditorHeader
        title="⚖️ Legal Pages"
        subtitle="Privacy Policy and Terms & Conditions — shown in the footer on every page. Save Draft keeps changes private; Publish updates the live pages."
        busy={busy}
        toast={toast}
        onSave={saveDraft}
        onPublish={publish}
        saveLabel="Save draft"
        publishLabel="Publish"
      />
      <div className="mt-6 space-y-4">
        <LegalDocCard label="Privacy Policy" routeHint="/privacy-policy" doc={data.privacy} onChange={(p) => setDoc("privacy", p)} />
        <LegalDocCard label="Terms & Conditions" routeHint="/terms-and-conditions" doc={data.terms} onChange={(p) => setDoc("terms", p)} />
      </div>
    </section>
  );
}

function LegalDocCard({
  label,
  routeHint,
  doc,
  onChange,
}: {
  label: string;
  routeHint: string;
  doc: LegalDoc;
  onChange: (patch: Partial<LegalDoc>) => void;
}) {
  const [open, setOpen] = useState(false);

  const jsonOk = (() => {
    const s = doc.structuredData.trim();
    if (!s) return true;
    try { JSON.parse(s); return true; } catch { return false; }
  })();

  return (
    <div className="rounded-2xl border border-ink/10 bg-surface shadow-soft">
      {/* header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-left">
          <span className={`text-xs transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
          <span className="font-display text-base font-semibold">{label}</span>
          <span className="text-[11px] text-muted">{routeHint}</span>
        </button>
        <button
          type="button"
          onClick={() => onChange({ enabled: !doc.enabled })}
          className="flex items-center gap-1.5 rounded-lg border border-ink/10 px-2.5 py-1 text-xs"
          title="Show or hide this page (footer link + public page)"
        >
          <span className={`relative h-4 w-7 rounded-full transition-colors ${doc.enabled ? "bg-primary" : "bg-ink/20"}`}>
            <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${doc.enabled ? "left-[14px]" : "left-0.5"}`} />
          </span>
          {doc.enabled ? "Visible" : "Hidden"}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 p-5">
          <div className="grid gap-5 lg:grid-cols-[1fr_minmax(280px,380px)]">
            {/* fields */}
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Page Title"><input value={doc.title} onChange={(e) => onChange({ title: e.target.value })} className="input" /></Field>
                <Field label="Last Updated Date"><input value={doc.lastUpdated} onChange={(e) => onChange({ lastUpdated: e.target.value })} placeholder="e.g. 27 June 2026" className="input" /></Field>
              </div>
              <Field label="Slug (used for the canonical URL)">
                <input value={doc.slug} onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") })} className="input" />
                <p className="mt-1 text-[11px] text-muted">The public page is served at <code>{routeHint}</code>.</p>
              </Field>

              <div>
                <span className="mb-1 block text-xs font-medium text-muted">Content (rich text)</span>
                <RichText value={doc.contentHtml} onChange={(html) => onChange({ contentHtml: html })} />
              </div>

              <div className="rounded-xl border border-ink/10 bg-base p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">SEO</p>
                <div className="mt-3 space-y-3">
                  <Field label="SEO Title"><input value={doc.seoTitle} onChange={(e) => onChange({ seoTitle: e.target.value })} className="input" /></Field>
                  <Field label="Meta Description"><textarea rows={2} value={doc.metaDescription} onChange={(e) => onChange({ metaDescription: e.target.value })} className="input resize-none" /></Field>
                  <Field label="Meta Keywords (comma-separated)"><input value={doc.metaKeywords} onChange={(e) => onChange({ metaKeywords: e.target.value })} className="input" /></Field>
                  <Field label="Canonical URL"><input value={doc.canonical} onChange={(e) => onChange({ canonical: e.target.value })} placeholder={`https://jhbautomations.com${routeHint}`} className="input" /></Field>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Open Graph Title"><input value={doc.ogTitle} onChange={(e) => onChange({ ogTitle: e.target.value })} className="input" /></Field>
                    <Field label="Open Graph Description"><input value={doc.ogDescription} onChange={(e) => onChange({ ogDescription: e.target.value })} className="input" /></Field>
                  </div>
                  <Field label="Open Graph Image"><ImagePicker value={doc.ogImage || null} onChange={(u) => onChange({ ogImage: u || "" })} alt={false} /></Field>
                  <Field label="Structured Data (JSON-LD)">
                    <textarea rows={4} value={doc.structuredData} onChange={(e) => onChange({ structuredData: e.target.value })} className={`input resize-y font-mono text-xs ${jsonOk ? "" : "border-red-400"}`} placeholder='{ "@context": "https://schema.org", "@type": "WebPage" }' />
                    <p className={`mt-1 text-[11px] ${jsonOk ? "text-muted" : "text-red-500"}`}>{doc.structuredData.trim() === "" ? "Optional JSON-LD." : jsonOk ? "✓ Valid JSON" : "⚠ Invalid JSON — fix before publishing."}</p>
                  </Field>
                </div>
              </div>
            </div>

            {/* live preview */}
            <div className="lg:sticky lg:top-6 lg:h-fit">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Live preview</span>
              <div className="mt-2 max-h-[60vh] overflow-y-auto rounded-2xl border border-ink/10 bg-base p-5 shadow-soft">
                {!doc.enabled && (
                  <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-700">Hidden — the footer link &amp; page are turned off.</p>
                )}
                <h1 className="font-display text-xl font-bold tracking-tight">{doc.title || label}</h1>
                {doc.lastUpdated && <p className="mt-1 text-[11px] text-muted">Last updated: {doc.lastUpdated}</p>}
                {doc.contentHtml.trim() ? (
                  <div className="prose-jhb mt-4 text-sm leading-relaxed text-ink/80 [&_a]:text-primary [&_a]:underline [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_p]:mt-2" dangerouslySetInnerHTML={{ __html: doc.contentHtml }} />
                ) : (
                  <p className="mt-4 text-xs italic text-muted">Add content to see it here…</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
