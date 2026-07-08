"use client";

import { motion } from "framer-motion";
import { industries } from "@jhb/shared/data";
import SectionHeading from "./SectionHeading";

export default function Industries() {
  return (
    <section id="industries" className="relative py-8 sm:py-10 lg:py-12">
      <div className="container-x">
        <SectionHeading
          eyebrow="Industries We Serve"
          title={
            <>
              Built for <span className="grad-text">Every Sector</span>
            </>
          }
          desc="Tailored automation and growth systems for the industries that move the world."
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
              data-tilt
              className="group glass glow-border relative overflow-hidden rounded-2xl p-6 text-center transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 transition-all duration-500 group-hover:from-primary/10 group-hover:to-secondary/10" />
              <span className="relative inline-grid h-16 w-16 place-items-center rounded-2xl bg-ink/[0.04] text-3xl ring-1 ring-ink/10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow">
                {ind.icon}
              </span>
              <h3 className="relative mt-4 font-display text-base font-semibold">
                {ind.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
