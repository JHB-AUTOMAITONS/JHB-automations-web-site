"use client";

import { useEffect, useRef, useState } from "react";

// Word-style preset ladder.
export const FONT_SIZE_PRESETS = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 48, 60, 72,
];

const MIN = 1;
const MAX = 400;

const clamp = (n: number) => Math.max(MIN, Math.min(MAX, Math.round(n)));

// "Grow font" — jump to the next preset above, or +1 once past the ladder.
export function growSize(v: number): number {
  const next = FONT_SIZE_PRESETS.find((p) => p > v);
  return clamp(next ?? v + 1);
}
// "Shrink font" — jump to the next preset below, or -1 once under the ladder.
export function shrinkSize(v: number): number {
  const prev = [...FONT_SIZE_PRESETS].reverse().find((p) => p < v);
  return clamp(prev ?? v - 1);
}

// Apply a px font size to the CURRENT selection inside `editorEl`. execCommand
// has no px size, so we wrap with the legacy <font size="7"> then convert it to
// <span style="font-size:…">. Any nested font-size on descendants is stripped so
// the newly chosen size wins (Word-style "replace", not "nest"). Bold/italic/
// underline/colour/link live on separate elements/styles and are untouched.
export function wrapSelectionFontSize(editorEl: HTMLElement, px: string) {
  document.execCommand("styleWithCSS", false, "false");
  document.execCommand("fontSize", false, "7");
  editorEl.querySelectorAll('font[size="7"]').forEach((f) => {
    const span = document.createElement("span");
    span.style.fontSize = px;
    span.innerHTML = (f as HTMLElement).innerHTML;
    span.querySelectorAll<HTMLElement>('[style*="font-size"]').forEach((d) => {
      d.style.fontSize = "";
      if (!d.getAttribute("style")) d.removeAttribute("style");
    });
    f.replaceWith(span);
  });
}

type Props = {
  // Size (px, numeric) at the caret — keeps the box in sync like Word.
  value: number;
  // Apply a size such as "24px" to the saved selection.
  onApply: (px: string) => void;
  // Called before focus leaves the editor so the parent can save the selection.
  onBeforeChange: () => void;
};

export default function FontSizeControl({ value, onApply, onBeforeChange }: Props) {
  const [text, setText] = useState(String(value));
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Reflect the caret's size unless the user is mid-typing a custom value.
  useEffect(() => {
    setText(String(value));
  }, [value]);

  // Close the preset dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const apply = (n: number) => {
    const v = clamp(n);
    onApply(`${v}px`);
    setText(String(v));
    setOpen(false);
  };

  const commitText = () => {
    const n = parseInt(text, 10);
    if (Number.isNaN(n)) {
      setText(String(value));
      return;
    }
    onBeforeChange();
    apply(n);
  };

  const step = (dir: 1 | -1) => {
    onBeforeChange();
    const base = parseInt(text, 10);
    const cur = Number.isNaN(base) ? value : base;
    apply(dir > 0 ? growSize(cur) : shrinkSize(cur));
  };

  const pick = (n: number) => {
    onBeforeChange();
    apply(n);
  };

  const btn =
    "grid h-7 w-6 place-items-center rounded-md text-xs font-bold text-muted hover:bg-ink/[0.06] hover:text-ink";

  return (
    <div ref={wrapRef} className="relative flex items-center" title="Font size (type a value or pick one)">
      <button
        type="button"
        title="Decrease font size"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => step(-1)}
        className={btn}
      >
        −
      </button>

      <input
        value={text}
        inputMode="numeric"
        aria-label="Font size"
        onMouseDown={onBeforeChange}
        onChange={(e) => setText(e.target.value.replace(/[^\d]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitText();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            step(-1);
          }
        }}
        onBlur={commitText}
        className="h-7 w-9 border-x border-ink/10 bg-surface text-center text-xs font-semibold text-ink outline-none focus:bg-base"
      />

      <button
        type="button"
        title="Increase font size"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => step(1)}
        className={btn}
      >
        +
      </button>

      <button
        type="button"
        title="Choose a size"
        onMouseDown={(e) => {
          e.preventDefault();
          onBeforeChange();
        }}
        onClick={() => setOpen((o) => !o)}
        className="grid h-7 w-5 place-items-center rounded-md text-[10px] text-muted hover:bg-ink/[0.06] hover:text-ink"
      >
        ▼
      </button>

      {open && (
        <ul className="absolute left-0 top-9 z-50 max-h-56 w-16 overflow-auto rounded-lg border border-ink/10 bg-surface py-1 shadow-soft-lg">
          {FONT_SIZE_PRESETS.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onBeforeChange();
                }}
                onClick={() => pick(s)}
                className={`block w-full px-3 py-1 text-left text-xs hover:bg-ink/[0.06] ${
                  s === value ? "bg-primary/10 font-semibold text-primary" : "text-ink"
                }`}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
