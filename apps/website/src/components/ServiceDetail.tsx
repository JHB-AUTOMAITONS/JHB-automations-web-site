"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ServiceDetail as ServiceDetailType } from "@jhb/shared/data";
import type { FaqItem } from "@jhb/shared/faqs";
import Icon from "./Icon";
import Reveal from "./Reveal";
import FaqAccordion from "./FaqAccordion";

type RelatedLink = { title: string; slug: string; icon: string };

export default function ServiceDetail({
  data,
  related = [],
  faqs = [],
}: {
  data: ServiceDetailType;
  related?: RelatedLink[];
  faqs?: FaqItem[];
}) {
  return (
    <main className="relative pt-32">
      {/* ambient glows */}
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      {/* Hero */}
      <section className="container-x">
        {/* breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
          <Link href="/#home" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <Link href="/services" className="transition-colors hover:text-ink">
            Services
          </Link>
          <span>/</span>
          <span className="text-primary">{data.title}</span>
        </nav>

        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="eyebrow"
            >
              {data.tagline}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl"
            >
              <span className="grad-text">{data.title}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
            >
              {data.intro}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link href="/#contact" className="btn btn-primary">
                Book Free Consultation →
              </Link>
              <Link href="/services" className="btn btn-ghost">
                All Services
              </Link>
            </motion.div>
          </div>

          {/* icon visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center"
          >
            <div className="absolute inset-8 animate-spin-slow rounded-full border border-dashed border-ink/10" />
            <div className="absolute inset-16 rounded-full border border-ink/[0.06]" />
            <div className="glass-strong glow-border relative grid h-40 w-40 place-items-center rounded-[2rem] shadow-glow">
              <span className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/10 to-secondary/10" />
              <Icon name={data.icon} className="relative h-20 w-20 text-accent" />
            </div>
            {data.stats.map((s, i) => (
              <div
                key={s.label}
                className={`glass absolute rounded-2xl p-3 text-center shadow-glow ${
                  ["left-0 top-6", "right-0 top-1/3", "bottom-6 left-8"][i]
                } ${i === 1 ? "animate-float" : "animate-float-slow"}`}
              >
                <p className="font-display text-lg font-bold grad-text">
                  {s.value}
                </p>
                <p className="text-[10px] text-muted">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container-x py-24">
        <Reveal>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            What&apos;s <span className="grad-text">Included</span>
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Everything you get when you partner with us on {data.title}.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {data.features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
              className="glass glow-border group rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 font-display text-sm font-bold text-primary ring-1 ring-ink/10">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {f.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="container-x pb-24">
        <div className="glass-strong glow-border relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-2">
            <div>
              <span className="eyebrow">Why Choose Us</span>
              <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
                The JHB <span className="grad-text">Advantage</span>
              </h2>
              <p className="mt-4 text-muted">
                We don&apos;t just deliver {data.title.toLowerCase()} — we
                deliver measurable business growth, with full transparency at
                every step.
              </p>
            </div>
            <ul className="space-y-4">
              {data.benefits.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                    ✓
                  </span>
                  <span className="text-ink/90">{b}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Related services */}
      <section className="container-x pb-24">
        <Reveal>
          <h2 className="mb-8 font-display text-2xl font-bold sm:text-3xl">
            Explore Related <span className="grad-text">Services</span>
          </h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((s) => (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="group glass glow-border flex items-center gap-3 rounded-2xl p-4 transition-transform hover:-translate-y-1"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary ring-1 ring-ink/10 transition-all group-hover:from-primary group-hover:to-secondary group-hover:text-white">
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-muted transition-colors group-hover:text-ink">
                {s.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ — near the bottom, just above the CTA */}
      {faqs.length > 0 && (
        <div className="pb-12">
          <FaqAccordion items={faqs} />
        </div>
      )}

      {/* CTA */}
      <section className="container-x pb-28">
        <div className="glow-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-surface to-secondary/15 p-10 text-center sm:p-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Ready to get started with{" "}
            <span className="grad-text">{data.title}</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Book a free consultation and we&apos;ll show you exactly how this can
            drive growth for your business.
          </p>
          <Link href="/#contact" className="btn btn-primary mt-8">
            Book Free Consultation →
          </Link>
        </div>
      </section>
    </main>
  );
}
