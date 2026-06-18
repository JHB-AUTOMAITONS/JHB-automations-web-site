"use client";

import { motion } from "framer-motion";
import { PARTNERS_DEFAULT, type Partner } from "@jhb/shared/partners";

export default function Partners({
  heading = PARTNERS_DEFAULT.heading,
  items = PARTNERS_DEFAULT.items,
}: {
  heading?: string;
  items?: Partner[];
}) {
  return (
    <section className="relative py-16">
      <div className="container-x">
        <p className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          {heading}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-16">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="group flex items-center gap-2"
            >
              {t.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={t.logo}
                  alt={t.name}
                  className="h-10 w-10 rounded-xl object-contain shadow-soft transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"
                />
              ) : (
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl font-display text-lg font-bold text-white shadow-soft transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"
                  style={{ backgroundColor: t.color }}
                >
                  {t.name[0]}
                </span>
              )}
              <span className="font-display text-xl font-semibold text-muted transition-colors duration-300 group-hover:text-ink">
                {t.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
