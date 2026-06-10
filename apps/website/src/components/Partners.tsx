"use client";

import { motion } from "framer-motion";

const tools = [
  { name: "n8n", color: "#EA4B71" },
  { name: "Meta", color: "#0866FF" },
  { name: "Shopify", color: "#5E8E3E" },
  { name: "Google", color: "#4285F4" },
  { name: "WordPress", color: "#21759B" },
  { name: "ChatGPT", color: "#10A37F" },
];

export default function Partners() {
  return (
    <section className="relative py-16">
      <div className="container-x">
        <p className="mb-10 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          Powered by industry-leading platforms &amp; tools
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-16">
          {tools.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="group flex items-center gap-2"
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-xl font-display text-lg font-bold text-white shadow-soft transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110"
                style={{ backgroundColor: t.color }}
              >
                {t.name[0]}
              </span>
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
