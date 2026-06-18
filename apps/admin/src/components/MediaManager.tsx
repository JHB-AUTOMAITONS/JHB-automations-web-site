"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  uploadMedia,
  deleteMedia,
  updateMediaMeta,
  setImageSeoRequireAlt,
} from "@/app/actions";
import {
  ALT_MIN,
  ALT_MAX,
  TITLE_MAX,
  CAPTION_MAX,
  OG_TITLE_MAX,
  OG_DESC_MAX,
  altStatus,
  slugifyFilename,
  parseKeywords,
  type MediaLibraryItem,
} from "@jhb/shared/media";
import LocalDateTime from "./LocalDateTime";

const DATE_FMT: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };

type Toast = { type: "success" | "error"; msg: string } | null;
type Meta = {
  alt: string;
  title: string;
  caption: string;
  description: string;
  keywords: string; // comma-separated in the UI
  filename: string;
  ogTitle: string;
  ogDescription: string;
};

function toMeta(i: MediaLibraryItem): Meta {
  return {
    alt: i.alt_text ?? "",
    title: i.image_title ?? "",
    caption: i.image_caption ?? "",
    description: i.image_description ?? "",
    keywords: (i.image_keywords ?? []).join(", "),
    filename: i.image_filename ?? i.name,
    ogTitle: i.og_title ?? "",
    ogDescription: i.og_description ?? "",
  };
}

function fmtDate(s: string | null) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

export default function MediaManager({
  items,
  requireAlt: requireAltInitial,
}: {
  items: MediaLibraryItem[];
  requireAlt: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [toast, setToast] = useState<Toast>(null);
  const [busy, setBusy] = useState(false);
  const [requireAlt, setRequireAlt] = useState(requireAltInitial);

  const [meta, setMeta] = useState<Record<string, Meta>>(() =>
    Object.fromEntries(items.map((i) => [i.id, toMeta(i)]))
  );
  const [editingId, setEditingId] = useState<string | null>(null);

  // upload form
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ file: File; preview: string } | null>(null);
  const [upAlt, setUpAlt] = useState("");
  const [upTitle, setUpTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // toolbar
  const [search, setSearch] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const flash = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const isDirty = (i: MediaLibraryItem) => {
    const m = meta[i.id];
    const o = toMeta(i);
    return (
      m.alt !== o.alt || m.title !== o.title || m.caption !== o.caption ||
      m.description !== o.description || m.keywords !== o.keywords ||
      m.filename !== o.filename || m.ogTitle !== o.ogTitle || m.ogDescription !== o.ogDescription
    );
  };

  const missingCount = useMemo(() => items.filter((i) => !(meta[i.id]?.alt ?? "").trim()).length, [items, meta]);
  const dirtyItems = useMemo(() => items.filter(isDirty), [items, meta]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = items.filter((i) => {
      if (onlyMissing && (meta[i.id]?.alt ?? "").trim()) return false;
      if (!q) return true;
      const m = meta[i.id];
      return (
        i.name.toLowerCase().includes(q) ||
        m.alt.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.caption.toLowerCase().includes(q) ||
        m.keywords.toLowerCase().includes(q)
      );
    });
    return [...list].sort((a, b) => (meta[a.id]?.alt.trim() ? 1 : 0) - (meta[b.id]?.alt.trim() ? 1 : 0));
  }, [items, meta, search, onlyMissing]);

  const setRow = (id: string, patch: Partial<Meta>) => setMeta((p) => ({ ...p, [id]: { ...p[id], ...patch } }));

  const fieldsOf = (m: Meta) => ({
    alt: m.alt,
    title: m.title,
    caption: m.caption,
    description: m.description,
    keywords: parseKeywords(m.keywords),
    filename: m.filename,
    ogTitle: m.ogTitle,
    ogDescription: m.ogDescription,
  });

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    setPending({ file, preview: URL.createObjectURL(file) });
    setUpAlt("");
    setUpTitle("");
  };

  const saveUpload = async () => {
    if (!pending) return;
    if (requireAlt && !upAlt.trim()) return flash({ type: "error", msg: "Alt text is required (setting enabled)." });
    setUploading(true);
    const fd = new FormData();
    fd.append("file", pending.file);
    if (upAlt.trim()) fd.append("alt", upAlt.trim());
    if (upTitle.trim()) fd.append("title", upTitle.trim());
    const res = await uploadMedia(fd);
    setUploading(false);
    if (res.ok) {
      URL.revokeObjectURL(pending.preview);
      setPending(null);
      flash({ type: "success", msg: "Image uploaded." });
      startTransition(() => router.refresh());
    } else flash({ type: "error", msg: res.error || "Upload failed." });
  };

  // save a single image (called on blur / Save) — only when changed
  const save = async (i: MediaLibraryItem, opts?: { silent?: boolean }) => {
    if (!isDirty(i)) return true;
    const m = meta[i.id];
    if (requireAlt && !m.alt.trim()) {
      if (!opts?.silent) flash({ type: "error", msg: "Alt text is required (setting enabled)." });
      return false;
    }
    const res = await updateMediaMeta(i.id, fieldsOf(m));
    if (res.ok) {
      startTransition(() => router.refresh());
      return true;
    }
    flash({ type: "error", msg: res.error || "Save failed." });
    return false;
  };

  const saveAll = async () => {
    if (dirtyItems.length === 0) return;
    if (requireAlt && dirtyItems.some((i) => !meta[i.id].alt.trim()))
      return flash({ type: "error", msg: "Some images are missing required alt text." });
    setBusy(true);
    for (const i of dirtyItems) {
      const res = await updateMediaMeta(i.id, fieldsOf(meta[i.id]));
      if (!res.ok) {
        setBusy(false);
        return flash({ type: "error", msg: res.error || "Save failed." });
      }
    }
    setBusy(false);
    flash({ type: "success", msg: `Saved ${dirtyItems.length} image${dirtyItems.length === 1 ? "" : "s"}.` });
    startTransition(() => router.refresh());
  };

  const remove = async (item: MediaLibraryItem) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setBusy(true);
    await deleteMedia(item.id, item.path);
    setBusy(false);
    if (editingId === item.id) setEditingId(null);
    startTransition(() => router.refresh());
  };

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  const toggleRequireAlt = async () => {
    const next = !requireAlt;
    setRequireAlt(next);
    const res = await setImageSeoRequireAlt(next);
    if (!res.ok) {
      setRequireAlt(!next);
      flash({ type: "error", msg: res.error || "Could not update setting." });
    } else flash({ type: "success", msg: `Require alt text ${next ? "enabled" : "disabled"}.` });
  };

  const exportCsv = () => {
    const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const header = ["File Name", "URL", "Alt", "Title", "Caption", "Description", "Keywords", "Used In", "Uploaded", "Updated"];
    const rows = items.map((i) => {
      const m = meta[i.id];
      return [m.filename, i.url, m.alt, m.title, m.caption, m.description, m.keywords, i.used_in, fmtDate(i.created_at), fmtDate(i.updated_at)].map(esc).join(",");
    });
    const csv = [header.map(esc).join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "image-seo-report.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const editing = editingId ? items.find((i) => i.id === editingId) ?? null : null;

  return (
    <div className="mt-8">
      {toast && (
        <div className={`fixed right-6 top-6 z-[60] rounded-xl px-4 py-3 text-sm font-medium shadow-soft-lg ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Image Upload */}
      <div className="rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft">
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
        {!pending ? (
          <div onClick={() => fileRef.current?.click()} className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/15 p-8 text-center hover:border-primary/50">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-xl text-primary">⬆</span>
            <p className="mt-3 font-medium">Upload an image</p>
            <p className="mt-1 text-xs text-muted">PNG, JPG, WEBP, SVG · then click any image to edit its full SEO data</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pending.preview} alt="" className="h-32 w-full rounded-xl object-cover" />
            <div className="space-y-2">
              <p className="truncate text-sm font-medium">{pending.file.name}</p>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Image Alt Text {requireAlt && <span className="text-red-500">*</span>}</label>
                <textarea value={upAlt} onChange={(e) => setUpAlt(e.target.value)} rows={2} placeholder="Describe the image…" className="w-full resize-none rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Image Title (optional)</label>
                <input value={upTitle} onChange={(e) => setUpTitle(e.target.value)} placeholder="Title" className="input" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={saveUpload} disabled={uploading} className="btn btn-primary !px-5 !py-2 !text-sm disabled:opacity-60">{uploading ? "Uploading…" : "Save image"}</button>
                <button onClick={() => { URL.revokeObjectURL(pending.preview); setPending(null); }} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:text-ink">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, alt, title, keywords…" className="w-64 rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary" />
          <label className="flex items-center gap-2 text-xs text-muted"><input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />Missing alt only</label>
          <span className={`text-xs font-semibold ${missingCount ? "text-amber-600" : "text-green-600"}`}>{missingCount} missing</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-muted" title="Require alt text before saving/uploading"><input type="checkbox" checked={requireAlt} onChange={toggleRequireAlt} />Require alt text</label>
          <button onClick={exportCsv} className="rounded-lg border border-ink/10 px-3 py-2 text-xs font-medium text-muted hover:border-primary hover:text-primary">Export CSV</button>
          <button onClick={saveAll} disabled={busy || dirtyItems.length === 0} className="btn btn-primary !px-4 !py-2 !text-sm disabled:opacity-60">{busy ? "Saving…" : dirtyItems.length ? `Save all (${dirtyItems.length})` : "Saved"}</button>
        </div>
      </div>

      {/* Library */}
      <div className="mt-5 space-y-3">
        {filtered.length === 0 && <p className="rounded-2xl border border-ink/10 bg-surface p-8 text-center text-sm text-muted shadow-soft">No images match.</p>}
        {filtered.map((img) => {
          const m = meta[img.id] ?? toMeta(img);
          const status = altStatus(m.alt);
          return (
            <div key={img.id} className="rounded-2xl border border-ink/10 bg-surface p-4 shadow-soft">
              <div className="grid gap-3 md:grid-cols-[88px_1fr_auto] md:items-start">
                <button
                  onClick={() => setEditingId(img.id)}
                  className="grid place-items-center overflow-hidden rounded-xl border border-ink/10 bg-base"
                  style={{ height: 88, width: 88 }}
                  title="Edit SEO"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={m.alt} title={m.title || undefined} className="h-full w-full object-cover" />
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="truncate text-sm font-medium" title={img.name}>{m.filename || img.name}</span>
                    {!m.alt.trim() && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Missing alt</span>}
                    <span className="rounded-full bg-ink/[0.05] px-2 py-0.5 text-[10px] font-medium text-muted">{img.used_in}</span>
                    <span className="ml-auto text-[11px] text-muted">
                      Uploaded <LocalDateTime value={img.created_at} options={DATE_FMT} /> · Updated{" "}
                      <LocalDateTime value={img.updated_at} options={DATE_FMT} />
                    </span>
                  </div>

                  {/* inline alt (quick + bulk editing) */}
                  <label className="mt-2 block text-[11px] font-medium text-muted">Alt text <span className="text-red-500">*</span></label>
                  <textarea value={m.alt} onChange={(e) => setRow(img.id, { alt: e.target.value })} onBlur={() => save(img, { silent: true })} rows={2} placeholder="Alt text…" className={`mt-0.5 w-full resize-none rounded-lg border bg-base px-3 py-2 text-sm outline-none focus:border-primary ${status === "empty" ? "border-red-300" : "border-ink/10"}`} />
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className={status === "ok" ? "text-green-600" : "text-muted"}>{m.alt.trim().length}/{ALT_MAX} · rec. {ALT_MIN}–{ALT_MAX}</span>
                    {status === "empty" && <span className="text-red-500">⚠ Required</span>}
                    {status === "short" && <span className="text-amber-600">⚠ A bit short</span>}
                    {status === "long" && <span className="text-amber-600">⚠ A bit long</span>}
                    {status === "ok" && <span className="text-green-600">✓ Good</span>}
                  </div>

                  {/* read-only SEO summary (full editing in the drawer) */}
                  <dl className="mt-2 grid gap-x-4 gap-y-0.5 text-[11px] sm:grid-cols-2">
                    <div className="flex gap-1"><dt className="text-muted">Title:</dt><dd className="truncate">{m.title || <span className="text-muted/60">—</span>}</dd></div>
                    <div className="flex gap-1"><dt className="text-muted">Caption:</dt><dd className="truncate">{m.caption || <span className="text-muted/60">—</span>}</dd></div>
                    <div className="flex gap-1 sm:col-span-2"><dt className="text-muted">Description:</dt><dd className="truncate">{m.description || <span className="text-muted/60">—</span>}</dd></div>
                  </dl>
                </div>

                <div className="flex flex-row gap-1.5 md:flex-col">
                  <button onClick={() => setEditingId(img.id)} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5">Edit SEO</button>
                  <button onClick={() => copy(img.url)} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-primary hover:text-primary">{copied === img.url ? "Copied!" : "Copy URL"}</button>
                  <button onClick={() => remove(img)} className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-500">Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit drawer */}
      {editing && (
        <EditDrawer
          img={editing}
          meta={meta[editing.id]}
          requireAlt={requireAlt}
          onChange={(patch) => setRow(editing.id, patch)}
          onBlur={() => save(editing, { silent: true })}
          onSave={async () => {
            const ok = await save(editing);
            if (ok) {
              flash({ type: "success", msg: "Saved." });
              setEditingId(null);
            }
          }}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
}

function EditDrawer({
  img,
  meta,
  requireAlt,
  onChange,
  onBlur,
  onSave,
  onClose,
}: {
  img: MediaLibraryItem;
  meta: Meta;
  requireAlt: boolean;
  onChange: (patch: Partial<Meta>) => void;
  onBlur: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const status = altStatus(meta.alt);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div className="relative h-full w-full max-w-md overflow-y-auto border-l border-ink/10 bg-surface shadow-soft-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-ink/10 bg-surface px-5 py-4">
          <h3 className="font-display text-base font-bold">Edit image SEO</h3>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded text-muted hover:bg-ink/[0.05] hover:text-ink">✕</button>
        </div>

        <div className="space-y-4 p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.url} alt={meta.alt} title={meta.title || undefined} className="aspect-video w-full rounded-xl border border-ink/10 object-cover" />
          <p className="text-[11px] text-muted">
            Uploaded <LocalDateTime value={img.created_at} options={DATE_FMT} /> · Updated{" "}
            <LocalDateTime value={img.updated_at} options={DATE_FMT} /> · Used in: {img.used_in}
          </p>

          <Field label={`Alt text${requireAlt ? " *" : ""}`} hint={`${meta.alt.trim().length}/${ALT_MAX} · rec. ${ALT_MIN}–${ALT_MAX}`} warn={status === "empty" ? "Required for SEO & accessibility" : status === "short" ? "A bit short" : status === "long" ? "A bit long" : ""}>
            <textarea value={meta.alt} onChange={(e) => onChange({ alt: e.target.value })} onBlur={onBlur} rows={2} className={`w-full resize-none rounded-lg border bg-base px-3 py-2 text-sm outline-none focus:border-primary ${status === "empty" ? "border-red-300" : "border-ink/10"}`} />
          </Field>

          <Field label="Image title" hint={`${meta.title.length}/${TITLE_MAX}`}>
            <input value={meta.title} onChange={(e) => onChange({ title: e.target.value })} onBlur={onBlur} className="input" />
          </Field>

          <Field label="Caption" hint={`${meta.caption.length}/${CAPTION_MAX}`}>
            <textarea value={meta.caption} onChange={(e) => onChange({ caption: e.target.value })} onBlur={onBlur} rows={2} className="w-full resize-none rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary" />
          </Field>

          <Field label="Description">
            <textarea value={meta.description} onChange={(e) => onChange({ description: e.target.value })} onBlur={onBlur} rows={3} className="w-full resize-none rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary" />
          </Field>

          <Field label="Keywords / tags (comma-separated)">
            <input value={meta.keywords} onChange={(e) => onChange({ keywords: e.target.value })} onBlur={onBlur} placeholder="seo, automation, salem" className="input" />
            {parseKeywords(meta.keywords).length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {parseKeywords(meta.keywords).map((k) => (
                  <span key={k} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{k}</span>
                ))}
              </div>
            )}
          </Field>

          <Field label="SEO file name" hint="metadata only — does not rename the file/URL">
            <div className="flex gap-2">
              <input value={meta.filename} onChange={(e) => onChange({ filename: e.target.value })} onBlur={onBlur} className="input" />
              <button type="button" onClick={() => onChange({ filename: slugifyFilename(meta.filename || img.name) })} className="shrink-0 rounded-lg border border-ink/10 px-3 text-xs font-medium text-muted hover:border-primary hover:text-primary">Slugify</button>
            </div>
          </Field>

          <Field label="Open Graph title" hint={`${meta.ogTitle.length}/${OG_TITLE_MAX}`}>
            <input value={meta.ogTitle} onChange={(e) => onChange({ ogTitle: e.target.value })} onBlur={onBlur} className="input" />
          </Field>

          <Field label="Open Graph description" hint={`${meta.ogDescription.length}/${OG_DESC_MAX}`}>
            <textarea value={meta.ogDescription} onChange={(e) => onChange({ ogDescription: e.target.value })} onBlur={onBlur} rows={2} className="w-full resize-none rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary" />
          </Field>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-ink/10 bg-surface px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:text-ink">Close</button>
          <button onClick={onSave} className="btn btn-primary !px-5 !py-2 !text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, warn, children }: { label: string; hint?: string; warn?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        {hint && <span className="text-[10px] text-muted">{hint}</span>}
      </div>
      {children}
      {warn && <p className="mt-1 text-[11px] text-amber-600">⚠ {warn}</p>}
    </div>
  );
}
