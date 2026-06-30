"use client";

import { useState } from "react";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
      className="rounded-md border border-ink/10 px-2 py-0.5 text-[11px] font-medium text-muted transition-colors hover:border-primary hover:text-primary"
    >
      {done ? "Copied ✓" : label}
    </button>
  );
}
