"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FaqItem } from "@jhb/shared/faqs";

export default function FaqAccordion({
  items,
  heading = "Frequently Asked Questions",
}: {
  items: FaqItem[];
  heading?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  const [query, setQuery] = useState("");

  const showSearch = items.length > 6;
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [items, query]);

  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section id="faq" className="container-x pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently Asked <span className="grad-text">Questions</span>
          </h2>
        </div>

        {showSearch && (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            className="mt-6 w-full rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
            aria-label="Search FAQs"
          />
        )}

        <div className="mt-8 space-y-3">
          {filtered.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.question}
                className={`glass overflow-hidden rounded-2xl transition-shadow duration-300 ${
                  isOpen ? "shadow-glow" : "hover:shadow-soft"
                }`}
              >
                <h3>
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`svc-faq-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-ink/[0.02]"
                  >
                    <span className="font-display text-base font-semibold sm:text-lg">
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
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`svc-faq-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted">
                        {f.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-muted">
              No questions match “{query}”.
            </p>
          )}
        </div>

        {/* CTA below FAQs */}
        <div className="mt-8 rounded-2xl border border-ink/10 bg-surface px-6 py-5 text-center shadow-soft">
          <p className="font-medium">Still have questions?</p>
          <p className="mt-1 text-sm text-muted">
            Our team is happy to help you find the right solution.
          </p>
          <a href="/#contact" className="btn btn-primary mt-4 !px-6 !py-2.5 !text-sm">
            Contact our team today
          </a>
        </div>
      </div>
    </section>
  );
}
