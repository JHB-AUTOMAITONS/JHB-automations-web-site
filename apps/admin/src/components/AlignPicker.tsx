"use client";

/**
 * Reusable segmented alignment control (Left / Center / Right) for section
 * headings and media, shared across editors so every section gets the same UI.
 * Pass `options` to limit the choices (e.g. ["left","right"] for image sides).
 */
export type Align = "left" | "center" | "right";

const BARS: Record<Align, [string, string, string]> = {
  left: ["self-start w-4", "self-start w-3", "self-start w-4"],
  center: ["self-center w-4", "self-center w-3", "self-center w-4"],
  right: ["self-end w-4", "self-end w-3", "self-end w-4"],
};
const LABEL: Record<Align, string> = { left: "Left", center: "Center", right: "Right" };

export default function AlignPicker({
  value,
  onChange,
  label,
  options = ["left", "center", "right"],
}: {
  value: Align;
  onChange: (v: Align) => void;
  label?: string;
  options?: Align[];
}) {
  return (
    <div>
      {label && <span className="mb-1 block text-[11px] font-medium text-muted">{label}</span>}
      <div className="inline-flex overflow-hidden rounded-lg border border-ink/10 bg-base">
        {options.map((o, i) => (
          <button
            key={o}
            type="button"
            title={LABEL[o]}
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium transition ${
              i > 0 ? "border-l border-ink/10" : ""
            } ${value === o ? "bg-primary/10 text-primary" : "text-muted hover:bg-ink/[0.04] hover:text-ink"}`}
          >
            <span className="flex w-4 flex-col gap-[3px]">
              {BARS[o].map((c, j) => (
                <span key={j} className={`h-[2px] rounded-full bg-current ${c}`} />
              ))}
            </span>
            {LABEL[o]}
          </button>
        ))}
      </div>
    </div>
  );
}
