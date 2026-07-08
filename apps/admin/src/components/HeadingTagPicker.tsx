"use client";

import { HEADING_TAGS, type HeadingTag } from "@jhb/shared/heading";

/**
 * Reusable heading-tag (H1–H6 / Paragraph) selector for section headings, shared
 * across editors so every heading can choose its semantic level. The VISUAL style
 * of a heading never changes — only the rendered HTML element — so this controls
 * the document outline / SEO, not the look.
 *
 * SEO note: a page should have exactly ONE H1 (the main heading). The editor
 * surfaces a warning when more than one H1 is selected; this picker never blocks.
 */
const LABELS: Record<HeadingTag, string> = {
  h1: "H1",
  h2: "H2",
  h3: "H3",
  h4: "H4",
  h5: "H5",
  h6: "H6",
  p: "Paragraph",
};

export default function HeadingTagPicker({
  value,
  onChange,
  fallback = "h2",
  label = "Heading tag",
}: {
  value: HeadingTag | null | undefined;
  onChange: (v: HeadingTag) => void;
  /** The tag used when none is chosen — shown as the selected option. */
  fallback?: HeadingTag;
  label?: string;
}) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-[11px] font-medium text-muted">{label}</span>}
      <select
        value={value ?? fallback}
        onChange={(e) => onChange(e.target.value as HeadingTag)}
        className="input"
        title="Semantic heading level (SEO). Does not change the visual style."
      >
        {HEADING_TAGS.map((t) => (
          <option key={t} value={t}>
            {LABELS[t]}
          </option>
        ))}
      </select>
    </label>
  );
}
