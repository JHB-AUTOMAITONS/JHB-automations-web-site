"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { InternalPage } from "@jhb/shared/service-pages";
import { sanitizeRichText } from "@jhb/shared/rich-text";
import ColorEditor from "./ColorEditor";
import FontSizeControl, { wrapSelectionFontSize } from "./FontSizeControl";
import { EDITOR_FONTS, matchFont } from "./editorFonts";
import ImageInsertDialog from "./ImageInsertDialog";

type Props = {
  value: string;
  onChange: (html: string) => void;
  internalPages?: InternalPage[];
  // Minimum height of the editing surface in px (default 200, or 40 in compact mode).
  minHeight?: number;
  // Compact mode: a slim single-row toolbar (bold / italic / underline /
  // strike / highlight / gradient / 🔗 link / clear) and a short editing surface.
  // For small inline "bullet"/list-item fields (feature titles, benefits, steps,
  // FAQ questions …) that need word-linking without the full editor's chrome.
  // Same link dialog, sanitizer and paste handling as the full editor.
  compact?: boolean;
  // Optional fixed max height (px) for the editing surface. When set, the content
  // area scrolls INTERNALLY past this height: the mouse wheel scrolls the editor
  // (not the page) until it reaches its top/bottom, at which point native scroll
  // chaining resumes. The toolbar (a sibling above the scroll area) stays visible.
  // Opt-in — ONLY the Blog Content editor passes it; every other editor leaves it
  // unset and grows with its content exactly as before.
  maxHeight?: number;
  // Optional visual alignment of the editing surface — mirrors a section's
  // alignment control so WYSIWYG matches how the content will actually render.
  // Purely presentational (not written into the saved HTML); the section's
  // align field stays the single source of truth.
  align?: "left" | "center" | "right";
};

type LinkDraft = {
  url: string;
  title: string;
  newTab: boolean;
  nofollow: boolean;
  sponsored: boolean;
  ugc: boolean;
};

const EMPTY_DRAFT: LinkDraft = {
  url: "",
  title: "",
  newTab: false,
  nofollow: false,
  sponsored: false,
  ugc: false,
};

// Inline character formatting (semantic tags, toggled like Word).
const INLINE: { cmd: string; label: string; title: string; cls?: string }[] = [
  { cmd: "bold", label: "B", title: "Bold (Ctrl+B)", cls: "font-bold" },
  { cmd: "italic", label: "I", title: "Italic (Ctrl+I)", cls: "italic" },
  { cmd: "underline", label: "U", title: "Underline (Ctrl+U)", cls: "underline" },
  { cmd: "strikeThrough", label: "S", title: "Strikethrough", cls: "line-through" },
];

// Alignment — applied as inline `text-align` so it survives into published HTML.
const ALIGN: { cmd: string; label: string; title: string }[] = [
  { cmd: "justifyLeft", label: "⫷", title: "Align left" },
  { cmd: "justifyCenter", label: "≡", title: "Align center" },
  { cmd: "justifyRight", label: "⫸", title: "Align right" },
  { cmd: "justifyFull", label: "☰", title: "Justify" },
];

// Paragraph + headings + quote/code for the block-format dropdown.
const BLOCKS = [
  { tag: "P", label: "Paragraph" },
  { tag: "H1", label: "Heading 1" },
  { tag: "H2", label: "Heading 2" },
  { tag: "H3", label: "Heading 3" },
  { tag: "H4", label: "Heading 4" },
  { tag: "H5", label: "Heading 5" },
  { tag: "H6", label: "Heading 6" },
  { tag: "BLOCKQUOTE", label: "Block Quote" },
  { tag: "PRE", label: "Code" },
];
const BLOCK_TAGS = new Set(BLOCKS.map((b) => b.tag));

// Validate any CSS color string (HEX, rgb()/rgba(), or a colour name) using the
// browser's own parser — returns true only if the value is understood as a colour.
function isValidColor(c: string): boolean {
  const s = c.trim();
  if (!s) return false;
  const probe = new Option().style;
  probe.color = "";
  probe.color = s;
  return probe.color !== "";
}

// Accept internal paths/anchors, mailto/tel, and absolute http(s) URLs.
function isValidLinkUrl(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  if (s.startsWith("/") || s.startsWith("#")) return true;
  if (/^(mailto:|tel:)/i.test(s)) return true;
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function buildRel(d: LinkDraft): string {
  const rel: string[] = [];
  if (d.nofollow) rel.push("nofollow");
  if (d.sponsored) rel.push("sponsored");
  if (d.ugc) rel.push("ugc");
  if (d.newTab) rel.push("noopener", "noreferrer");
  return rel.join(" ");
}

// Clean pasted HTML with the shared sanitizer (strips Word/Docs/Outlook/Office
// markup, conditional comments, XML, scripts and unsafe tags/attrs while keeping
// real formatting). Then strip block-level backgrounds Word/Docs carry — they
// render as a light box on the dark site — but keep span-level highlights. DOM
// work is safe here since paste only runs in the browser.
function sanitizePastedHtml(html: string): string {
  const tpl = document.createElement("template");
  tpl.innerHTML = sanitizeRichText(html);
  const BG_BLOCKS = /^(P|DIV|H[1-6]|UL|OL|LI|SECTION|ARTICLE|BLOCKQUOTE|FONT)$/;
  tpl.content.querySelectorAll<HTMLElement>("*").forEach((el) => {
    if (BG_BLOCKS.test(el.tagName)) {
      el.style.removeProperty("background");
      el.style.removeProperty("background-color");
      el.removeAttribute("bgcolor");
      if (!el.getAttribute("style")) el.removeAttribute("style");
    }
  });
  return tpl.innerHTML;
}

export default function RichEditor({ value, onChange, internalPages = [], minHeight, compact = false, maxHeight, align }: Props) {
  const minH = minHeight ?? (compact ? 40 : 200);
  const ref = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const editingAnchor = useRef<HTMLAnchorElement | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [draft, setDraft] = useState<LinkDraft>(EMPTY_DRAFT);
  const [pageQuery, setPageQuery] = useState("");
  const [urlError, setUrlError] = useState("");
  const [hint, setHint] = useState("");

  // Font size / colour state
  const styleRange = useRef<Range | null>(null);
  const [colorOpen, setColorOpen] = useState(false);
  // Whether the colour editor is targeting text colour or text-background highlight.
  const colorMode = useRef<"text" | "highlight">("text");
  const [recent, setRecent] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [fontSizePx, setFontSizePx] = useState(14);
  // The font family at the caret, so the Font dropdown shows the active face.
  const [fontFamily, setFontFamily] = useState("");
  // The block style at the caret, so the Style dropdown shows the active style.
  const [blockTag, setBlockTag] = useState("P");
  // Set by Ctrl+Shift+V so the next paste drops all formatting.
  const plainPaste = useRef(false);

  // ----- Insert / edit image -----
  const wrapRef = useRef<HTMLDivElement>(null);
  const [imgDialog, setImgDialog] = useState<null | "insert" | "replace">(null);
  const [imgSel, setImgSel] = useState<{ figure: HTMLElement; img: HTMLImageElement } | null>(null);
  const [imgPos, setImgPos] = useState<{ top: number; left: number } | null>(null);
  const [imgFields, setImgFields] = useState({ alt: "", title: "", caption: "", width: "auto", custom: false, align: "center" });

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value;
    try {
      const r = JSON.parse(localStorage.getItem("jhb_recent_colors") || "[]");
      if (Array.isArray(r)) setRecent(r.slice(0, 8));
      const s = JSON.parse(localStorage.getItem("jhb_saved_colors") || "[]");
      if (Array.isArray(s)) setSaved(s.slice(0, 16));
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-sync the DOM when `value` changes programmatically (AI "Apply to form",
  // switching records, restoring a version). Skipped while this editor is
  // focused so it never jumps the caret mid-typing — live typing flows out via
  // `sync()`/onChange instead. Without this the editor is write-once and silently
  // ignores any external update to `value`.
  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const sync = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  // Preserve the editor selection across toolbar interactions (a dropdown or
  // popover steals focus and would otherwise drop it).
  const saveSel = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current && ref.current.contains(sel.anchorNode)) {
      styleRange.current = sel.getRangeAt(0).cloneRange();
    }
  };
  const restoreSel = () => {
    const sel = window.getSelection();
    if (sel && styleRange.current) {
      sel.removeAllRanges();
      sel.addRange(styleRange.current);
    }
  };

  // Apply a px font size to the saved selection (shared Word-style helper).
  const applyFontSize = (px: string) => {
    if (!ref.current) return;
    ref.current.focus();
    restoreSel();
    wrapSelectionFontSize(ref.current, px);
    const n = parseInt(px, 10);
    if (!Number.isNaN(n)) setFontSizePx(n);
    sync();
  };

  // Apply a font family to the saved selection as an inline `font-family` style
  // so the published page renders the same face (web fonts are loaded globally).
  const applyFont = (name: string) => {
    const font = EDITOR_FONTS.find((f) => f.name === name);
    if (!font || !ref.current) return;
    ref.current.focus();
    restoreSel();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("fontName", false, font.stack);
    document.execCommand("styleWithCSS", false, "false");
    setFontFamily(name);
    sync();
  };

  // Reflect the size + font at the caret in the toolbar controls, like Word.
  const readCaretStyle = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !ref.current) return;
    const node = sel.anchorNode;
    if (!node || !ref.current.contains(node)) return;
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
    if (!el) return;
    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize);
    if (!Number.isNaN(px)) setFontSizePx(Math.round(px));
    setFontFamily(matchFont(cs.fontFamily));
  };

  // Reflect the block style (paragraph / heading / quote / code) at the caret,
  // so the Style dropdown always shows the currently-applied style — and only
  // for THIS editor (selectionchange fires globally; ignore other editors).
  const readCaretBlock = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !ref.current) return;
    const node = sel.anchorNode;
    if (!node || !ref.current.contains(node)) return;
    let el: HTMLElement | null =
      node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
    while (el && el !== ref.current) {
      if (BLOCK_TAGS.has(el.tagName)) {
        setBlockTag(el.tagName);
        return;
      }
      el = el.parentElement;
    }
    setBlockTag("P"); // no explicit block wrapper → treat as Paragraph
  };

  useEffect(() => {
    const handler = () => {
      readCaretStyle();
      readCaretBlock();
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushRecent = (c: string) => {
    setRecent((prev) => {
      const next = [c, ...prev.filter((x) => x.toLowerCase() !== c.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem("jhb_recent_colors", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // Apply any CSS colour (HEX / rgb() / hsl() / name) to the selection inline —
  // either the text colour or the text-background highlight, per `colorMode`.
  const applyColor = (raw: string) => {
    const c = raw.trim();
    if (!isValidColor(c)) return;
    ref.current?.focus();
    restoreSel();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(colorMode.current === "highlight" ? "hiliteColor" : "foreColor", false, c);
    document.execCommand("styleWithCSS", false, "false");
    pushRecent(c);
    setColorOpen(false);
    sync();
  };

  const openColor = (mode: "text" | "highlight") => {
    colorMode.current = mode;
    saveSel();
    setColorOpen(true);
  };

  const saveCustom = (c: string) => {
    setSaved((prev) => {
      const next = [c, ...prev.filter((x) => x.toLowerCase() !== c.toLowerCase())].slice(0, 16);
      try {
        localStorage.setItem("jhb_saved_colors", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // Run a command that toggles a semantic tag / native behaviour (bold, lists,
  // super/subscript, undo/redo…). Selection is preserved by the button's
  // onMouseDown preventDefault, so the live caret is used.
  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    sync();
  };

  // Run a command whose result should be an inline CSS style (alignment) so it
  // survives into the published HTML and the `.prose-jhb` renderer.
  const execCss = (cmd: string, arg?: string) => {
    const host = ref.current;
    host?.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(cmd, false, arg);
    document.execCommand("styleWithCSS", false, "false");
    // A single-line field (e.g. a card title) often has NO block child, so the
    // browser applies the alignment to the editing HOST element. Only innerHTML
    // is saved, so a host-level text-align would be silently lost on save (and
    // in the preview / live page). Move it onto a wrapping block so it persists.
    if (host && host.style.textAlign) {
      const align = host.style.textAlign;
      const wrapper = document.createElement("div");
      wrapper.style.textAlign = align;
      while (host.firstChild) wrapper.appendChild(host.firstChild);
      host.appendChild(wrapper);
      host.style.removeProperty("text-align");
    }
    sync();
  };

  // Walk up from a node to the nearest ancestor with the given tag, inside the editor.
  const closestTag = (node: Node | null, tag: string): HTMLElement | null => {
    let n: Node | null = node;
    while (n && n !== ref.current) {
      if (n.nodeType === Node.ELEMENT_NODE && (n as HTMLElement).tagName === tag) {
        return n as HTMLElement;
      }
      n = n.parentNode;
    }
    return null;
  };

  // Checklist — toggle the list at the caret into / out of a checkbox list.
  // (No execCommand exists for this, so we tag a normal <ul> with a class and
  // toggle item state on click; CSS in globals renders the ☐ / ☑ markers.)
  const toggleChecklist = () => {
    ref.current?.focus();
    const sel = window.getSelection();
    let ul = closestTag(sel?.anchorNode ?? null, "UL");
    if (ul) {
      ul.classList.toggle("rt-checklist");
    } else {
      document.execCommand("insertUnorderedList");
      ul = closestTag(window.getSelection()?.anchorNode ?? null, "UL");
      ul?.classList.add("rt-checklist");
    }
    sync();
  };

  // Click the ☐ / ☑ marker (the gutter left of the text) to tick / untick an
  // item. Restricted to the gutter so clicking the text just places the caret.
  const onEditorClick = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    // Click an image → open its edit toolbar; click anything else → close it.
    if (t.tagName === "IMG" && ref.current?.contains(t)) {
      selectImage(t as HTMLImageElement);
      return;
    }
    if (imgSel) closeImgPanel();
    const li = t.closest?.("li");
    if (li && li.parentElement?.classList.contains("rt-checklist")) {
      const dx = e.clientX - li.getBoundingClientRect().left;
      if (dx < -2 && dx > -32) {
        li.classList.toggle("checked");
        sync();
      }
    }
  };

  // Ctrl+Shift+V → next paste arrives as plain text.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "v" || e.key === "V")) {
      plainPaste.current = true;
    }
  };

  // Paste: keep formatting (sanitised) by default, or strip it after Ctrl+Shift+V.
  const onPaste = (e: React.ClipboardEvent) => {
    const cd = e.clipboardData;
    if (!cd) return;
    const wantPlain = plainPaste.current;
    plainPaste.current = false;
    const html = cd.getData("text/html");
    e.preventDefault();
    if (!wantPlain && html) {
      document.execCommand("insertHTML", false, sanitizePastedHtml(html));
    } else {
      document.execCommand("insertText", false, cd.getData("text/plain"));
    }
    sync();
  };

  // Inline gradient highlight (the site's .grad-text effect) applied to the
  // selected words — toggles like Bold/Italic. No execCommand can wrap a
  // semantic class, so we wrap/unwrap the Range directly.
  const gradAncestor = (node: Node | null): HTMLElement | null => {
    let n: Node | null = node;
    while (n && n !== ref.current) {
      if (
        n.nodeType === Node.ELEMENT_NODE &&
        (n as HTMLElement).classList?.contains("grad-text")
      )
        return n as HTMLElement;
      n = n.parentNode;
    }
    return null;
  };

  const applyHighlight = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed || !ref.current) return;
    const range = sel.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return;

    // Toggle off: selection sits inside an existing grad-text span → unwrap it.
    const existing = gradAncestor(range.commonAncestorContainer);
    if (existing && existing.parentNode) {
      const parent = existing.parentNode;
      while (existing.firstChild) parent.insertBefore(existing.firstChild, existing);
      parent.removeChild(existing);
      sync();
      return;
    }

    // Wrap the selection in <span class="grad-text">.
    const span = document.createElement("span");
    span.className = "grad-text";
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      // Re-select the new span so a second click toggles it off.
      const r = document.createRange();
      r.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(r);
    } catch {
      /* selection couldn't be wrapped cleanly */
    }
    sync();
  };

  // Block format (paragraph / H1–H6) applied to the saved selection.
  const applyBlock = (tag: string) => {
    ref.current?.focus();
    restoreSel();
    document.execCommand("formatBlock", false, tag);
    setBlockTag(tag);
    sync();
  };

  const insertTable = () => {
    ref.current?.focus();
    const cell = '<td style="border:1px solid #d9deea;padding:6px">&nbsp;</td>';
    const row = `<tr>${cell}${cell}${cell}</tr>`;
    const table = `<table style="border-collapse:collapse;width:100%;margin:8px 0">${row}${row}</table><p><br/></p>`;
    document.execCommand("insertHTML", false, table);
    sync();
  };

  // ----- Image insertion + click-to-edit -----
  const escAttr = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Inline styles keep the figure self-contained — renders identically in the
  // editor and on the published page (no extra global CSS needed).
  const IMG_STYLE = "width:auto;height:auto;max-width:100%;display:inline-block;border-radius:0.75rem";

  // Insert the image at the saved cursor position (between two paragraphs, etc.).
  const insertImage = (url: string, alt: string) => {
    ref.current?.focus();
    restoreSel();
    const html = `<figure class="rt-img" style="text-align:center;margin:1.25rem 0"><img src="${escAttr(url)}" alt="${escAttr(alt)}" style="${IMG_STYLE}" /></figure><p><br/></p>`;
    document.execCommand("insertHTML", false, html);
    sync();
  };

  const replaceImage = (url: string, alt: string) => {
    if (!imgSel) return;
    imgSel.img.setAttribute("src", url);
    if (alt) {
      imgSel.img.setAttribute("alt", alt);
      setImgFields((f) => ({ ...f, alt }));
    }
    sync();
  };

  // Position the floating image toolbar just below the figure (offsets are
  // relative to the position:relative wrapper, so it scrolls with the content).
  const repositionImg = (figure: HTMLElement) =>
    setImgPos({ top: figure.offsetTop + figure.offsetHeight + 6, left: Math.max(8, figure.offsetLeft) });

  // Click an image → wrap it in a <figure> (if needed), read its current settings
  // into the panel, and show the floating image toolbar.
  const selectImage = (img: HTMLImageElement) => {
    if (!ref.current) return;
    let figure = img.closest("figure.rt-img") as HTMLElement | null;
    if (!figure) {
      figure = document.createElement("figure");
      figure.className = "rt-img";
      figure.setAttribute("style", "text-align:center;margin:1.25rem 0");
      img.parentNode?.insertBefore(figure, img);
      figure.appendChild(img);
      if (!img.getAttribute("style")) img.setAttribute("style", IMG_STYLE);
      sync();
    }
    const cap = figure.querySelector("figcaption");
    const w = img.style.width || "auto";
    setImgSel({ figure, img });
    setImgFields({
      alt: img.getAttribute("alt") || "",
      title: img.getAttribute("title") || "",
      caption: cap?.textContent || "",
      width: w,
      custom: !["auto", "25%", "50%", "75%", "100%"].includes(w),
      align: figure.style.textAlign || "center",
    });
    repositionImg(figure);
  };

  const closeImgPanel = () => {
    setImgSel(null);
    setImgPos(null);
  };

  // Apply a change to the selected image's DOM, then keep panel state + position in step.
  const applyImg = (
    patch: Partial<typeof imgFields>,
    dom: (s: { figure: HTMLElement; img: HTMLImageElement }) => void,
  ) => {
    setImgFields((f) => ({ ...f, ...patch }));
    if (!imgSel) return;
    dom(imgSel);
    sync();
    repositionImg(imgSel.figure);
  };
  const setImgAlt = (v: string) => applyImg({ alt: v }, ({ img }) => img.setAttribute("alt", v));
  const setImgTitle = (v: string) =>
    applyImg({ title: v }, ({ img }) => (v ? img.setAttribute("title", v) : img.removeAttribute("title")));
  const setImgWidth = (v: string) => applyImg({ width: v }, ({ img }) => (img.style.width = v === "auto" ? "auto" : v));
  const setImgAlign = (v: string) => applyImg({ align: v }, ({ figure }) => (figure.style.textAlign = v));
  const setImgCaption = (v: string) =>
    applyImg({ caption: v }, ({ figure }) => {
      let cap = figure.querySelector("figcaption");
      if (v) {
        if (!cap) {
          cap = document.createElement("figcaption");
          cap.setAttribute("style", "margin-top:0.5rem;font-size:0.85rem;opacity:0.75");
          figure.appendChild(cap);
        }
        cap.textContent = v;
      } else if (cap) {
        cap.remove();
      }
    });
  const removeImg = () => {
    if (!imgSel) return;
    imgSel.figure.remove();
    closeImgPanel();
    sync();
  };

  const flashHint = (msg: string) => {
    setHint(msg);
    setTimeout(() => setHint(""), 2500);
  };

  // Walk up from a node to find an <a> ancestor inside the editor.
  const anchorFrom = (node: Node | null): HTMLAnchorElement | null => {
    let n: Node | null = node;
    while (n && n !== ref.current) {
      if (n.nodeName === "A") return n as HTMLAnchorElement;
      n = n.parentNode;
    }
    return null;
  };

  const openLink = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      flashHint("Place the cursor in a link to edit it, or select text to add one.");
      return;
    }
    const range = sel.getRangeAt(0);
    const anchor = anchorFrom(range.commonAncestorContainer);
    setUrlError("");
    setPageQuery("");

    if (anchor) {
      // Edit an existing link (no text selection required).
      editingAnchor.current = anchor;
      const rel = (anchor.getAttribute("rel") || "").toLowerCase().split(/\s+/);
      setDraft({
        url: anchor.getAttribute("href") || "",
        title: anchor.getAttribute("title") || "",
        newTab: anchor.getAttribute("target") === "_blank",
        nofollow: rel.includes("nofollow"),
        sponsored: rel.includes("sponsored"),
        ugc: rel.includes("ugc"),
      });
      savedRange.current = range.cloneRange();
      setIsEdit(true);
      setLinkOpen(true);
      return;
    }

    // Add a new link — needs selected text to wrap.
    if (sel.isCollapsed) {
      flashHint("Select some text first, then add a link.");
      return;
    }
    editingAnchor.current = null;
    savedRange.current = range.cloneRange();
    setDraft(EMPTY_DRAFT);
    setIsEdit(false);
    setLinkOpen(true);
  };

  const filteredPages = useMemo(() => {
    const q = pageQuery.trim().toLowerCase();
    if (!q) return internalPages.slice(0, 8);
    return internalPages.filter((p) => p.label.toLowerCase().includes(q) || p.url.includes(q)).slice(0, 8);
  }, [pageQuery, internalPages]);

  const applyLink = () => {
    const url = draft.url.trim();
    if (!isValidLinkUrl(url)) {
      setUrlError("Enter a valid URL — https://example.com, /internal-page, #anchor, mailto: or tel:");
      return;
    }
    const title = draft.title.trim();
    const rel = buildRel(draft);
    const anchor = editingAnchor.current;

    if (anchor) {
      // Update the existing link in place — preserves its text & formatting.
      anchor.setAttribute("href", url);
      if (title) anchor.setAttribute("title", title);
      else anchor.removeAttribute("title");
      if (draft.newTab) anchor.setAttribute("target", "_blank");
      else anchor.removeAttribute("target");
      if (rel) anchor.setAttribute("rel", rel);
      else anchor.removeAttribute("rel");
    } else {
      const range = savedRange.current;
      if (!range) return;
      const a = document.createElement("a");
      a.setAttribute("href", url);
      if (title) a.setAttribute("title", title);
      if (draft.newTab) a.setAttribute("target", "_blank");
      if (rel) a.setAttribute("rel", rel);
      try {
        const frag = range.extractContents();
        a.appendChild(frag);
        range.insertNode(a);
      } catch {
        /* selection couldn't be wrapped */
      }
    }
    closeDialog();
    sync();
  };

  const removeLink = () => {
    const anchor = editingAnchor.current;
    if (anchor && anchor.parentNode) {
      const parent = anchor.parentNode;
      while (anchor.firstChild) parent.insertBefore(anchor.firstChild, anchor);
      parent.removeChild(anchor);
    }
    closeDialog();
    sync();
  };

  const closeDialog = () => {
    setLinkOpen(false);
    setIsEdit(false);
    editingAnchor.current = null;
    savedRange.current = null;
    setUrlError("");
  };

  const tbtn =
    "rounded-md px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink";
  const divider = <span className="mx-0.5 h-5 w-px bg-ink/10" />;

  return (
    <div className="rounded-xl border border-ink/10 bg-base">
      <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 p-1.5">
        {compact ? (
          <>
            {/* Bold / Italic / Underline / Strikethrough */}
            {INLINE.map((t) => (
              <button
                key={t.cmd}
                type="button"
                title={t.title}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => exec(t.cmd)}
                className={`${tbtn} ${t.cls ?? ""}`}
              >
                {t.label}
              </button>
            ))}
            {divider}
            {/* Highlight (text background) + brand gradient */}
            <button
              type="button"
              title="Highlight colour (text background)"
              onMouseDown={(e) => {
                e.preventDefault();
                openColor("highlight");
              }}
              className={tbtn}
            >
              🖍
            </button>
            <button
              type="button"
              title="Gradient brand highlight — click again to remove"
              onMouseDown={(e) => e.preventDefault()}
              onClick={applyHighlight}
              className="rounded-md px-2 py-1 text-xs font-bold transition-colors hover:bg-ink/[0.06]"
            >
              <span className="grad-text">G</span>
            </button>
            {divider}
            {/* Word link — the whole point of compact mode */}
            <button
              type="button"
              title="Add a link to selected text, or edit a link the cursor is inside"
              onMouseDown={(e) => e.preventDefault()}
              onClick={openLink}
              className="rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              🔗 Link
            </button>
            <button
              type="button"
              title="Clear formatting"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => exec("removeFormat")}
              className={`${tbtn} ml-auto`}
            >
              Clear
            </button>
          </>
        ) : (
          <>
        {/* Font family */}
        <select
          title="Font family"
          value={fontFamily}
          onMouseDown={saveSel}
          onChange={(e) => applyFont(e.target.value)}
          className="max-w-[8.5rem] rounded-md border border-ink/10 bg-surface px-1.5 py-1 text-xs font-semibold text-ink focus:outline-none"
          style={fontFamily ? { fontFamily: EDITOR_FONTS.find((f) => f.name === fontFamily)?.stack } : undefined}
        >
          <option value="">Font</option>
          {EDITOR_FONTS.map((f) => (
            <option key={f.name} value={f.name} style={{ fontFamily: f.stack }}>
              {f.name}
            </option>
          ))}
        </select>

        {/* Font size — Word-style numeric box + presets + steppers */}
        <FontSizeControl value={fontSizePx} onApply={applyFontSize} onBeforeChange={saveSel} />

        {divider}

        {/* Paragraph / heading block style */}
        <select
          title="Paragraph / heading style"
          value={blockTag}
          onMouseDown={saveSel}
          onChange={(e) => applyBlock(e.target.value)}
          className="rounded-md border border-ink/10 bg-surface px-1.5 py-1 text-xs font-semibold text-muted hover:text-ink focus:outline-none"
        >
          {BLOCKS.map((b) => (
            <option key={b.tag} value={b.tag}>
              {b.label}
            </option>
          ))}
        </select>

        {divider}

        {/* Bold / Italic / Underline / Strikethrough */}
        {INLINE.map((t) => (
          <button
            key={t.cmd}
            type="button"
            title={t.title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(t.cmd)}
            className={`${tbtn} ${t.cls ?? ""}`}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          title="Superscript"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("superscript")}
          className={tbtn}
        >
          x²
        </button>
        <button
          type="button"
          title="Subscript"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("subscript")}
          className={tbtn}
        >
          x₂
        </button>

        {divider}

        {/* Text colour */}
        <button
          type="button"
          title="Text colour"
          onMouseDown={(e) => {
            e.preventDefault();
            openColor("text");
          }}
          className={tbtn}
        >
          🎨 Colour
        </button>
        {/* Background highlight colour */}
        <button
          type="button"
          title="Highlight colour (text background)"
          onMouseDown={(e) => {
            e.preventDefault();
            openColor("highlight");
          }}
          className={tbtn}
        >
          🖍 Highlight
        </button>
        {/* Brand gradient highlight — toggles on the selection like Bold */}
        <button
          type="button"
          title="Gradient brand highlight — click again to remove"
          onMouseDown={(e) => e.preventDefault()}
          onClick={applyHighlight}
          className="rounded-md px-2 py-1 text-xs font-bold transition-colors hover:bg-ink/[0.06]"
        >
          <span className="grad-text">Gradient</span>
        </button>

        {divider}

        {/* Alignment */}
        {ALIGN.map((a) => (
          <button
            key={a.cmd}
            type="button"
            title={a.title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => execCss(a.cmd)}
            className={tbtn}
          >
            {a.label}
          </button>
        ))}

        {divider}

        {/* Lists */}
        <button
          type="button"
          title="Bullet list"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertUnorderedList")}
          className={tbtn}
        >
          • List
        </button>
        <button
          type="button"
          title="Numbered list"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertOrderedList")}
          className={tbtn}
        >
          1. List
        </button>
        <button
          type="button"
          title="Checklist"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleChecklist}
          className={tbtn}
        >
          ☑ List
        </button>

        {divider}

        {/* Horizontal divider + table */}
        <button
          type="button"
          title="Horizontal divider"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertHorizontalRule")}
          className={tbtn}
        >
          ―
        </button>
        <button
          type="button"
          title="Insert image at the cursor"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSel();
          }}
          onClick={() => setImgDialog("insert")}
          className={tbtn}
        >
          🖼 Image
        </button>
        <button
          type="button"
          title="Insert table"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertTable}
          className={tbtn}
        >
          ▦ Table
        </button>
        <button
          type="button"
          title="Add a link to selected text, or edit a link the cursor is inside"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openLink}
          className="rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          🔗 Link
        </button>

        {divider}

        {/* Undo / Redo */}
        <button
          type="button"
          title="Undo (Ctrl+Z)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("undo")}
          className={tbtn}
        >
          ↶
        </button>
        <button
          type="button"
          title="Redo (Ctrl+Y)"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("redo")}
          className={tbtn}
        >
          ↷
        </button>

        {/* Clear formatting */}
        <button
          type="button"
          title="Clear formatting"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("removeFormat")}
          className={`${tbtn} ml-auto`}
        >
          Clear
        </button>
          </>
        )}
      </div>

      {hint && <p className="border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-700">{hint}</p>}

      <div
        ref={wrapRef}
        className="relative"
        style={maxHeight ? { maxHeight, overflowY: "auto", scrollBehavior: "smooth" } : undefined}
      >
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          onClick={onEditorClick}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          style={{ minHeight: minH, ...(align ? { textAlign: align } : {}) }}
          className="prose-jhb px-4 py-3 text-sm leading-relaxed outline-none [&_a]:text-primary [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:text-muted [&_h1]:mt-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:font-semibold [&_h5]:font-semibold [&_h6]:font-semibold [&_hr]:my-3 [&_hr]:border-ink/15 [&_pre]:my-2 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-ink/[0.05] [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[13px] [&_s]:line-through [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_.rt-checklist]:list-none [&_.rt-checklist]:pl-6 [&_figure]:my-4 [&_img]:max-w-full [&_img]:h-auto [&_figcaption]:text-center [&_figcaption]:text-muted"
        />

        {/* Floating image edit toolbar — appears when an image is clicked. */}
        {imgSel && imgPos && (
          <div
            style={{ position: "absolute", top: imgPos.top, left: imgPos.left, zIndex: 30 }}
            className="w-[19.5rem] max-w-[calc(100%-1rem)] rounded-xl border border-ink/10 bg-surface p-2.5 shadow-soft-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Image</span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={closeImgPanel}
                className="grid h-5 w-5 place-items-center rounded text-muted hover:bg-ink/[0.06]"
              >
                ✕
              </button>
            </div>

            {/* Alignment + width */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {([["left", "⫷"], ["center", "≡"], ["right", "⫸"]] as const).map(([a, ic]) => (
                <button
                  key={a}
                  type="button"
                  title={`Align ${a}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setImgAlign(a)}
                  className={`rounded-md border px-2 py-1 text-xs ${
                    imgFields.align === a ? "border-primary text-primary" : "border-ink/10 text-muted hover:text-ink"
                  }`}
                >
                  {ic}
                </button>
              ))}
              <span className="mx-0.5 h-4 w-px bg-ink/10" />
              <select
                value={imgFields.custom ? "custom" : imgFields.width}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "custom") setImgFields((f) => ({ ...f, custom: true }));
                  else {
                    setImgFields((f) => ({ ...f, custom: false }));
                    setImgWidth(v);
                  }
                }}
                title="Image width"
                className="rounded-md border border-ink/10 bg-base px-1.5 py-1 text-xs text-muted outline-none focus:border-primary"
              >
                <option value="auto">Auto</option>
                <option value="25%">25%</option>
                <option value="50%">50%</option>
                <option value="75%">75%</option>
                <option value="100%">100%</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {imgFields.custom && (
              <input
                value={imgFields.width === "auto" ? "" : imgFields.width}
                onChange={(e) => setImgWidth(e.target.value || "auto")}
                placeholder="e.g. 320px or 60%"
                className="mt-1.5 w-full rounded-md border border-ink/10 bg-base px-2 py-1 text-xs outline-none focus:border-primary"
              />
            )}

            {/* Alt / Caption / Title */}
            <label className="mt-2 block text-[10px] font-medium text-muted">
              Alt text (SEO)
              <input
                value={imgFields.alt}
                onChange={(e) => setImgAlt(e.target.value)}
                className="mt-0.5 w-full rounded-md border border-ink/10 bg-base px-2 py-1 text-xs outline-none focus:border-primary"
              />
            </label>
            <label className="mt-1.5 block text-[10px] font-medium text-muted">
              Caption
              <input
                value={imgFields.caption}
                onChange={(e) => setImgCaption(e.target.value)}
                className="mt-0.5 w-full rounded-md border border-ink/10 bg-base px-2 py-1 text-xs outline-none focus:border-primary"
              />
            </label>
            <label className="mt-1.5 block text-[10px] font-medium text-muted">
              Title
              <input
                value={imgFields.title}
                onChange={(e) => setImgTitle(e.target.value)}
                className="mt-0.5 w-full rounded-md border border-ink/10 bg-base px-2 py-1 text-xs outline-none focus:border-primary"
              />
            </label>

            <div className="mt-2 flex items-center gap-1.5">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setImgDialog("replace")}
                className="flex-1 rounded-md border border-ink/10 px-2 py-1 text-xs font-medium text-muted hover:border-primary hover:text-primary"
              >
                Replace
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={removeImg}
                className="rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Link dialog */}
      {linkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-base font-bold">{isEdit ? "Edit link" : "Add link"}</h3>
              <button onClick={closeDialog} className="grid h-7 w-7 place-items-center rounded text-muted hover:bg-ink/[0.05]">✕</button>
            </div>

            {/* internal page search */}
            {internalPages.length > 0 && (
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-muted">Link to an internal page</label>
                <input
                  value={pageQuery}
                  onChange={(e) => setPageQuery(e.target.value)}
                  placeholder="Search home, service pages, blog posts, contact…"
                  className="input"
                />
                {pageQuery && (
                  <div className="mt-1 max-h-40 overflow-auto rounded-lg border border-ink/10">
                    {filteredPages.length === 0 && (
                      <p className="px-3 py-2 text-xs text-muted">No matches</p>
                    )}
                    {filteredPages.map((p) => (
                      <button
                        key={p.url}
                        onClick={() => {
                          setDraft((d) => ({ ...d, url: p.url, title: d.title || p.label.replace(/^.*· /, "") }));
                          setUrlError("");
                          setPageQuery("");
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-ink/[0.04]"
                      >
                        <span className="truncate">{p.label}</span>
                        <span className="ml-2 shrink-0 text-muted">{p.url}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <label className="mb-1 block text-xs font-medium text-muted">URL</label>
            <input
              value={draft.url}
              onChange={(e) => { setDraft((d) => ({ ...d, url: e.target.value })); setUrlError(""); }}
              placeholder="/seo or https://…"
              className={`input ${urlError ? "!border-red-400" : ""}`}
              autoFocus
            />
            {urlError && <p className="mt-1 text-[11px] text-red-500">{urlError}</p>}

            <label className="mb-1 mt-3 block text-xs font-medium text-muted">Link title (optional)</label>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Tooltip / accessible title"
              className="input"
            />

            <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted">Link attributes</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft.newTab} onChange={(e) => setDraft((d) => ({ ...d, newTab: e.target.checked }))} />
                Open in new tab
              </label>
              <label className="flex items-center gap-2 text-sm" title="Nofollow tells search engines not to pass ranking to this link">
                <input type="checkbox" checked={draft.nofollow} onChange={(e) => setDraft((d) => ({ ...d, nofollow: e.target.checked }))} />
                Nofollow
              </label>
              <label className="flex items-center gap-2 text-sm" title="Mark paid / advertising / affiliate links (rel=sponsored)">
                <input type="checkbox" checked={draft.sponsored} onChange={(e) => setDraft((d) => ({ ...d, sponsored: e.target.checked }))} />
                Sponsored
              </label>
              <label className="flex items-center gap-2 text-sm" title="User-generated content such as comments (rel=ugc)">
                <input type="checkbox" checked={draft.ugc} onChange={(e) => setDraft((d) => ({ ...d, ugc: e.target.checked }))} />
                UGC
              </label>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              {draft.nofollow || draft.sponsored || draft.ugc
                ? `Search engines see: rel="${[draft.nofollow && "nofollow", draft.sponsored && "sponsored", draft.ugc && "ugc"].filter(Boolean).join(" ")}"`
                : "No rel set → a normal dofollow link (passes SEO value)."}
            </p>

            <div className="mt-5 flex items-center justify-between gap-2">
              <div>
                {isEdit && (
                  <button onClick={removeLink} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                    Remove link
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={closeDialog} className="rounded-lg border border-ink/10 px-4 py-2 text-sm font-medium text-muted hover:text-ink">
                  Cancel
                </button>
                <button
                  onClick={applyLink}
                  disabled={!draft.url.trim()}
                  className="btn btn-primary !px-5 !py-2 !text-sm disabled:opacity-60"
                >
                  {isEdit ? "Save link" : "Add link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ColorEditor
        open={colorOpen}
        initialColor={recent[0] || "#2563EB"}
        recent={recent}
        saved={saved}
        onApply={applyColor}
        onSaveCustom={saveCustom}
        onClose={() => setColorOpen(false)}
      />

      <ImageInsertDialog
        open={imgDialog !== null}
        title={imgDialog === "replace" ? "Replace image" : "Insert image"}
        onClose={() => setImgDialog(null)}
        onPick={(url, alt) => (imgDialog === "replace" ? replaceImage(url, alt) : insertImage(url, alt))}
      />
    </div>
  );
}
