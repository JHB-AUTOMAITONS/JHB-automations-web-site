"use client";

import { useEffect, useRef, useState } from "react";
import FontSizeControl, { wrapSelectionFontSize } from "./FontSizeControl";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

const buttons: { cmd: string; label: string; arg?: string }[] = [
  { cmd: "bold", label: "B" },
  { cmd: "italic", label: "I" },
  { cmd: "underline", label: "U" },
  { cmd: "insertUnorderedList", label: "• List" },
  { cmd: "insertOrderedList", label: "1. List" },
];

export default function RichText({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const styleRange = useRef<Range | null>(null);
  const [fontSizePx, setFontSizePx] = useState(14);

  // Set initial HTML once (uncontrolled thereafter to keep the caret stable)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

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

  const applyFontSize = (px: string) => {
    if (!ref.current) return;
    ref.current.focus();
    restoreSel();
    wrapSelectionFontSize(ref.current, px);
    const n = parseInt(px, 10);
    if (!Number.isNaN(n)) setFontSizePx(n);
    sync();
  };

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

  useEffect(() => {
    const handler = () => readCaretSize();
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const addLink = () => {
    const url = prompt("Link URL (https://…)");
    if (url) exec("createLink", url);
  };

  return (
    <div className="rounded-xl border border-ink/10 bg-base">
      <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 p-1.5">
        {buttons.map((b) => (
          <button
            key={b.cmd}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(b.cmd, b.arg)}
            className="rounded-md px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
          >
            {b.label}
          </button>
        ))}
        <span className="mx-0.5 h-4 w-px bg-ink/10" />
        <FontSizeControl value={fontSizePx} onApply={applyFontSize} onBeforeChange={saveSel} />
        <span className="mx-0.5 h-4 w-px bg-ink/10" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={addLink}
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
        >
          🔗 Link
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec("removeFormat")}
          className="rounded-md px-2.5 py-1 text-xs font-semibold text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
        >
          Clear
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="prose-jhb min-h-[120px] px-4 py-3 text-sm leading-relaxed outline-none [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
      />
    </div>
  );
}
