"use client";

import { motion } from "framer-motion";
import { processSteps } from "@/lib/data";
import SectionHeading from "./SectionHeading";

export default function Process() {
  return (
    <section id="process" className="relative py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Our Process"
          title={
            <>
              How We <span className="grad-text">Deliver</span>
            </>
          }
          desc="A proven, six-stage system that turns ideas into automated, scalable growth."
        />

        <div className="relative">
          {/* center line for desktop */}
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary/0 via-primary/40 to-secondary/0 lg:block" />

          <div className="space-y-6 lg:space-y-0">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className={`relative lg:flex lg:items-center lg:gap-8 ${
                  i % 2 === 0 ? "" : "lg:flex-row-reverse"
                } ${i > 0 ? "lg:-mt-10" : ""}`}
              >
                <div className="lg:w-1/2">
                  <div
                    className={`glass glow-border rounded-2xl p-6 ${
                      i % 2 === 0 ? "lg:text-right" : "lg:text-left"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-3 ${
                        i % 2 === 0 ? "lg:flex-row-reverse" : ""
                      }`}
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-xl ring-1 ring-ink/10">
                        {step.icon}
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                          Phase {i + 1}
                        </p>
                        <h3 className="font-display text-lg font-semibold">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted">{step.desc}</p>
                  </div>
                </div>

                {/* node */}
                <div className="absolute left-1/2 top-1/2 hidden h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-base bg-gradient-to-br from-primary to-secondary shadow-glow lg:block" />

                <div className="hidden lg:block lg:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
