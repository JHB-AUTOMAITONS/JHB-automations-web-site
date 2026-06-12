"use client";

import { useRef, useState } from "react";
import { uploadMedia } from "@/app/actions";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

// Client-side compression: downscale to max 1600px and re-encode as WebP (~82%).
// SVGs are left untouched (vector). Falls back to the original on any error.
async function compress(file: File): Promise<File> {
  if (file.type === "image/svg+xml" || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1600;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob(res, "image/webp", 0.82)
    );
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

export default function ImagePicker({ value, onChange, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    const optimized = await compress(file);
    const fd = new FormData();
    fd.append("file", optimized);
    const res = await uploadMedia(fd);
    setBusy(false);
    if (res.ok && res.url) onChange(res.url);
    else setError(res.error || "Upload failed");
  };

  return (
    <div>
      {label && (
        <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      )}
      <div className="flex items-center gap-4">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          className={`grid h-20 w-28 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed bg-base transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-ink/10"
          }`}
          title="Click or drag & drop an image"
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl text-muted">{busy ? "…" : "🖼"}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
          >
            {busy ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-300 hover:text-red-500"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-muted">
        Drag &amp; drop or click · JPG, PNG, WebP, SVG · auto-compressed.
      </p>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
