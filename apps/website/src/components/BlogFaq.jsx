"use client";

import { useState } from "react";
import { sanitizeRichText } from "@jhb/shared/rich-text";

// Modern single-open accordion for a blog post's FAQ section. One item is open
// at a time; the first is expanded by default. Rich-text answers render as HTML.
export default function BlogFaq({ faqs, showNumbers = true }) {
  const items = faqs.filter((f) => f.visible && f.question.trim());
  const [open, setOpen] = useState(0); // index of the expanded item (-1 = none)

  if (items.length === 0) return null;

  return (
    <section className="mx-auto mt-12 max-w-[1200px] border-t border-ink/10 pt-10" aria-label="Frequently asked questions">
      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">FAQ</span>
      <h2 className="mt-5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
        Frequently Asked <span className="grad-text">Questions</span>
      </h2>

      <div className="mt-6 space-y-3">
        {items.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.id}
              className={`overflow-hidden rounded-2xl border bg-surface transition-colors ${
                isOpen ? "border-primary/40 shadow-soft" : "border-ink/10"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="min-w-0 break-words font-display text-base font-semibold !text-[#1877F2] sm:text-lg">
                  {showNumbers && <span className="mr-2 tabular-nums">{String(i + 1).padStart(2, "0")}.</span>}
                  {f.question}
                </span>
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink/10 text-sm text-primary transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div
                    className="prose-jhb px-5 pb-5 text-sm leading-relaxed text-ink/80 [&_a]:text-primary"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(f.answer || "") }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
