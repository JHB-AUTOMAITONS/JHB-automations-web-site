"use client";

import { motion } from "framer-motion";
import { caseStudies } from "@jhb/shared/data";
import SectionHeading from "./SectionHeading";

export default function CaseStudies() {
  return (
    <section id="cases" className="relative py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Case Studies"
          title={
            <>
              Real Businesses, <span className="grad-text">Real Results</span>
            </>
          }
          desc="Challenge → Solution → measurable growth. Here's what automation delivers."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {caseStudies.map((cs, i) => (
            <motion.article
              key={cs.client}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="glass glow-border group flex flex-col rounded-3xl p-7"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {cs.industry}
                </span>
                <span className="font-display text-sm font-semibold text-muted">
                  {cs.client}
                </span>
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Challenge
                  </p>
                  <p className="mt-1 text-muted">{cs.challenge}</p>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/50" />
                  ↓
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/50" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                    Solution
                  </p>
                  <p className="mt-1 text-muted">{cs.solution}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-ink/10 pt-6">
                {cs.metrics.map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="font-display text-xl font-bold grad-text">
                      {m.value}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">{m.label}</p>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
