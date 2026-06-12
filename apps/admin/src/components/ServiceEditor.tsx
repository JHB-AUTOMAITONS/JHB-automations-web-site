"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ServiceContentVersion } from "@jhb/shared/service-content";
import {
  saveService,
  saveServiceContentDraft,
  publishServiceContent,
  unpublishServiceContent,
} from "@/app/actions";
import RichText from "./RichText";

type Toast = { type: "success" | "error"; msg: string } | null;

const WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export default function ServiceEditor(props: {
  serviceKey: string;
  title: string;
  initialSlug: string;
  initialMetaTitle: string;
  initialMetaDescription: string;
  initialMetaKeywords: string;
  initialContentTitle: string;
  initialContentHtml: string;
  versions: ServiceContentVersion[];
}) {
  const router = useRouter();

  // SEO
  const [slug, setSlug] = useState(props.initialSlug);
  const [metaTitle, setMetaTitle] = useState(props.initialMetaTitle);
  const [metaDesc, setMetaDesc] = useState(props.initialMetaDescription);
  const [keywords, setKeywords] = useState(props.initialMetaKeywords);
  const [savingSeo, setSavingSeo] = useState(false);

  // Service Content
  const [cTitle, setCTitle] = useState(props.initialContentTitle);
  const [cHtml, setCHtml] = useState(props.initialContentHtml);
  const [editorKey, setEditorKey] = useState(0); // force RichText remount on restore
  const [autosave, setAutosave] = useState<"idle" | "saving" | "saved">("idle");
  const [busy, setBusy] = useState<"" | "publish" | "unpublish">("");

  const [toast, setToast] = useState<Toast>(null);
  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3000);
  };

  // Autosave the content draft 1.5s after the last change
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setAutosave("saving");
    const t = setTimeout(async () => {
      await saveServiceContentDraft(props.serviceKey, cTitle, cHtml);
      setAutosave("saved");
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cTitle, cHtml]);

  const saveSeo = async () => {
    setSavingSeo(true);
    const res = await saveService(props.serviceKey, {
      slug,
      meta_title: metaTitle,
      meta_description: metaDesc,
      meta_keywords: keywords,
    });
    setSavingSeo(false);
    if (res.ok) {
      if (res.slug) setSlug(res.slug);
      flash({ type: "success", msg: "URL & SEO saved." });
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Save failed." });
  };

  const publish = async () => {
    setBusy("publish");
    const res = await publishServiceContent(props.serviceKey, slug, cTitle, cHtml);
    setBusy("");
    if (res.ok) {
      flash({ type: "success", msg: "Content published — live on the site." });
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Publish failed." });
  };

  const unpublish = async () => {
    if (!confirm("Hide this Service Content section from the public page?")) return;
    setBusy("unpublish");
    const res = await unpublishServiceContent(props.serviceKey, slug);
    setBusy("");
    if (res.ok) {
      flash({ type: "success", msg: "Content unpublished." });
      router.refresh();
    } else flash({ type: "error", msg: res.error || "Failed." });
  };

  const restore = (v: ServiceContentVersion) => {
    setCTitle(v.title ?? "");
    setCHtml(v.content_html ?? "");
    setEditorKey((k) => k + 1); // remount RichText so it shows the restored HTML
    flash({ type: "success", msg: "Version restored to draft — review & publish." });
  };

  return (
    <div>
      {toast && (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            onClick={() => router.push("/services")}
            className="text-sm text-muted transition-colors hover:text-ink"
          >
            ← All services
          </button>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            {props.title}
          </h1>
        </div>
        <a
          href={`${WEBSITE_URL}/services/${slug}`}
          target="_blank"
          className="text-xs text-primary hover:underline"
        >
          View live ↗
        </a>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_440px]">
        {/* ---- Editor ---- */}
        <div className="space-y-6">
          {/* URL & SEO */}
          <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
            <h2 className="font-display text-lg font-semibold">URL &amp; SEO</h2>
            <div className="mt-4 space-y-4">
              <Field label="URL slug" value={slug} onChange={setSlug} prefix="/services/" />
              <Field label="Meta title" value={metaTitle} onChange={setMetaTitle} counter={60} />
              <Field label="Meta description" value={metaDesc} onChange={setMetaDesc} textarea counter={160} />
              <Field label="Keywords (comma-separated)" value={keywords} onChange={setKeywords} />
              <button
                onClick={saveSeo}
                disabled={savingSeo}
                className="btn btn-ghost !px-5 !py-2.5 !text-sm disabled:opacity-60"
              >
                {savingSeo ? "Saving…" : "Save URL & SEO"}
              </button>
            </div>
          </section>

          {/* Service Content */}
          <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Service Content</h2>
              <span className="text-xs text-muted">
                {autosave === "saving" ? "Autosaving…" : autosave === "saved" ? "✓ Draft autosaved" : ""}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <Field
                label="Section title"
                value={cTitle}
                onChange={setCTitle}
                placeholder="e.g. Why Choose Our SEO Services?"
              />
              <div>
                <span className="mb-1 block text-xs font-medium text-muted">Content</span>
                <RichText key={editorKey} value={cHtml} onChange={setCHtml} />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={publish}
                  disabled={busy !== ""}
                  className="btn btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60"
                >
                  {busy === "publish" ? "Publishing…" : "Publish"}
                </button>
                <button
                  onClick={unpublish}
                  disabled={busy !== ""}
                  className="rounded-lg border border-ink/10 px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-60"
                >
                  Unpublish
                </button>
                {props.versions.length > 0 && (
                  <select
                    onChange={(e) => {
                      const v = props.versions.find((x) => x.id === e.target.value);
                      if (v) restore(v);
                      e.target.value = "";
                    }}
                    defaultValue=""
                    className="ml-auto rounded-lg border border-ink/10 bg-base px-3 py-2 text-xs outline-none focus:border-primary"
                  >
                    <option value="" disabled>
                      Restore previous version…
                    </option>
                    {props.versions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {new Date(v.created_at).toLocaleString()}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* ---- Live preview ---- */}
        <div className="xl:sticky xl:top-6 xl:h-fit">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Live preview
          </div>
          <div className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
            {cTitle && (
              <h3 className="font-display text-xl font-bold">{cTitle}</h3>
            )}
            {cHtml ? (
              <div
                className="prose-jhb mt-3 text-sm leading-relaxed text-ink/80 [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: cHtml }}
              />
            ) : (
              <p className="mt-3 text-sm text-muted">Start typing to see a preview…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  prefix,
  counter,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  prefix?: string;
  counter?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-xs font-medium text-muted">
        <span>{label}</span>
        {counter && <span>{value.length}/{counter}</span>}
      </span>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-none rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      ) : prefix ? (
        <div className="flex items-center overflow-hidden rounded-xl border border-ink/10 bg-base">
          <span className="px-3 py-2.5 text-sm text-muted">{prefix}</span>
          <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent py-2.5 pr-4 text-sm outline-none" />
        </div>
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}
