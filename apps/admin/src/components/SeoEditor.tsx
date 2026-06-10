"use client";

import { useState } from "react";
import { saveSeo } from "@/app/actions";

export type SeoEntry = {
  path: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  og_image: string | null;
};

export default function SeoEditor({ entries }: { entries: SeoEntry[] }) {
  return (
    <div className="mt-8 space-y-6">
      {entries.map((e) => (
        <SeoCard key={e.path} entry={e} />
      ))}
    </div>
  );
}

function SeoCard({ entry }: { entry: SeoEntry }) {
  const [title, setTitle] = useState(entry.title ?? "");
  const [description, setDescription] = useState(entry.description ?? "");
  const [keywords, setKeywords] = useState(entry.keywords ?? "");
  const [ogImage, setOgImage] = useState(entry.og_image ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const save = async () => {
    setState("saving");
    const res = await saveSeo(entry.path, {
      title,
      description,
      keywords,
      og_image: ogImage,
    });
    setState(res.ok ? "saved" : "error");
    setTimeout(() => setState("idle"), 2500);
  };

  return (
    <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">
          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-sm text-primary">
            {entry.path}
          </span>
        </h2>
      </div>
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-1 flex justify-between text-xs font-medium text-muted">
            <span>Title tag</span>
            <span>{title.length}/60</span>
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 flex justify-between text-xs font-medium text-muted">
            <span>Meta description</span>
            <span>{description.length}/160</span>
          </span>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            Keywords (comma-separated)
          </span>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            Open Graph image URL
          </span>
          <input
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder="https://…"
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
          {state === "error" && <span className="text-xs text-red-500">Error</span>}
        </div>
      </div>
    </section>
  );
}
