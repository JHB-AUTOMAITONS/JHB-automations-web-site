"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { InternalPage } from "@jhb/shared/service-pages";
import ColorEditor from "./ColorEditor";
import FontSizeControl, { wrapSelectionFontSize } from "./FontSizeControl";

type Props = {
  value: string;
  onChange: (html: string) => void;
  internalPages?: InternalPage[];
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

const TOOLS: { cmd: string; arg?: string; label: string; title: string }[] = [
  { cmd: "bold", label: "B", title: "Bold" },
  { cmd: "italic", label: "I", title: "Italic" },
  { cmd: "underline", label: "U", title: "Underline" },
  { cmd: "strikeThrough", label: "S", title: "Strikethrough" },
  { cmd: "formatBlock", arg: "BLOCKQUOTE", label: "❝", title: "Quote" },
  { cmd: "insertUnorderedList", label: "• List", title: "Bullet list" },
  { cmd: "insertOrderedList", label: "1. List", title: "Numbered list" },
  { cmd: "justifyLeft", label: "⫷", title: "Align left" },
  { cmd: "justifyCenter", label: "≡", title: "Align center" },
  { cmd: "justifyRight", label: "⫸", title: "Align right" },
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

export default function RichEditor({ value, onChange, internalPages = [] }: Props) {
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
  const [recent, setRecent] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [fontSizePx, setFontSizePx] = useState(14);
  // The block style at the caret, so the Style dropdown shows the active style.
  const [blockTag, setBlockTag] = useState("P");

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

  // Reflect the size at the caret in the toolbar control, like Word.
  const readCaretSize = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !ref.current) return;
    const node = sel.anchorNode;
    if (!node || !ref.current.contains(node)) return;
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
    if (!el) return;
    const px = parseFloat(getComputedStyle(el).fontSize);
    if (!Number.isNaN(px)) setFontSizePx(Math.round(px));
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
      readCaretSize();
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

  // Apply any CSS colour (HEX / rgb() / hsl() / name) to the selection inline.
  const applyColor = (raw: string) => {
    const c = raw.trim();
    if (!isValidColor(c)) return;
    ref.current?.focus();
    restoreSel();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("foreColor", false, c);
    pushRecent(c);
    setColorOpen(false);
    sync();
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

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
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

  return (
    <div className="rounded-xl border border-ink/10 bg-base">
      <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 p-1.5">
        {TOOLS.map((t) => (
          <button
            key={t.label}
            type="button"
            title={t.title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(t.cmd, t.arg)}
            className={`rounded-md px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink ${
              t.cmd === "strikeThrough" ? "line-through" : ""
            }`}
          >
            {t.label}
          </button>
        ))}

        {/* Headings / paragraph block format (H1–H6) */}
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

        {/* Horizontal divider */}
        <button
          type="button"
          title="Horizontal divider"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("insertHorizontalRule")}
          className="rounded-md px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
        >
          ―
        </button>

        {/* Font size — Word-style numeric box + presets + steppers */}
        <span className="mx-1 h-4 w-px bg-ink/10" />
        <FontSizeControl value={fontSizePx} onApply={applyFontSize} onBeforeChange={saveSel} />
        <span className="mx-1 h-4 w-px bg-ink/10" />

        {/* Text colour — opens the advanced colour editor */}
        <button
          type="button"
          title="Text colour — open the advanced colour editor"
          onMouseDown={(e) => {
            e.preventDefault();
            saveSel();
          }}
          onClick={() => setColorOpen(true)}
          className="rounded-md px-2 py-1 text-xs font-semibold text-muted hover:bg-ink/[0.06] hover:text-ink"
        >
          🎨 Colour
        </button>

        <span className="mx-1 h-4 w-px bg-ink/10" />
        <button
          type="button"
          title="Insert table"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertTable}
          className="rounded-md px-2 py-1 text-xs font-semibold text-muted hover:bg-ink/[0.06] hover:text-ink"
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
        <button
          type="button"
          title="Undo"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("undo")}
          className="rounded-md px-2 py-1 text-xs font-semibold text-muted hover:bg-ink/[0.06] hover:text-ink"
        >
          ↶
        </button>
        <button
          type="button"
          title="Redo"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("redo")}
          className="rounded-md px-2 py-1 text-xs font-semibold text-muted hover:bg-ink/[0.06] hover:text-ink"
        >
          ↷
        </button>
        <button
          type="button"
          title="Clear formatting"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("removeFormat")}
          className="ml-auto rounded-md px-2 py-1 text-xs font-semibold text-muted hover:bg-ink/[0.06] hover:text-ink"
        >
          Clear
        </button>
      </div>

      {hint && <p className="border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-700">{hint}</p>}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        className="prose-jhb min-h-[260px] px-4 py-3 text-sm leading-relaxed outline-none [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:text-muted [&_h1]:mt-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:font-semibold [&_h5]:font-semibold [&_h6]:font-semibold [&_hr]:my-3 [&_hr]:border-ink/15 [&_pre]:my-2 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-ink/[0.05] [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[13px] [&_s]:line-through [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
      />

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
    </div>
  );
}
