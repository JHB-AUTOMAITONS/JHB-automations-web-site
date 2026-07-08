"use client";

import { useState } from "react";
import { saveHomeSeo } from "@/app/actions";
import { withTimeout, actionErrorMessage } from "@/lib/asyncAction";
import ImagePicker from "./ImagePicker";
import RichText from "./RichText";
import EditorHeader from "./EditorHeader";
import AiSeoPanel from "./ai/AiSeoPanel";
import AuthorPublisherEditor from "./AuthorPublisherEditor";

export type HomeSeo = {
  path: string;
  title: string | null;
  meta_title: string | null;
  description: string | null;
  keywords: string | null;
  canonical: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  robots: string | null;
  structured_data: string | null;
  seo_content: string | null;
  slug: string | null;
};

const SITE = process.env.NEXT_PUBLIC_WEBSITE_URL || "https://jhbautomations.com";
const ROBOTS_PRESETS = [
  "index, follow",
  "noindex, follow",
  "index, nofollow",
  "noindex, nofollow",
];

type Toast = { type: "success" | "error"; msg: string } | null;

// Home slug: "" or "/" = root; otherwise lowercase + hyphens, single leading "/".
const cleanHomeSlug = (raw: string) => {
  const s = raw.trim();
  if (s === "" || s === "/") return s;
  const body = s
    .replace(/^\/+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "");
  return "/" + body;
};

export default function HomeSeoEditor({
  entry,
  loadError = null,
}: {
  entry: HomeSeo;
  loadError?: string | null;
}) {
  const [title, setTitle] = useState(entry.title ?? "");
  const [metaTitle, setMetaTitle] = useState(entry.meta_title ?? "");
  const [description, setDescription] = useState(entry.description ?? "");
  const [keywords, setKeywords] = useState(entry.keywords ?? "");
  const [canonical, setCanonical] = useState(entry.canonical ?? "");
  const [ogTitle, setOgTitle] = useState(entry.og_title ?? "");
  const [ogDescription, setOgDescription] = useState(entry.og_description ?? "");
  const [ogImage, setOgImage] = useState<string | null>(entry.og_image ?? null);
  const [robots, setRobots] = useState(entry.robots ?? "index, follow");
  const [structuredData, setStructuredData] = useState(entry.structured_data ?? "");
  const [seoContent, setSeoContent] = useState(entry.seo_content ?? "");
  const [slug, setSlug] = useState(entry.slug ?? "/");

  const [busy, setBusy] = useState<"" | "save" | "publish">("");
  const [toast, setToast] = useState<Toast>(null);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  // JSON-LD validity (live)
  const jsonOk = (() => {
    const s = structuredData.trim();
    if (!s) return true;
    try {
      JSON.parse(s);
      return true;
    } catch {
      return false;
    }
  })();

  const slugForUrl = slug.trim() === "" || slug.trim() === "/" ? "" : cleanHomeSlug(slug).replace(/^\//, "");
  const urlPreview = `${SITE}/${slugForUrl}`;
  const previewTitle = metaTitle.trim() || title.trim() || "JHB Automations";
  const previewDesc =
    description.trim() ||
    "Grow your business online with AI automation, web development and digital marketing.";

  const save = async (mode: "save" | "publish") => {
    if (busy) return;
    if (!jsonOk) {
      flash({ type: "error", msg: "Structured Data must be valid JSON-LD." });
      return;
    }
    setBusy(mode);
    try {
      const res = await withTimeout(
        saveHomeSeo({
          title,
          meta_title: metaTitle,
          description,
          keywords,
          canonical,
          og_title: ogTitle,
          og_description: ogDescription,
          og_image: ogImage ?? "",
          robots,
          structured_data: structuredData,
          seo_content: seoContent,
          slug,
        }),
      );
      if (res.ok) {
        flash({ type: "success", msg: mode === "publish" ? "Published live ✓" : "Saved ✓" });
      } else {
        flash({ type: "error", msg: res.error || "Save failed." });
      }
    } catch (e) {
      flash({
        type: "error",
        msg: actionErrorMessage(
          e,
          mode === "publish" ? "Publish failed. Please try again." : "Save failed. Please try again.",
        ),
      });
    } finally {
      setBusy("");
    }
  };

  const counter = (len: number, lo: number, hi: number) =>
    len === 0 ? "text-muted" : len < lo || len > hi ? "text-amber-600" : "text-green-600";

  return (
    <section className="mt-8 rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
      <EditorHeader
        title="🏠 Home Page SEO"
        busy={busy}
        toast={toast}
        onSave={() => save("save")}
        onPublish={() => save("publish")}
      />

      <div className="mt-5">
        <AiSeoPanel
          route="/"
          getContext={() => ({
            title: metaTitle || title,
            contentHtml: seoContent,
            focusKeyword: keywords.split(",")[0]?.trim(),
            metaTitle,
            metaDescription: description,
            keywords,
          })}
          onApply={(r) => {
            if (r.seoTitle) {
              setMetaTitle(r.seoTitle);
              if (!title.trim()) setTitle(r.seoTitle);
            }
            if (r.metaDescription) setDescription(r.metaDescription);
            if (r.metaKeywords) setKeywords(r.metaKeywords);
            else if (r.secondaryKeywords?.length) setKeywords(r.secondaryKeywords.join(", "));
            if (r.canonical) setCanonical(r.canonical);
            if (r.ogTitle) setOgTitle(r.ogTitle);
            if (r.ogDescription) setOgDescription(r.ogDescription);
            if (r.contentHtml) setSeoContent(r.contentHtml);
            if (r.schemaJsonLd) {
              try {
                JSON.parse(r.schemaJsonLd);
                setStructuredData(r.schemaJsonLd);
              } catch {
                /* keep existing structured data */
              }
            }
          }}
        />
      </div>

      {loadError && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          ⚠ Couldn&apos;t load saved Home SEO ({loadError}). If this mentions a missing
          column, run the <strong>jhb_seo migration SQL</strong> once, then reload.
        </div>
      )}

      {/* Google search preview */}
      <div className="mt-5 rounded-xl border border-ink/10 bg-base p-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
          Google preview
        </p>
        <p className="truncate text-xs text-green-700">{urlPreview}</p>
        <p className="truncate text-lg text-[#1a0dab]">{previewTitle}</p>
        <p className="line-clamp-2 text-sm text-[#4d5156]">{previewDesc}</p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Slug */}
        <Field label="Slug (URL)" full>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            onBlur={(e) => setSlug(cleanHomeSlug(e.target.value) || "/")}
            placeholder="/"
            className="input"
          />
          <p className="mt-1 text-[11px] text-muted">
            URL preview: <span className="font-mono">{urlPreview}</span> · Home is served at the
            root — use <code>/</code> (or leave empty) for the root URL.
          </p>
        </Field>

        {/* Page Title */}
        <Field label="Page Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
        </Field>

        {/* Meta Title + counter */}
        <Field label="Meta Title (<title>)">
          <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className="input" />
          <p className={`mt-1 text-[11px] ${counter(metaTitle.length, 50, 60)}`}>
            {metaTitle.length}/60 · recommended 50–60
          </p>
        </Field>

        {/* Meta Description + counter */}
        <Field label="Meta Description" full>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input resize-none"
          />
          <p className={`mt-1 text-[11px] ${counter(description.length, 150, 160)}`}>
            {description.length}/160 · recommended 150–160
          </p>
        </Field>

        {/* Keywords */}
        <Field label="Meta Keywords (comma-separated)" full>
          <input value={keywords} onChange={(e) => setKeywords(e.target.value)} className="input" />
        </Field>

        {/* Canonical */}
        <Field label="Canonical URL">
          <input
            value={canonical}
            onChange={(e) => setCanonical(e.target.value)}
            placeholder={`${SITE}/`}
            className="input"
          />
        </Field>

        {/* Robots */}
        <Field label="Robots meta tag">
          <input
            value={robots}
            onChange={(e) => setRobots(e.target.value)}
            list="robots-presets"
            placeholder="index, follow"
            className="input"
          />
          <datalist id="robots-presets">
            {ROBOTS_PRESETS.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </Field>

        {/* OG Title */}
        <Field label="Open Graph Title">
          <input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} className="input" />
        </Field>

        {/* OG Description */}
        <Field label="Open Graph Description">
          <input
            value={ogDescription}
            onChange={(e) => setOgDescription(e.target.value)}
            className="input"
          />
        </Field>

        {/* OG Image */}
        <Field label="Open Graph Image" full>
          <ImagePicker value={ogImage} onChange={setOgImage} alt={false} />
        </Field>

        {/* Structured data JSON-LD */}
        <Field label="Structured Data (JSON-LD)" full>
          <textarea
            rows={6}
            value={structuredData}
            onChange={(e) => setStructuredData(e.target.value)}
            placeholder='{ "@context": "https://schema.org", "@type": "Organization", "name": "JHB Automations" }'
            className={`input resize-y font-mono text-xs ${
              jsonOk ? "" : "border-red-400"
            }`}
          />
          <p className={`mt-1 text-[11px] ${jsonOk ? "text-muted" : "text-red-500"}`}>
            {structuredData.trim() === ""
              ? "Optional. Paste valid JSON-LD; it's injected into the homepage <head>."
              : jsonOk
                ? "✓ Valid JSON"
                : "⚠ Invalid JSON — fix before saving."}
          </p>
        </Field>

        {/* SEO content rich text */}
        <div className="lg:col-span-2">
          <span className="mb-1 block text-xs font-medium text-muted">
            Home Page SEO Content
          </span>
          <RichText value={seoContent} onChange={setSeoContent} />
          <p className="mt-1 text-[11px] text-muted">
            Optional SEO-focused content block rendered near the bottom of the homepage.
          </p>
        </div>
      </div>

      {/* Author & Publisher (SEO) — below the existing SEO fields */}
      <div className="mt-6">
        <AuthorPublisherEditor path="/" />
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "lg:col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
