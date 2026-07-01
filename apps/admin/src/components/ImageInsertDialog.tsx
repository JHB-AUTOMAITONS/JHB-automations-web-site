"use client";

import { useEffect, useRef, useState } from "react";
import { uploadMedia, listMedia } from "@/app/actions";
import { optimizeImage } from "@/lib/optimizeImage";

type MediaItem = { id: string; name: string; url: string; alt_text: string | null; image_title: string | null };

/**
 * Modal for the Rich Text Editor's "Insert Image" / "Replace Image" actions.
 * Lets the admin upload a NEW image (optimized to WebP like everywhere else) OR
 * pick an EXISTING one from the media library. Returns the chosen URL + alt text.
 */
export default function ImageInsertDialog({
  open,
  title = "Insert image",
  onClose,
  onPick,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  onPick: (url: string, alt: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    setQ("");
    setError("");
    setLoading(true);
    listMedia()
      .then((r) => {
        if (r.ok) setItems(r.items);
      })
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const opt = await optimizeImage(file, { maxDim: 1600, quality: 0.85 });
      const filename = opt.passthrough ? file.name : file.name.replace(/\.[^.]+$/, "") + ".webp";
      const fd = new FormData();
      fd.append("file", new File([opt.blob], filename, { type: opt.type }));
      const res = await uploadMedia(fd);
      if (res.ok && res.url) {
        onPick(res.url, "");
        onClose();
      } else {
        setError(res.error || "Upload failed");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? items.filter((m) => `${m.name} ${m.alt_text ?? ""} ${m.image_title ?? ""}`.toLowerCase().includes(needle))
    : items;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft-lg">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-bold">{title}</h3>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded text-muted hover:bg-ink/[0.05]">✕</button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="btn btn-primary !px-4 !py-2 !text-sm disabled:opacity-60"
          >
            {busy ? "Uploading…" : "⬆ Upload new image"}
          </button>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search media…"
            className="min-w-0 flex-1 rounded-lg border border-ink/10 bg-base px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <p className="py-10 text-center text-sm text-muted">Loading media…</p>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              {items.length === 0 ? "No images yet — upload one above." : "No images match your search."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onPick(m.url, m.alt_text ?? "");
                    onClose();
                  }}
                  title={m.image_title || m.name}
                  className="group overflow-hidden rounded-xl border border-ink/10 bg-base transition hover:border-primary hover:shadow-soft"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.alt_text ?? ""} loading="lazy" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="mt-3 text-[11px] text-muted">Click an image to insert it at your cursor, or upload a new one.</p>
      </div>
    </div>
  );
}
