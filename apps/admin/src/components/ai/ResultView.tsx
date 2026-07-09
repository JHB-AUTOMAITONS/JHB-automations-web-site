"use client";

import CopyButton from "./CopyButton";
import { sanitizeRichText } from "@jhb/shared/rich-text";

// Generic, recursive renderer for AI tool results. Handles strings (with copy),
// HTML/JSON blobs (copyable code box), string lists, FAQ lists, nested objects
// and arrays — so every tool gets a sensible display without bespoke UI.

const LABELS: Record<string, string> = {
  seoTitle: "SEO Title",
  metaDescription: "Meta Description",
  metaKeywords: "Meta Keywords",
  focusKeyword: "Focus Keyword",
  secondaryKeywords: "Secondary Keywords",
  ogTitle: "Open Graph Title",
  ogDescription: "Open Graph Description",
  twitterTitle: "Twitter Title",
  twitterDescription: "Twitter Description",
  schemaJsonLd: "Schema (JSON-LD)",
  contentHtml: "Content (HTML)",
  internalLinks: "Internal Link Suggestions",
  imageAlt: "Image Alt Text",
  imageTitle: "Image Title",
  imageCaption: "Image Caption",
  imageDescription: "Image Description",
  altText: "Alt Text",
  fileName: "Suggested File Name",
};

const titleCase = (k: string) =>
  LABELS[k] || k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).replace(/_/g, " ").trim();

const looksLikeCode = (s: string) => /[<{]/.test(s) && s.length > 80;

function Scalar({ value }: { value: string }) {
  if (looksLikeCode(value)) {
    return (
      <div>
        <div className="mb-1 flex justify-end">
          <CopyButton text={value} />
        </div>
        <pre className="max-h-64 overflow-auto rounded-lg border border-ink/10 bg-base p-3 text-[11px] leading-relaxed whitespace-pre-wrap break-words">
          {value}
        </pre>
      </div>
    );
  }
  return (
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm text-ink/90">{value}</p>
      {value.length > 12 && <CopyButton text={value} />}
    </div>
  );
}

function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <ul className="space-y-2">
      {items.map((f, i) => (
        <li key={i} className="rounded-lg border border-ink/10 bg-base p-3">
          <p className="text-sm font-semibold">{f.question}</p>
          <div className="prose-jhb mt-1 text-sm text-muted" dangerouslySetInnerHTML={{ __html: sanitizeRichText(f.answer) }} />
        </li>
      ))}
    </ul>
  );
}

function isFaqArray(v: unknown[]): v is { question: string; answer: string }[] {
  return v.length > 0 && typeof v[0] === "object" && v[0] !== null && "question" in (v[0] as object);
}

function Value({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return <span className="text-xs text-muted">—</span>;
  if (typeof value === "string") return <Scalar value={value} />;
  if (typeof value === "number" || typeof value === "boolean") return <p className="text-sm text-ink/90">{String(value)}</p>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-xs text-muted">—</span>;
    if (value.every((x) => typeof x === "string")) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {(value as string[]).map((x, i) => (
            <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{x}</span>
          ))}
        </div>
      );
    }
    if (isFaqArray(value)) return <FaqList items={value} />;
    return (
      <ul className="space-y-1.5">
        {value.map((x, i) => (
          <li key={i} className="rounded-lg border border-ink/10 bg-base p-2 text-xs">
            <Value value={x} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div className="space-y-1">
        {entries.map(([k, v]) => (
          <p key={k} className="text-xs">
            <span className="font-medium text-muted">{titleCase(k)}: </span>
            <span className="text-ink/90">{typeof v === "string" ? v : JSON.stringify(v)}</span>
          </p>
        ))}
      </div>
    );
  }
  return <p className="text-sm">{String(value)}</p>;
}

export default function ResultView({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([k]) => k !== "ok");
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CopyButton text={JSON.stringify(data, null, 2)} label="Copy all (JSON)" />
      </div>
      {entries.map(([key, value]) => (
        <section key={key} className="rounded-xl border border-ink/10 bg-surface p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{titleCase(key)}</h3>
          <Value value={value} />
        </section>
      ))}
    </div>
  );
}
