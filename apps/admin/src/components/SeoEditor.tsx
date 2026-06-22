"use client";

import { useState } from "react";
import { saveSeo, deleteSeo } from "@/app/actions";

export type SeoEntry = {
  path: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  og_image: string | null;
};

const empty = (path: string): SeoEntry => ({
  path,
  title: null,
  description: null,
  keywords: null,
  og_image: null,
});

export default function SeoEditor({
  entries,
  labels = {},
  loadError = null,
}: {
  entries: SeoEntry[];
  labels?: Record<string, string>;
  loadError?: string | null;
}) {
  const [list, setList] = useState<SeoEntry[]>(entries);
  const [newPath, setNewPath] = useState("");
  const [addErr, setAddErr] = useState("");

  const addPath = () => {
    let p = newPath.trim().toLowerCase().replace(/\s+/g, "");
    if (!p) return;
    if (!p.startsWith("/")) p = "/" + p;
    if (list.some((e) => e.path === p)) {
      setAddErr(`"${p}" is already in the list.`);
      return;
    }
    setList((l) => [...l, empty(p)]);
    setNewPath("");
    setAddErr("");
  };

  // Known/default pages stay in the list (reset to blank); custom paths are removed.
  const onDeleted = (path: string) => {
    if (path in labels) setList((l) => l.map((e) => (e.path === path ? empty(path) : e)));
    else setList((l) => l.filter((e) => e.path !== path));
  };

  return (
    <div className="mt-8 space-y-6">
      {loadError && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠ Could not load SEO data: {loadError}. Try refreshing the page.
        </div>
      )}

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-surface p-10 text-center">
          <p className="text-sm font-medium">No SEO entries yet.</p>
          <p className="mt-1 text-xs text-muted">
            Add a page path below to start managing its title, description and Open Graph image.
          </p>
        </div>
      ) : (
        list.map((e) => (
          <SeoCard
            key={e.path}
            entry={e}
            label={labels[e.path]}
            onDeleted={() => onDeleted(e.path)}
          />
        ))
      )}

      {/* Add a custom page path */}
      <div className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Add a page
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            value={newPath}
            onChange={(e) => {
              setNewPath(e.target.value);
              setAddErr("");
            }}
            onKeyDown={(e) => e.key === "Enter" && addPath()}
            placeholder="/about"
            className="w-56 rounded-xl border border-ink/10 bg-base px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={addPath}
            className="rounded-lg border border-ink/10 px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-primary"
          >
            + Add page
          </button>
        </div>
        {addErr && <p className="mt-1 text-xs text-red-500">{addErr}</p>}
        <p className="mt-1.5 text-[11px] text-muted">
          Note: a path only affects SEO if that page reads it (Home, Services and Blog do).
        </p>
      </div>
    </div>
  );
}

function SeoCard({
  entry,
  label,
  onDeleted,
}: {
  entry: SeoEntry;
  label?: string;
  onDeleted: () => void;
}) {
  const [title, setTitle] = useState(entry.title ?? "");
  const [description, setDescription] = useState(entry.description ?? "");
  const [keywords, setKeywords] = useState(entry.keywords ?? "");
  const [ogImage, setOgImage] = useState(entry.og_image ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const save = async () => {
    setState("saving");
    setError("");
    const res = await saveSeo(entry.path, { title, description, keywords, og_image: ogImage });
    if (res.ok) {
      setState("saved");
      setTimeout(() => setState("idle"), 2500);
    } else {
      setState("error");
      setError(res.error || "Save failed.");
    }
  };

  const remove = async () => {
    if (!confirm(`Clear SEO override for "${entry.path}"?`)) return;
    setDeleting(true);
    const res = await deleteSeo(entry.path);
    setDeleting(false);
    if (res.ok) {
      setTitle("");
      setDescription("");
      setKeywords("");
      setOgImage("");
      onDeleted();
    } else {
      setError(res.error || "Delete failed.");
    }
  };

  return (
    <section className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-sm text-primary">
            {entry.path}
          </span>
          {label && <span className="text-sm font-normal text-muted">{label}</span>}
        </h2>
        <button
          type="button"
          onClick={remove}
          disabled={deleting}
          className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-60"
        >
          {deleting ? "Clearing…" : "Clear"}
        </button>
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
          {state === "error" && <span className="text-xs text-red-500">{error || "Error"}</span>}
        </div>
      </div>
    </section>
  );
}
