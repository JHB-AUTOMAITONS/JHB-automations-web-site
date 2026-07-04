"use client";

import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { STATS_DEFAULT, type StatItem as StatItemType } from "@jhb/shared/content";

export default function Stats({
  items = STATS_DEFAULT.items,
  eyebrow = "Why Choose Us",
  headingLead = "Numbers That",
  headingHighlight = "Speak",
}: {
  items?: StatItemType[];
  eyebrow?: string;
  headingLead?: string;
  headingHighlight?: string;
}) {
  return (
    <section id="stats" className="relative py-12 sm:py-16">
      <div className="container-x">
        <div className="glass-strong glow-border relative overflow-hidden rounded-3xl px-6 py-10 sm:px-12">
          <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />

          <div className="relative mb-10 text-center">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
              {headingLead}{headingLead && headingHighlight ? " " : ""}
              {headingHighlight && <span className="grad-text">{headingHighlight}</span>}
            </h2>
          </div>

          <div className="relative grid grid-cols-2 gap-8 lg:grid-cols-4">
            {items.map((s, i) => (
              <StatItem key={s.label} {...s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatItem({
  value,
  suffix,
  label,
  index,
}: {
  value: number;
  suffix: string;
  label: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);
  const circleRef = useRef<SVGCircleElement>(null);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const pct = suffix === "%" ? value / 100 : Math.min(value / 600 + 0.35, 1);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: "easeOut",
      delay: index * 0.1,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    if (circleRef.current) {
      circleRef.current.style.strokeDashoffset = `${
        circumference * (1 - pct)
      }`;
    }
    return () => controls.stop();
  }, [inView, value, index, circumference, pct]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex flex-col items-center text-center"
    >
      <div className="relative h-28 w-28 sm:h-32 sm:w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.12)"
            strokeWidth="8"
          />
          <circle
            ref={circleRef}
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="url(#statGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{ transition: "stroke-dashoffset 1.8s ease-out" }}
          />
          <defs>
            <linearGradient id="statGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="font-display text-3xl font-bold">
            {display}
            <span className="grad-text">{suffix}</span>
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-muted">{label}</p>
    </motion.div>
  );
}
