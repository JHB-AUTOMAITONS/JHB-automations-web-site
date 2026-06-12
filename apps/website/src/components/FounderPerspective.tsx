"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";

const focusPoints = [
  "Consistent Lead Flow",
  "Automated Customer Journeys",
  "Clear Messaging & Market Positioning",
  "Data-Driven Digital Systems",
];

export default function FounderPerspective() {
  return (
    <section id="founder" className="relative py-24 sm:py-32">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: copy */}
          <div className="order-2 lg:order-1">
            <Reveal>
              <span className="eyebrow">Founder Perspective</span>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Growth Depends on{" "}
                <span className="grad-text">Predictable Systems</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Growth depends on predictable systems, diversified lead channels,
                and automated workflows. Businesses that rely on a single source
                or manual operations limit their scalability. At JHB Automations,
                we help companies create multi-channel lead generation systems,
                optimize digital touchpoints, and implement automation that
                reduces operational effort and increases revenue efficiency.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <h3 className="mt-8 font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                We Focus On
              </h3>
            </Reveal>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {focusPoints.map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="glass flex items-center gap-3 rounded-xl px-4 py-3"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                    ✓
                  </span>
                  <span className="text-sm font-medium">{point}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right: founder image */}
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <FounderImage />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FounderImage() {
  const [ok, setOk] = useState(true);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/15 to-secondary/15 blur-2xl" />
      <div className="glass-strong relative overflow-hidden rounded-3xl shadow-glow">
        {ok ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/founder.jpg"
            alt="Founder, JHB Automations"
            onError={() => setOk(false)}
            className="aspect-[4/5] w-full object-cover"
          />
        ) : (
          // Professional placeholder shown until /public/founder.jpg is added
          <div className="grid aspect-[4/5] w-full place-items-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="text-center">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-display text-3xl font-bold text-white shadow-glow">
                JHB
              </div>
              <p className="mt-4 font-display text-sm font-semibold">
                Founder &amp; CEO
              </p>
              <p className="text-xs text-muted">JHB Automations</p>
            </div>
          </div>
        )}
      </div>

      {/* floating accent badge */}
      <div className="glass absolute -bottom-4 left-6 flex items-center gap-2 rounded-2xl px-4 py-2.5 shadow-soft">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs text-white">
          ★
        </span>
        <div className="leading-tight">
          <p className="text-xs font-semibold">Founder &amp; CEO</p>
          <p className="text-[11px] text-muted">JHB Automations</p>
        </div>
      </div>
    </div>
  );
}
