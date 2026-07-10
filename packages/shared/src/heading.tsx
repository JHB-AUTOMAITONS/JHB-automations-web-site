import type { ElementType, ReactNode } from "react";

// The semantic tag a heading renders as. "p" = a paragraph (no heading weight in
// the document outline), h1–h6 = the corresponding heading level. The VISUAL
// design is always driven by className, so changing the tag only affects the
// document structure (SEO), never the look.
export type HeadingTag = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export const HEADING_TAGS: HeadingTag[] = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];

/**
 * The heading level ONE below a section heading — for card / item titles under
 * it — so the document outline stays valid (H2 section → H3 cards → …). Never
 * goes past h6; a "p" section stays "p" (no heading weight anywhere below it).
 * Keeps card-title levels DYNAMIC (derived from the section's chosen tag) instead
 * of hardcoded, and clamps so it can never skip or overflow a level.
 */
export function subHeadingTag(tag?: HeadingTag | null, fallbackParent: HeadingTag = "h2"): HeadingTag {
  const parent = tag || fallbackParent;
  if (parent === "p") return "p";
  const n = Number(parent.slice(1));
  return `h${Math.min(6, n + 1)}` as HeadingTag;
}

/**
 * Render a heading as the admin-selected element, falling back to `fallback`
 * (the section's sensible default) when no tag has been chosen. Used by the
 * public site AND the admin previews so the rendered tag matches everywhere.
 *
 * Pass `html` for rich-text titles (renders via dangerouslySetInnerHTML on a
 * REAL <hN>, so SEO tools that only parse literal heading tags still detect the
 * title); otherwise pass `children`. This replaces the old `<div role="heading">`
 * pattern — the visual is still 100% className-driven, so nothing changes on
 * screen, only the semantic element.
 *
 *   <Heading tag={block.headingTag} fallback="h2" className="font-display ...">
 *     {heading}
 *   </Heading>
 *   <Heading tag="h3" html={sanitizedTitleHtml} className="card-title-classes" />
 */
export function Heading({
  tag,
  fallback = "h2",
  className,
  id,
  html,
  children,
}: {
  tag?: HeadingTag | null;
  fallback?: HeadingTag;
  className?: string;
  id?: string;
  html?: string;
  children?: ReactNode;
}) {
  const Tag = (tag || fallback) as ElementType;
  if (html != null) {
    return <Tag className={className} id={id} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return (
    <Tag className={className} id={id}>
      {children}
    </Tag>
  );
}
