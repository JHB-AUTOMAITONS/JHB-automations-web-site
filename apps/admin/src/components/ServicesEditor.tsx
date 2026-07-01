"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveService } from "@/app/actions";
import EditorHeader from "./EditorHeader";

// Accept a bare slug or a pasted full URL; keep only the slug portion, lowercase,
// spaces/invalid -> hyphen, collapse repeats (trailing hyphen kept while typing).
const cleanSlugInput = (raw: string) => {
  let s = raw.trim();
  if (s.includes("/")) {
    s = s.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, "").split(/[?#]/)[0];
    const parts = s.split("/").filter(Boolean);
    if (parts.length) s = parts[parts.length - 1];
  }
  return s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+/, "");
};

export type ServiceEntry = {
  key: string;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
};

export default function ServicesEditor({ entries }: { entries: ServiceEntry[] }) {
  return (
    <div className="space-y-6">
      <EditorHeader
        title="Services SEO & Slugs"
        subtitle="Edit each service's URL slug, page title, meta description and keywords. Changing a slug changes the page's URL across the whole site (menu, footer, links)."
      />
      {entries.map((e) => (
        <ServiceCard key={e.key} entry={e} />
      ))}
    </div>
  );
}

function ServiceCard({ entry }: { entry: ServiceEntry }) {
  const router = useRouter();
  const [slug, setSlug] = useState(entry.slug);
  const [metaTitle, setMetaTitle] = useState(entry.metaTitle);
  const [metaDescription, setMetaDescription] = useState(entry.metaDescription);
  const [metaKeywords, setMetaKeywords] = useState(entry.metaKeywords);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  const save = async () => {
    setState("saving");
    setError("");
    const res = await saveService(entry.key, {
      slug,
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keywords: metaKeywords,
    });
    if (res.ok) {
      setState("saved");
      if (res.slug) setSlug(res.slug);
      router.refresh();
    } else {
      setState("error");
      setError(res.error || "Error");
    }
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">{entry.title}</h2>
        <a
          href={`/${slug}`}
          target="_blank"
          className="text-xs text-primary hover:underline"
        >
          View page ↗
        </a>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            URL slug
          </span>
          <div className="flex items-center overflow-hidden rounded-xl border border-ink/10 bg-base">
            <span className="px-3 py-2.5 text-sm text-muted">/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(cleanSlugInput(e.target.value))}
              onBlur={(e) => setSlug(cleanSlugInput(e.target.value).replace(/-+$/g, ""))}
              className="flex-1 bg-transparent py-2.5 pr-4 text-sm outline-none"
              placeholder="influencer-marketing"
            />
          </div>
          <span className="mt-1 block text-[11px] text-muted/80">
            Example: <code>influencer-marketing</code> — enter only the slug, not a full URL.
          </span>
        </label>

        <label className="block">
          <span className="mb-1 flex justify-between text-xs font-medium text-muted">
            <span>Meta title</span>
            <span>{metaTitle.length}/60</span>
          </span>
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="mb-1 flex justify-between text-xs font-medium text-muted">
            <span>Meta description</span>
            <span>{metaDescription.length}/160</span>
          </span>
          <textarea
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full resize-none rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            Keywords (comma-separated)
          </span>
          <input
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
            className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={state === "saving"}
            className="btn btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60"
          >
            Save
          </button>
          {state === "saving" && <span className="text-xs text-muted">Saving…</span>}
          {state === "saved" && <span className="text-xs text-green-600">✓ Saved</span>}
          {state === "error" && <span className="text-xs text-red-500">{error}</span>}
        </div>
      </div>
    </section>
  );
}
