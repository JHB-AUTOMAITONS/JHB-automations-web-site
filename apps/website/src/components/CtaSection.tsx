"use client";

import { motion } from "framer-motion";
import type { CtaBlock } from "@jhb/shared/home";

export default function CtaSection({ cta }: { cta: CtaBlock }) {
  if (!cta.enabled) return null;

  return (
    <section className="relative py-16 sm:py-20">
      <div className="container-x">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="glow-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-surface to-secondary/15 p-10 text-center shadow-soft sm:p-16"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <h2 className="relative font-display text-3xl font-bold sm:text-4xl">
            {cta.title}
          </h2>
          <div
            className="relative mx-auto mt-4 max-w-xl text-muted"
            dangerouslySetInnerHTML={{ __html: cta.textHtml }}
          />
          {cta.buttonText && (
            <a href={cta.buttonHref} className="btn btn-primary relative mt-8">
              {cta.buttonText} <span aria-hidden>→</span>
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}
