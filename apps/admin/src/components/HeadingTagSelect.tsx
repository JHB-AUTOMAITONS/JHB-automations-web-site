"use client";

import type { HeadingTag } from "@jhb/shared/heading";

const OPTIONS: { value: HeadingTag; label: string }[] = [
  { value: "p", label: "Paragraph" },
  { value: "h1", label: "H1" },
  { value: "h2", label: "H2" },
  { value: "h3", label: "H3" },
  { value: "h4", label: "H4" },
  { value: "h5", label: "H5" },
  { value: "h6", label: "H6" },
];

/**
 * Compact "Heading Tag" dropdown shown beside a heading input. Lets the admin
 * choose the semantic element (Paragraph / H1–H6) without changing the visual
 * design. `fallback` is the section's default when no tag has been chosen yet.
 */
export default function HeadingTagSelect({
  value,
  onChange,
  fallback = "h2",
  title = "Heading tag (SEO only — doesn't change the styling)",
  className = "",
}: {
  value?: HeadingTag | null;
  onChange: (tag: HeadingTag) => void;
  fallback?: HeadingTag;
  title?: string;
  className?: string;
}) {
  return (
    <select
      value={value || fallback}
      onChange={(e) => onChange(e.target.value as HeadingTag)}
      title={title}
      aria-label="Heading tag"
      className={`shrink-0 rounded-lg border border-ink/10 bg-surface px-1.5 py-1 text-[11px] font-medium text-muted outline-none focus:border-primary ${className}`}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
