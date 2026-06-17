"use client";

import { useRef, useState } from "react";
import { uploadMedia } from "@/app/actions";

const MAX_DIM = 512; // higher source resolution → crisp on retina/hi-DPI displays
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

async function toWebp(file: File, max = MAX_DIM): Promise<Blob> {
  const dataUrl: string = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("Could not read file."));
    r.readAsDataURL(file);
  });
  const img: HTMLImageElement = await new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error("Invalid image."));
    im.src = dataUrl;
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return await new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Compression failed."))), "image/webp", 0.95)
  );
}

// Optimized upload: compress raster → WebP (SVG kept as-is), then upload via the
// proven uploadMedia server action (also inserts the media-library row).
// Reliable path — no fragile signed-URL/XHR step. Returns URL + byte savings.
export async function uploadOptimizedLogo(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ url: string; from: number; to: number }> {
  onProgress?.(5);
  let blob: Blob;
  let filename: string;
  let mime: string;
  if (file.type === "image/svg+xml") {
    blob = file;
    filename = file.name;
    mime = "image/svg+xml";
  } else {
    onProgress?.(20);
    blob = await toWebp(file);
    filename = file.name.replace(/\.[^.]+$/, "") + ".webp";
    mime = "image/webp";
  }
  onProgress?.(55);
  const fd = new FormData();
  fd.append("file", new File([blob], filename, { type: mime }));
  const res = await uploadMedia(fd);
  onProgress?.(100);
  if (!res.ok || !res.url) throw new Error(res.error || "Upload failed.");
  return { url: res.url, from: file.size, to: blob.size };
}

export default function LogoUploader({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState<{ from: number; to: number } | null>(null);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) return setError("Use JPG, PNG, WebP, GIF or SVG.");
    setError("");
    setSaved(null);
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const r = await uploadOptimizedLogo(file, setProgress);
      onChange(r.url);
      setSaved({ from: r.from, to: r.to });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const shown = preview || value;

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      <div
        onClick={() => !busy && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (!busy) handle(e.dataTransfer.files?.[0]); }}
        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed p-3 transition-colors ${dragging ? "border-primary bg-primary/5" : "border-ink/15 hover:border-primary/50"}`}
      >
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-ink/10 bg-base">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
          ) : (
            <span className="text-xl text-muted">🖼</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium">{busy ? "Uploading…" : shown ? "Replace logo" : "Drop / click to upload"}</p>
          <p className="text-[10px] text-muted">Auto WebP @ {MAX_DIM}px</p>
          {progress > 0 && (
            <div className="mt-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-150" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[10px] text-muted">{progress}%</p>
            </div>
          )}
          {saved && progress === 0 && (
            <p className="text-[10px] text-green-600">✓ {(saved.from / 1024).toFixed(0)}→{(saved.to / 1024).toFixed(0)} KB</p>
          )}
        </div>
        {value && !busy && (
          <button type="button" onClick={(e) => { e.stopPropagation(); setPreview(null); setSaved(null); onChange(null); }} className="shrink-0 rounded-lg border border-ink/10 px-2.5 py-1 text-[11px] font-medium text-muted hover:border-red-300 hover:text-red-500">
            Delete
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
