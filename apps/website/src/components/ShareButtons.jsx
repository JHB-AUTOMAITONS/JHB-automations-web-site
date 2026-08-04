"use client";

import { useState } from "react";

export default function ShareButtons({
  url,
  title,
}) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const links = [
    { label: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { label: "in", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "f", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "WA", href: `https://wa.me/?text=${t}%20${u}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted">Share:</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${l.label}`}
          className="grid h-9 w-9 place-items-center rounded-lg border border-ink/10 bg-ink/[0.04] text-xs font-semibold uppercase text-muted transition-all hover:border-primary hover:text-primary"
        >
          {l.label}
        </a>
      ))}
      <button
        onClick={copy}
        className="rounded-lg border border-ink/10 bg-ink/[0.04] px-3 py-2 text-xs font-medium text-muted transition-all hover:border-primary hover:text-primary"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
