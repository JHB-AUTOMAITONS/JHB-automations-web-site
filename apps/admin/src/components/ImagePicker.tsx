"use client";

import { useRef, useState } from "react";
import { uploadMedia } from "@/app/actions";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

export default function ImagePicker({ value, onChange, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
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
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-ink/10 bg-base">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
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
    </div>
  );
}
