import type { ElementType, ReactNode } from "react";

// The semantic tag a heading renders as. "p" = a paragraph (no heading weight in
// the document outline), h1–h6 = the corresponding heading level. The VISUAL
// design is always driven by className, so changing the tag only affects the
// document structure (SEO), never the look.
export type HeadingTag = "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export const HEADING_TAGS: HeadingTag[] = ["p", "h1", "h2", "h3", "h4", "h5", "h6"];

/**
 * Render a heading as the admin-selected element, falling back to `fallback`
 * (the section's sensible default) when no tag has been chosen. Used by the
 * public site AND the admin previews so the rendered tag matches everywhere.
 *
 *   <Heading tag={block.headingTag} fallback="h2" className="font-display ...">
 *     {heading}
 *   </Heading>
 */
export function Heading({
  tag,
  fallback = "h2",
  className,
  id,
  children,
}: {
  tag?: HeadingTag | null;
  fallback?: HeadingTag;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  const Tag = (tag || fallback) as ElementType;
  return (
    <Tag className={className} id={id}>
      {children}
    </Tag>
  );
}
