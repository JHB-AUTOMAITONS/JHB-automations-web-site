"use client";

import { useState } from "react";
import type { ImageAlign, ImageSettings } from "@jhb/shared/containers";

/**
 * Compact image controls — alignment + width only. Edits an optional
 * `ImageSettings` object (all fields optional → empty = default sizing).
 * Rendered by ImagePicker when the parent passes `onChangeSettings`; keyed on the
 * image URL there so the local "custom width" toggle re-initialises when the
 * image changes. The website applies these via smartImgAttrs() (shared), so the
 * admin preview matches production.
 */
const WIDTHS = ["25%", "50%", "75%", "100%"] as const;
const ALIGNS: ImageAlign[] = ["left", "center", "right"];

export default function ImageSettingsControls({
  value,
  onChange,
}: {
  value: ImageSettings;
  onChange: (v: ImageSettings) => void;
}) {
  const s = value || {};
  const set = (patch: Partial<ImageSettings>) => onChange({ ...s, ...patch });

  const w = s.width ?? "";
  const [custom, setCustom] = useState(w !== "" && !(WIDTHS as readonly string[]).includes(w));

  const btn = (active: boolean) =>
    `rounded-md border px-2.5 py-1 text-xs capitalize transition-colors ${
      active ? "border-primary text-primary" : "border-ink/10 text-muted hover:text-ink"
    }`;

  return (
    <div className="space-y-2.5 rounded-lg border border-ink/10 bg-surface p-2.5">
      {/* Image alignment */}
      <div>
        <span className="mb-1 block text-[11px] font-medium text-muted">Image alignment</span>
        <div className="flex gap-1.5">
          {ALIGNS.map((a) => (
            <button key={a} type="button" onClick={() => set({ align: a })} className={btn(s.align === a)}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Image width */}
      <div>
        <span className="mb-1 block text-[11px] font-medium text-muted">Image width</span>
        <div className="flex flex-wrap gap-1.5">
          {WIDTHS.map((pw) => (
            <button
              key={pw}
              type="button"
              onClick={() => {
                setCustom(false);
                set({ width: pw });
              }}
              className={btn(!custom && w === pw)}
            >
              {pw}
            </button>
          ))}
          <button type="button" onClick={() => setCustom(true)} className={btn(custom)}>
            Custom
          </button>
        </div>
        {custom && (
          <input
            value={w}
            onChange={(e) => set({ width: e.target.value || undefined })}
            placeholder="e.g. 320px, 60%, 20rem"
            className="mt-1.5 w-full rounded-md border border-ink/10 bg-base px-2.5 py-1.5 text-sm outline-none focus:border-primary"
          />
        )}
      </div>
    </div>
  );
}
