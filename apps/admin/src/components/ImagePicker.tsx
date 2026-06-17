"use client";

import { useEffect, useRef, useState } from "react";
import { uploadMedia, getMediaAlt, updateMediaAltByUrl } from "@/app/actions";
import { ALT_MIN, ALT_MAX, altStatus } from "@jhb/shared/media";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  /** Show the SEO alt-text field below the image (default true). */
  alt?: boolean;
};

export default function ImagePicker({ value, onChange, label, alt = true }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
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
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    if (altText.trim()) fd.append("alt", altText.trim());
    const res = await uploadMedia(fd);
    setBusy(false);
    if (res.ok && res.url) onChange(res.url);
    else setError(res.error || "Upload failed");
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

  return (
    <div>
      {label && (
        <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      )}
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-ink/10 bg-base">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={altText || ""} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl text-muted">🖼</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
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
      <p className="mt-1.5 text-[11px] text-muted">JPG, PNG, WebP or SVG.</p>
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
