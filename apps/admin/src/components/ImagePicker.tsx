"use client";

import { useEffect, useRef, useState } from "react";
import { uploadMedia, getMediaAlt, updateMediaAltByUrl } from "@/app/actions";
import { ALT_MIN, ALT_MAX, altStatus } from "@jhb/shared/media";
import { optimizeImage, readImageDimensions, fmtBytes } from "@/lib/optimizeImage";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  /** Show the SEO alt-text field below the image (default true). */
  alt?: boolean;
};

const MAX_DIM = 1600; // cap longest edge — keeps 16:9 thumbnails crisp but small
const MAX_FILE_BYTES = 25 * 1024 * 1024; // reject absurdly large source files

type Info = { from: number; to: number; w: number; h: number };

export default function ImagePicker({ value, onChange, label, alt = true }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [info, setInfo] = useState<Info | null>(null);
  const [error, setError] = useState("");

  // alt-text state (kept in sync with the media row by URL)
  const [altText, setAltText] = useState("");
  const [altSaved, setAltSaved] = useState(false);
  const [altSaving, setAltSaving] = useState(false);

  // Load existing alt text whenever the image URL changes.
  useEffect(() => {
    let cancelled = false;
    if (!alt || !value) {
      setAltText("");
      return;
    }
    getMediaAlt(value).then((r) => {
      if (!cancelled) setAltText(r.alt || "");
    });
    return () => {
      cancelled = true;
    };
  }, [value, alt]);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError(`Image is too large (${fmtBytes(file.size)}). Please use one under 25 MB.`);
      return;
    }
    setBusy(true);
    setError("");
    setInfo(null);
    setProgress(10);
    let timer: ReturnType<typeof setInterval> | undefined;
    try {
      const orig = await readImageDimensions(file);
      setProgress(30);
      // Resize + compress to WebP in the browser (SVG/GIF pass through).
      const opt = await optimizeImage(file, { maxDim: MAX_DIM, quality: 0.85 });
      setProgress(55);
      const filename = opt.passthrough
        ? file.name
        : file.name.replace(/\.[^.]+$/, "") + ".webp";
      const fd = new FormData();
      fd.append("file", new File([opt.blob], filename, { type: opt.type }));
      if (altText.trim()) fd.append("alt", altText.trim());
      // Server actions don't expose upload progress; creep the bar while it runs.
      timer = setInterval(() => setProgress((p) => (p < 90 ? p + 3 : p)), 180);
      const res = await uploadMedia(fd);
      clearInterval(timer);
      setProgress(100);
      if (res.ok && res.url) {
        onChange(res.url);
        setInfo({
          from: file.size,
          to: opt.blob.size,
          w: opt.width || orig.width,
          h: opt.height || orig.height,
        });
      } else {
        setError(res.error || "Upload failed");
      }
    } catch (e) {
      if (timer) clearInterval(timer);
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  const saveAlt = async () => {
    if (!value) return;
    setAltSaving(true);
    const res = await updateMediaAltByUrl(value, altText);
    setAltSaving(false);
    if (res.ok) {
      setAltSaved(true);
      setTimeout(() => setAltSaved(false), 1800);
    }
  };

  const status = altStatus(altText);
  const len = altText.trim().length;
  const savedPct =
    info && info.from > info.to ? Math.round((1 - info.to / info.from) * 100) : 0;

  return (
    <div>
      {label && (
        <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      )}
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-ink/10 bg-base">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={altText || ""}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl text-muted">🖼</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
          >
            {busy ? "Optimizing…" : value ? "Replace" : "Upload"}
          </button>
          {value && !busy && (
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setInfo(null);
              }}
              className="rounded-lg border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-300 hover:text-red-500"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* upload progress */}
      {progress > 0 && (
        <div className="mt-2 max-w-xs">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-0.5 text-[10px] text-muted">
            {progress < 55 ? "Optimizing…" : progress < 100 ? "Uploading…" : "Done"} {progress}%
          </p>
        </div>
      )}

      <p className="mt-1.5 text-[11px] text-muted">
        JPG, PNG, WebP, GIF or SVG — auto-optimized to WebP (max {MAX_DIM}px).
        Recommended <strong>16:9</strong> (1280×720) for blog/thumbnail images.
      </p>
      {info && progress === 0 && (
        <p className="mt-1 text-[11px] text-green-600">
          ✓ {info.w}×{info.h} · {fmtBytes(info.from)} → {fmtBytes(info.to)}
          {savedPct > 0 ? ` (−${savedPct}%)` : ""}
        </p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      {/* SEO alt text */}
      {alt && value && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">
              Image Alt Text <span className="text-red-500">*</span>
            </span>
            <span
              className={`text-[10px] ${
                status === "ok" ? "text-green-600" : "text-muted"
              }`}
            >
              {len}/{ALT_MAX} · rec. {ALT_MIN}–{ALT_MAX}
            </span>
          </div>
          <textarea
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onBlur={saveAlt}
            rows={2}
            placeholder="Describe the image for SEO & screen readers…"
            className={`w-full resize-none rounded-lg border bg-base px-3 py-2 text-sm outline-none transition-colors focus:border-primary ${
              status === "empty" ? "border-red-300" : "border-ink/10"
            }`}
          />
          <div className="mt-1 flex items-center gap-2 text-[11px]">
            {status === "empty" && (
              <span className="text-red-500">⚠ Alt text is required for SEO &amp; accessibility.</span>
            )}
            {(status === "short" || status === "long") && (
              <span className="text-amber-600">
                ⚠ {status === "short" ? "A bit short" : "A bit long"} — aim for {ALT_MIN}–{ALT_MAX} characters.
              </span>
            )}
            {status === "ok" && <span className="text-green-600">✓ Good length.</span>}
            {altSaving && <span className="ml-auto text-muted">Saving…</span>}
            {altSaved && !altSaving && <span className="ml-auto text-green-600">Saved ✓</span>}
          </div>
        </div>
      )}
    </div>
  );
}
