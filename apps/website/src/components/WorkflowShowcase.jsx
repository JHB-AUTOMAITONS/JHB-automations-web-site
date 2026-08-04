"use client";

import { motion } from "framer-motion";
import { workflowSteps } from "@jhb/shared/data";
import SectionHeading from "./SectionHeading";

export default function WorkflowShowcase() {
  return (
    <section id="workflow" className="relative section-y">
      <div className="container-x">
        <SectionHeading
          eyebrow="AI Automation in Action"
          title={
            <>
              From Lead to <span className="grad-text">Closed Deal</span> —
              Automatically
            </>
          }
          desc="A living automation pipeline that captures, qualifies and converts while you sleep."
        />

        <div className="relative">
          {/* desktop horizontal flow */}
          <div className="hidden items-stretch gap-3 lg:flex">
            {workflowSteps.map((step, i) => (
              <div key={step.title} className="flex flex-1 items-stretch">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="glass glow-border group relative flex-1 rounded-2xl p-5 text-center"
                >
                  <div className="relative mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl ring-1 ring-ink/10">
                    {step.icon}
                    <span className="absolute inset-0 rounded-2xl ring-1 ring-primary/40 [animation:pulse-ring_2.4s_ease-out_infinite]" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                    Step {i + 1}
                  </p>
                  <h3 className="mt-1 font-display text-base font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {step.desc}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] text-accent">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                    Active
                  </span>
                </motion.div>

                {i < workflowSteps.length - 1 && (
                  <div className="flex w-10 items-center justify-center">
                    <Connector delay={i * 0.12 + 0.3} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* mobile vertical flow */}
          <div className="flex flex-col gap-3 lg:hidden">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass relative flex items-center gap-4 rounded-2xl p-4"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-xl ring-1 ring-ink/10">
                  {step.icon}
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                    Step {i + 1}
                  </p>
                  <h3 className="font-display text-sm font-semibold">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted">{step.desc}</p>
                </div>
                {i < workflowSteps.length - 1 && (
                  <span className="absolute -bottom-3 left-9 z-10 text-primary">
                    ↓
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Connector({ delay }) {
  return (
    <svg viewBox="0 0 40 12" className="w-full" aria-hidden="true">
      <defs>
        <linearGradient id="conn" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
      <line
        x1="2"
        y1="6"
        x2="38"
        y2="6"
        stroke="rgba(148,163,184,0.2)"
        strokeWidth="2"
      />
      <motion.line
        x1="2"
        y1="6"
        x2="38"
        y2="6"
        stroke="url(#conn)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
      />
      <motion.circle
        r="2.5"
        fill="#FF2E7E"
        cy="6"
        animate={{ cx: [2, 38], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}
