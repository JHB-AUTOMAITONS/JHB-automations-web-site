"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadMedia, deleteMedia } from "@/app/admin/actions";

export type MediaItem = {
  id: string;
  name: string;
  path: string;
  url: string;
  size: number | null;
  mime: string | null;
  created_at: string;
};

export default function MediaManager({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError("");
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadMedia(fd);
      if (!res.ok) setError(res.error || "Upload failed");
    }
    setBusy(false);
    startTransition(() => router.refresh());
  };

  const remove = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    await deleteMedia(item.id, item.path);
    startTransition(() => router.refresh());
  };

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  const isImage = (m: string | null) => (m || "").startsWith("image/");

  return (
    <div className="mt-8">
      {/* Uploader */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-ink/15 bg-surface hover:border-primary/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-xl text-primary">
          ⬆
        </span>
        <p className="mt-3 font-medium">
          {busy ? "Uploading…" : "Drag & drop images here, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted">PNG, JPG, WEBP, SVG, GIF</p>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {/* Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted">
            No media uploaded yet.
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="group overflow-hidden rounded-2xl border border-ink/10 bg-surface shadow-soft"
          >
            <div className="relative aspect-video bg-base">
              {isImage(item.mime) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-2xl">📄</div>
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-medium" title={item.name}>
                {item.name}
              </p>
              <p className="text-[11px] text-muted">
                {item.size ? `${Math.round(item.size / 1024)} KB` : ""}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => copy(item.url)}
                  className="flex-1 rounded-lg border border-ink/10 px-2 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  {copied === item.url ? "Copied!" : "Copy URL"}
                </button>
                <button
                  onClick={() => remove(item)}
                  className="rounded-lg border border-ink/10 px-2 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-red-300 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
