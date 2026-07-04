"use client";

import { useState } from "react";

/**
 * SINGLE source of truth for the FAQ accordion shown in every admin editor
 * preview, so each preview renders the question, the expand/collapse icon, and
 * the rich-text (HTML) answer exactly like the live website.
 *
 * Single-open accordion (first answered item expanded). It animates open/closed
 * with a CSS grid-rows transition rather than framer-motion, so the shared
 * package stays dependency-free and works in both the website and the admin app.
 * The markup + classes mirror the website's Faq / FaqAccordion components so the
 * preview and the live page look identical.
 */
export type FaqAccordionItem = { question: string; answer: string };

// Rich-text styling for FAQ answers (bold, italic, lists, links, headings,
// blockquotes, etc.). Inline styles from the editor (colours, alignment) ride
// along via dangerouslySetInnerHTML. Kept in sync with the website's
// FaqAccordion FAQ_ANSWER_CLASS.
const FAQ_ANSWER_CLASS =
  "px-5 pb-5 break-words text-sm leading-relaxed text-muted [&_a]:break-words [&_a]:text-primary [&_p]:m-0 [&_p+p]:mt-2 [&_em]:italic [&_strong]:font-semibold [&_s]:line-through [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_h1]:font-display [&_h1]:text-lg [&_h1]:font-bold [&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_hr]:my-3 [&_hr]:border-ink/15";

export default function FaqAccordionView({
  items,
  showNumbers = true,
  className = "",
}: {
  items: FaqAccordionItem[];
  showNumbers?: boolean;
  className?: string;
}) {
  // Drop question-less rows (an in-progress, empty FAQ) — the live site skips
  // them too, so the preview matches what visitors actually see.
  const faqs = items.filter((f) => f.question.trim());
  const [open, setOpen] = useState(0); // index of the expanded item (-1 = none)

  if (faqs.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className={`glass overflow-hidden rounded-2xl transition-shadow duration-300 ${
              isOpen ? "shadow-glow" : "hover:shadow-soft"
            }`}
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-ink/[0.02]"
              >
                <span className="min-w-0 break-words font-display text-base font-semibold !text-[#1877F2] sm:text-lg">
                  {showNumbers && (
                    <span className="mr-2 tabular-nums">{String(i + 1).padStart(2, "0")}.</span>
                  )}
                  {f.question}
                </span>
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm transition-all duration-300 ${
                    isOpen
                      ? "rotate-45 bg-gradient-to-br from-primary to-secondary text-white"
                      : "bg-ink/[0.05] text-muted"
                  }`}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
            </h3>
            {/* CSS grid-rows expand/collapse — no framer-motion dependency. */}
            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div
                  className={FAQ_ANSWER_CLASS}
                  dangerouslySetInnerHTML={{ __html: f.answer || "" }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
