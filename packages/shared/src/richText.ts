// SINGLE rich-text sanitizer for the whole app (admin editor + every preview +
// the live website). Pure string operations — NO DOM — so the exact same logic
// runs in the browser (editor paste) and during SSR / static build (previews and
// published pages). Import it everywhere instead of re-implementing cleanup.
//
// It removes Microsoft Word / Outlook, Google Docs, Apple Pages and LibreOffice
// paste artifacts (conditional comments, <xml>, <o:p>, mso-* styles, Office
// classes), decodes escaped HTML (&lt;div&gt; → real markup that then gets
// cleaned), drops unsafe/unsupported elements (script, style, iframe, object …)
// and keeps a whitelist of real formatting: headings, paragraphs, bold, italic,
// underline, lists, tables, links, images, plus the site's gradient highlight
// spans, colours and font sizes.

// Tags kept in the output (everything else is unwrapped: tag removed, text kept).
const ALLOWED_TAGS = new Set([
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "strike", "del", "ins", "sub", "sup", "mark", "small",
  "ul", "ol", "li", "blockquote", "pre", "code",
  "span", "div", "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "td", "th", "caption", "colgroup", "col",
]);

// Elements removed TOGETHER WITH their content — never valid body content here.
const DROP_WITH_CONTENT =
  "script|style|xml|head|title|noscript|iframe|frame|frameset|object|embed|applet|svg|math|template|select|textarea|button|form|input|link|meta|base";

// Void tags that must self-close in the output.
const VOID_TAGS = new Set(["br", "hr", "img", "col"]);

// Inline CSS properties allowed to survive (the editor emits colour, font-size,
// alignment, table borders, image sizing). `mso-*` and anything else is dropped.
const SAFE_STYLE_PROPS = new Set([
  "color", "background", "background-color",
  "text-align", "text-decoration", "text-decoration-line", "text-transform",
  "font-size", "font-weight", "font-style", "font-family",
  "line-height", "letter-spacing", "vertical-align",
  "width", "height", "max-width", "min-width",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border", "border-top", "border-right", "border-bottom", "border-left",
  "border-color", "border-width", "border-style", "border-collapse", "border-radius",
  "display", "list-style", "list-style-type",
]);

// CSS class names the site actually relies on inside rich content. Word's
// "MsoNormal" etc. and Google Docs classes are dropped.
const SAFE_CLASSES = new Set(["grad-text", "rt-checklist", "rt-img", "checked"]);

// `style`, `class` and `title` are allowed on every kept tag; these are extra.
const ATTRS_BY_TAG: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel"]),
  img: new Set(["src", "alt", "width", "height"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
  col: new Set(["span"]),
  colgroup: new Set(["span"]),
};
const GLOBAL_ATTRS = new Set(["style", "class", "title"]);

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&");
}

// True when the string contains escaped tag/comment openings, e.g. "&lt;div&gt;"
// or "&lt;!--". Used so we only decode content that is actually escaped HTML.
function looksEscaped(s: string): boolean {
  return /&lt;\s*\/?[a-z!]/i.test(s) || /&lt;!--/i.test(s);
}

function escAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function filterStyle(value: string): string {
  const kept: string[] = [];
  for (const decl of value.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim().toLowerCase();
    const val = decl.slice(i + 1).trim();
    if (!prop || !val) continue;
    if (prop.startsWith("mso-") || prop.startsWith("-")) continue;
    if (!SAFE_STYLE_PROPS.has(prop)) continue;
    if (/expression\(|javascript:|url\s*\(/i.test(val)) continue;
    if (/mso-/i.test(val)) continue;
    kept.push(`${prop}: ${val}`);
  }
  return kept.join("; ");
}

function filterClass(value: string): string {
  return value
    .split(/\s+/)
    .filter((c) => SAFE_CLASSES.has(c))
    .join(" ");
}

function safeUrl(val: string, kind: "href" | "src"): string | null {
  const v = val.trim();
  if (!v) return null;
  if (/^\s*(javascript|vbscript|file):/i.test(v)) return null;
  if (/^\s*data:/i.test(v)) return kind === "src" && /^data:image\//i.test(v) ? v : null;
  return v;
}

// Tokenise an attribute string into name / value pairs.
const ATTR_RE = /([a-zA-Z_:][\w:.-]*)\s*(?:=\s*("([^"]*)"|'([^']*)'|[^\s"'=<>`]+))?/g;

function filterAttrs(tag: string, attrsStr: string): string {
  if (!attrsStr || !attrsStr.trim()) return "";
  const allowedForTag = ATTRS_BY_TAG[tag];
  const out: string[] = [];
  ATTR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR_RE.exec(attrsStr))) {
    if (m[0] === "") { ATTR_RE.lastIndex++; continue; }
    const name = m[1].toLowerCase();
    const raw = m[3] ?? m[4] ?? m[2] ?? "";
    if (name.startsWith("on")) continue;      // event handlers
    if (name.includes(":")) continue;          // xml:lang, o:*, v:*, w:*
    if (name.startsWith("data-")) continue;     // editor/Office metadata
    if (name === "style") { const v = filterStyle(raw); if (v) out.push(`style="${escAttr(v)}"`); continue; }
    if (name === "class") { const v = filterClass(raw); if (v) out.push(`class="${escAttr(v)}"`); continue; }
    if (name === "href") { const u = safeUrl(raw, "href"); if (u) out.push(`href="${escAttr(u)}"`); continue; }
    if (name === "src") { const u = safeUrl(raw, "src"); if (u) out.push(`src="${escAttr(u)}"`); continue; }
    if (!GLOBAL_ATTRS.has(name) && !(allowedForTag && allowedForTag.has(name))) continue;
    out.push(raw !== "" ? `${name}="${escAttr(raw)}"` : name);
  }
  return out.length ? " " + out.join(" ") : "";
}

const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*?)\s*(\/?)>/g;

function whitelistTags(html: string): string {
  return html.replace(TAG_RE, (_full, slash: string, name: string, attrs: string) => {
    const tag = name.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";          // unwrap: drop tag, keep text
    if (slash) return `</${tag}>`;
    const filtered = filterAttrs(tag, attrs || "");
    return VOID_TAGS.has(tag) ? `<${tag}${filtered} />` : `<${tag}${filtered}>`;
  });
}

/**
 * Clean any admin-authored / pasted rich HTML for safe, artifact-free rendering.
 * Safe on null/undefined. Returns "" for empty input.
 */
export function sanitizeRichText(input: string | null | undefined): string {
  if (!input || typeof input !== "string") return "";
  let s = input;

  // 1. Decode escaped HTML when the content is actually escaped markup.
  for (let i = 0; i < 2 && looksEscaped(s); i++) s = decodeEntities(s);

  // 2. Strip BOM / zero-width characters Word & Docs inject.
  s = s.replace(/[﻿​-‍⁠]/g, "");

  // 3. Processing instructions (<?xml … ?>) and doctypes.
  s = s.replace(/<\?[\s\S]*?\?>/g, "").replace(/<!doctype[^>]*>/gi, "");

  // 4. Comments — normal AND Office conditional (<!--[if …]> … <![endif]-->),
  //    plus downlevel-revealed conditionals (<![if …]> … <![endif]>).
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/<!\[[^\]]*\]>/g, "");

  // 5. Elements removed with their content, then any dangling void variants
  //    (e.g. <meta>, <link>, an unclosed <style>).
  s = s.replace(new RegExp(`<(${DROP_WITH_CONTENT})\\b[\\s\\S]*?</\\1\\s*>`, "gi"), "");
  s = s.replace(new RegExp(`<\\/?(${DROP_WITH_CONTENT})\\b[^>]*>`, "gi"), "");

  // 6. Any namespaced Office tag (<o:p>, <w:…>, <v:…>, <st1:…>) — keep inner text.
  s = s.replace(/<\/?[a-z][a-z0-9]*:[^>]*>/gi, "");

  // 7. Whitelist tags + filter their attributes.
  s = whitelistTags(s);

  // 8. Remove now-empty inline wrappers (empty spans, bold-of-nothing, …).
  let prev: string;
  do {
    prev = s;
    s = s.replace(
      /<(span|b|i|u|em|strong|small|mark|font|sub|sup|a)(\s[^>]*)?>(?:\s|&nbsp;|&#160;|<br\s*\/?>)*<\/\1>/gi,
      "",
    );
  } while (s !== prev);

  return s.trim();
}

// Compose with heading-tag stripping for fields injected INTO a heading element.
export function sanitizeHeading(input: string | null | undefined): string {
  return sanitizeRichText(input).replace(/<\/?h[1-6]\b[^>]*>/gi, "");
}

// Clean PLAIN-TEXT extraction — for short label fields (card titles, names,
// eyebrows) that are rendered as raw {text}, not HTML, but may have been polluted
// by a Word/Docs paste. Removes the junk, then strips ALL remaining tags and
// decodes entities so only readable text remains (never any visible markup).
export function stripToPlainText(input: string | null | undefined): string {
  const cleaned = sanitizeRichText(input);
  return cleaned
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
