"use client";

import { motion } from "framer-motion";
import type { AboutBlock } from "@jhb/shared/home";

export default function AboutSection({ about }: { about: AboutBlock }) {
  if (!about.enabled) return null;

  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            {about.eyebrow && <span className="eyebrow">{about.eyebrow}</span>}
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {about.title}
            </h2>
            <div
              className="prose-jhb mt-5 space-y-4 text-lg leading-relaxed text-muted"
              dangerouslySetInnerHTML={{ __html: about.descriptionHtml }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/15 to-secondary/15 blur-2xl" />
            {about.image ? (
              <div className="glass-strong overflow-hidden rounded-3xl shadow-glow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={about.image}
                  alt={about.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            ) : (
              <div className="glass-strong grid aspect-[4/3] place-items-center rounded-3xl shadow-glow">
                <span className="text-6xl">🚀</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
