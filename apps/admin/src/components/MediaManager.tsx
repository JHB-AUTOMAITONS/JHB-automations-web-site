"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  uploadMedia,
  deleteMedia,
  renameMedia,
  replaceMedia,
  updateMediaMeta,
} from "@/app/actions";
import { parseKeywords, type MediaLibraryItem } from "@jhb/shared/media";
import { optimizeImage, fmtBytes } from "@/lib/optimizeImage";
import LocalDateTime from "./LocalDateTime";

type Toast = { type: "success" | "error"; msg: string } | null;
const DATE_FMT: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };

// Filter chips → the usage label each one matches ("all"/"unused" are special).
const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All Images" },
  { key: "Home", label: "Home" },
  { key: "About", label: "About" },
  { key: "Services", label: "Services" },
  { key: "Blog", label: "Blog" },
  { key: "Blog Article", label: "Blog Articles" },
  { key: "Testimonials", label: "Testimonials" },
  { key: "Logos", label: "Logos" },
  { key: "Vasool", label: "Vasool" },
  { key: "JHB Products", label: "JHB Products" },
  { key: "unused", label: "Unused" },
];

const labelsOf = (used: string) => (used && used !== "Unused" ? used.split(", ") : []);
const displayName = (i: MediaLibraryItem) => i.image_filename || i.name;

export default function MediaManager({ items }: { items: MediaLibraryItem[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const refresh = () => startTransition(() => router.refresh());

  const [toast, setToast] = useState<Toast>(null);
  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? items.find((i) => i.id === selectedId) ?? null : null;

  // Natural dimensions are read from the rendered thumbnails (not stored in the DB).
  const [dims, setDims] = useState<Record<string, { w: number; h: number }>>({});

  // ---- upload (drag & drop + bulk) ----
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [up, setUp] = useState<{ total: number; done: number; pct: number } | null>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    let failed = 0;
    setUp({ total: list.length, done: 0, pct: 0 });
    for (let i = 0; i < list.length; i++) {
      setUp({ total: list.length, done: i, pct: Math.round((i / list.length) * 100) });
      try {
        const opt = await optimizeImage(list[i], { maxDim: 1600, quality: 0.85 });
        const filename = opt.passthrough ? list[i].name : list[i].name.replace(/\.[^.]+$/, "") + ".webp";
        const fd = new FormData();
        fd.append("file", new File([opt.blob], filename, { type: opt.type }));
        const res = await uploadMedia(fd);
        if (!res.ok) failed++;
      } catch {
        failed++;
      }
    }
    setUp({ total: list.length, done: list.length, pct: 100 });
    refresh();
    flash(
      failed
        ? { type: "error", msg: `Uploaded ${list.length - failed}/${list.length} — ${failed} failed.` }
        : { type: "success", msg: `Uploaded ${list.length} image${list.length === 1 ? "" : "s"}.` },
    );
    setTimeout(() => setUp(null), 1400);
  };

  // ---- filtering / search ----
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const labels = labelsOf(i.used_in);
      if (filter === "unused" && labels.length > 0) return false;
      if (filter !== "all" && filter !== "unused" && !labels.includes(filter)) return false;
      if (!q) return true;
      const date = i.created_at ? new Date(i.created_at).toLocaleDateString(undefined, DATE_FMT).toLowerCase() : "";
      return (
        displayName(i).toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q) ||
        i.used_in.toLowerCase().includes(q) ||
        date.includes(q)
      );
    });
  }, [items, search, filter]);

  return (
    <div className="mt-8">
      {toast && (
        <div className={`fixed right-6 top-6 z-[70] rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* ---- Upload ---- */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${drag ? "border-primary bg-primary/5" : "border-ink/15 bg-surface hover:border-primary/50"}`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-2xl text-primary">⬆</span>
        <p className="mt-3 font-medium">Drag &amp; drop images here, or click to select</p>
        <p className="mt-1 text-xs text-muted">PNG, JPG, JPEG, WEBP, SVG · bulk upload supported · auto-optimized to WebP</p>

        {up && (
          <div className="mt-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-150" style={{ width: `${up.pct}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-muted">{up.done === up.total ? "Done" : `Uploading ${up.done + 1} of ${up.total}…`} {up.pct}%</p>
          </div>
        )}
      </div>

      {/* ---- Search + filters ---- */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by file name, page or date…"
          className="w-72 max-w-full rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <span className="text-xs text-muted">{filtered.length} of {items.length}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-white" : "border border-ink/10 bg-surface text-muted hover:border-primary hover:text-primary"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ---- Grid ---- */}
      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-ink/10 bg-surface p-10 text-center text-sm text-muted shadow-soft">
          {items.length === 0 ? "No images yet — upload some above." : "No images match."}
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((i) => {
            const d = dims[i.id];
            return (
              <button
                key={i.id}
                onClick={() => setSelectedId(i.id)}
                className="group overflow-hidden rounded-2xl border border-ink/10 bg-surface text-left shadow-soft transition hover:border-primary hover:shadow-soft-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-base">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={i.url}
                    alt=""
                    loading="lazy"
                    onLoad={(e) => {
                      const t = e.currentTarget;
                      if (t.naturalWidth && !dims[i.id]) setDims((p) => ({ ...p, [i.id]: { w: t.naturalWidth, h: t.naturalHeight } }));
                    }}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium" title={displayName(i)}>{displayName(i)}</p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    <LocalDateTime value={i.created_at} options={DATE_FMT} /> · {d ? `${d.w}×${d.h}` : "—"} · {fmtBytes(i.size ?? 0)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {labelsOf(i.used_in).length === 0 ? (
                      <span className="rounded-full bg-ink/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-muted">Unused</span>
                    ) : (
                      labelsOf(i.used_in).slice(0, 2).map((l) => (
                        <span key={l} className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">{l}</span>
                      ))
                    )}
                    {labelsOf(i.used_in).length > 2 && (
                      <span className="rounded-full bg-ink/[0.06] px-1.5 py-0.5 text-[9px] font-medium text-muted">+{labelsOf(i.used_in).length - 2}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <ImageDrawer
          key={selected.id}
          item={selected}
          dims={dims[selected.id]}
          onClose={() => setSelectedId(null)}
          onChanged={refresh}
          flash={flash}
        />
      )}
    </div>
  );
}

/* ---- Side panel: preview + actions (copy, rename, replace, download, delete) ---- */
function ImageDrawer({
  item,
  dims,
  onClose,
  onChanged,
  flash,
}: {
  item: MediaLibraryItem;
  dims?: { w: number; h: number };
  onClose: () => void;
  onChanged: () => void;
  flash: (t: Toast) => void;
}) {
  const replaceRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(item.image_filename || item.name);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<"" | "rename" | "replace" | "delete" | "seo">("");
  const labels = labelsOf(item.used_in);

  // Optional SEO metadata (kept out of the main page; editable here on demand).
  const [seo, setSeo] = useState({
    alt: item.alt_text ?? "",
    title: item.image_title ?? "",
    caption: item.image_caption ?? "",
    description: item.image_description ?? "",
    keywords: (item.image_keywords ?? []).join(", "),
  });

  const copyUrl = () => {
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const rename = async () => {
    setBusy("rename");
    const res = await renameMedia(item.id, name);
    setBusy("");
    if (res.ok) {
      flash({ type: "success", msg: "Renamed." });
      onChanged();
    } else flash({ type: "error", msg: res.error || "Rename failed." });
  };

  const replace = async (file?: File) => {
    if (!file) return;
    setBusy("replace");
    try {
      const opt = await optimizeImage(file, { maxDim: 1600, quality: 0.85 });
      const fd = new FormData();
      fd.append("file", new File([opt.blob], item.name, { type: opt.type }));
      const res = await replaceMedia(item.id, item.path, fd);
      if (res.ok) {
        flash({ type: "success", msg: "Image replaced (URL kept)." });
        onChanged();
      } else flash({ type: "error", msg: res.error || "Replace failed." });
    } catch (e) {
      flash({ type: "error", msg: e instanceof Error ? e.message : "Replace failed." });
    } finally {
      setBusy("");
    }
  };

  const download = async () => {
    try {
      const r = await fetch(item.url);
      const b = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = item.image_filename || item.name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(item.url, "_blank");
    }
  };

  const remove = async () => {
    if (!confirm(`Delete "${item.image_filename || item.name}"? This permanently removes the image.`)) return;
    setBusy("delete");
    const res = await deleteMedia(item.id, item.path);
    setBusy("");
    if (res?.ok === false) {
      flash({ type: "error", msg: res.error || "Delete failed." });
      return;
    }
    flash({ type: "success", msg: "Image deleted." });
    onChanged();
    onClose();
  };

  const saveSeo = async () => {
    setBusy("seo");
    const res = await updateMediaMeta(item.id, {
      alt: seo.alt,
      title: seo.title,
      caption: seo.caption,
      description: seo.description,
      keywords: parseKeywords(seo.keywords),
      filename: item.image_filename || item.name,
      ogTitle: item.og_title ?? "",
      ogDescription: item.og_description ?? "",
    });
    setBusy("");
    if (res.ok) {
      flash({ type: "success", msg: "SEO details saved." });
      onChanged();
    } else flash({ type: "error", msg: res.error || "Save failed." });
  };

  const actionBtn = "rounded-lg border border-ink/10 px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-60";

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div className="relative h-full w-full max-w-md overflow-y-auto border-l border-ink/10 bg-surface shadow-soft-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink/10 bg-surface px-5 py-4">
          <h3 className="font-display text-base font-bold">Image details</h3>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded text-muted hover:bg-ink/[0.05] hover:text-ink">✕</button>
        </div>

        <div className="space-y-4 p-5">
          {/* Preview */}
          <div className="overflow-hidden rounded-xl border border-ink/10 bg-base">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.alt_text || ""} className="max-h-72 w-full object-contain" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-muted">
            <span>Resolution: <b className="text-ink/80">{dims ? `${dims.w}×${dims.h}` : "—"}</b></span>
            <span>Size: <b className="text-ink/80">{fmtBytes(item.size ?? 0)}</b></span>
            <span>Type: <b className="text-ink/80">{(item.mime || "image").replace("image/", "").toUpperCase()}</b></span>
            <span>Uploaded: <b className="text-ink/80"><LocalDateTime value={item.created_at} options={DATE_FMT} /></b></span>
          </div>

          {/* Used in */}
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Used in</p>
            {labels.length === 0 ? (
              <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[11px] font-medium text-muted">Not used anywhere yet</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {labels.map((l) => (
                  <span key={l} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{l}</span>
                ))}
              </div>
            )}
          </div>

          {/* URL + copy */}
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">URL</p>
            <div className="flex gap-2">
              <input readOnly value={item.url} className="min-w-0 flex-1 rounded-lg border border-ink/10 bg-base px-3 py-2 text-xs text-muted outline-none" />
              <button onClick={copyUrl} className={actionBtn}>{copied ? "Copied!" : "Copy"}</button>
            </div>
          </div>

          {/* Rename */}
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">File name</p>
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary" />
              <button onClick={rename} disabled={busy === "rename" || !name.trim()} className={actionBtn}>{busy === "rename" ? "Saving…" : "Rename"}</button>
            </div>
            <p className="mt-1 text-[10px] text-muted">Display name only — the image URL never changes.</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <input ref={replaceRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif" className="hidden" onChange={(e) => replace(e.target.files?.[0])} />
            <button onClick={() => replaceRef.current?.click()} disabled={busy === "replace"} className={actionBtn}>{busy === "replace" ? "Replacing…" : "Replace image"}</button>
            <button onClick={download} className={actionBtn}>Download</button>
            <a href={item.url} target="_blank" rel="noreferrer" className={actionBtn}>Open</a>
            <button onClick={remove} disabled={busy === "delete"} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-60">
              {busy === "delete" ? "Deleting…" : "Delete"}
            </button>
          </div>
          <p className="text-[10px] text-muted">Replace keeps the same URL, so every page using this image updates automatically.</p>

          {/* Optional SEO details */}
          <details className="rounded-xl border border-ink/10 bg-base/40 p-3">
            <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-wider text-muted">SEO details (optional)</summary>
            <div className="mt-3 space-y-2">
              <label className="block text-[11px] font-medium text-muted">Alt text
                <textarea value={seo.alt} onChange={(e) => setSeo((s) => ({ ...s, alt: e.target.value }))} rows={2} className="mt-0.5 w-full resize-none rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
              </label>
              <label className="block text-[11px] font-medium text-muted">Title
                <input value={seo.title} onChange={(e) => setSeo((s) => ({ ...s, title: e.target.value }))} className="mt-0.5 w-full rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
              </label>
              <label className="block text-[11px] font-medium text-muted">Caption
                <input value={seo.caption} onChange={(e) => setSeo((s) => ({ ...s, caption: e.target.value }))} className="mt-0.5 w-full rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
              </label>
              <label className="block text-[11px] font-medium text-muted">Description
                <textarea value={seo.description} onChange={(e) => setSeo((s) => ({ ...s, description: e.target.value }))} rows={2} className="mt-0.5 w-full resize-none rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
              </label>
              <label className="block text-[11px] font-medium text-muted">Keywords (comma-separated)
                <input value={seo.keywords} onChange={(e) => setSeo((s) => ({ ...s, keywords: e.target.value }))} className="mt-0.5 w-full rounded-lg border border-ink/10 bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
              </label>
              <button onClick={saveSeo} disabled={busy === "seo"} className="btn btn-primary !px-4 !py-2 !text-sm disabled:opacity-60">{busy === "seo" ? "Saving…" : "Save SEO details"}</button>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
