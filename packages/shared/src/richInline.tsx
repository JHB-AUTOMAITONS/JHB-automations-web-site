import type { ElementType } from "react";
import { sanitizeRichText } from "./richText";

/**
 * Renders a short rich-text value (a bullet / list-item title, benefit, step,
 * FAQ question …) as SANITISED inline HTML, so admin-authored word links and
 * inline formatting (bold / italic / gradient / highlight) show on the live site
 * and in every preview — while plain-text values keep rendering exactly as
 * before (a plain string is valid HTML, so nothing changes for existing content).
 *
 * SINGLE place that decides how a bullet's inline HTML looks, so the website and
 * the admin previews stay in lockstep and any new bullet field gets the same
 * behaviour just by rendering through this.
 *
 *   <RichInline html={item.title} />                     // inline (default)
 *   <RichInline html={item.desc} block className="…" />  // block prose (lists ok)
 *
 * Security: `sanitizeRichText` runs on every value here (editor, preview AND
 * live render), keeping only a safe tag/attr allow-list and rejecting
 * javascript:/vbscript:/file: URLs — so injecting this HTML is XSS-safe.
 */

// Site link styling for links authored inside bullets — matches the existing
// inline-link convention (linkify() / prose): primary colour, medium weight,
// hover fade. No underline, so bullet links look like every other site link.
const LINK = "[&_a]:text-primary [&_a]:font-medium hover:[&_a]:opacity-80 [&_a]:transition-opacity";

// Inline: neutralise the block wrappers the editor may emit (a lone <p>/<div>
// around a single line) so the value flows inside an <h3>/<li>/<span> with no
// stray paragraph spacing, while still allowing <br>, bold, links, etc.
const INLINE = `[&_p]:m-0 [&_p]:inline [&_div]:m-0 [&_div]:inline ${LINK}`;

// Block: real prose (used for longer descriptions that may hold lists).
const BLOCK = `prose-jhb [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:m-0 ${LINK}`;

export function RichInline({
  html,
  className = "",
  block = false,
  as,
}: {
  html: string | null | undefined;
  className?: string;
  /** Render as block prose (a <div>) instead of inline (a <span>). */
  block?: boolean;
  /** Override the wrapper element (defaults to span inline / div block). */
  as?: ElementType;
}) {
  const Tag: ElementType = as ?? (block ? "div" : "span");
  return (
    <Tag
      className={`${block ? BLOCK : INLINE} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
    />
  );
}
