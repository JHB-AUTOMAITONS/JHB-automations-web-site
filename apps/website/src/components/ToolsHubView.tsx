"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ToolsHub } from "@jhb/shared/tools-hub";
import Icon from "./Icon";
import FaqAccordion from "./FaqAccordion";

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

export default function ToolsHubView({ hub, heroImageAlt }: { hub: ToolsHub; heroImageAlt?: string }) {
  const others = hub.categories.filter((c) => c.id !== "crm");

  return (
    <main className="relative pt-28">
      {/* ambient glows */}
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

      {/* ---- Hero ---- */}
      <section className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <motion.span {...fade} className="eyebrow">
            {hub.hero.badge}
          </motion.span>
          <motion.h1
            {...fade}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl"
          >
            {hub.hero.heading} <span className="grad-text">{hub.hero.highlight}</span>
          </motion.h1>
          <motion.div
            {...fade}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="prose-jhb mt-6 text-lg leading-relaxed text-muted [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: hub.hero.description }}
          />
          {hub.hero.ctaLabel && (
            <motion.div {...fade} transition={{ duration: 0.5, delay: 0.15 }} className="mt-8">
              <a href={hub.hero.ctaHref} className="btn btn-primary !px-7 !py-3.5">
                {hub.hero.ctaLabel}
                <span aria-hidden>→</span>
              </a>
            </motion.div>
          )}
        </div>
        {hub.hero.image && (
          <motion.div {...fade} className="relative mx-auto mt-12 aspect-[16/9] max-w-4xl overflow-hidden rounded-3xl border border-ink/10 shadow-soft-lg">
            <Image src={hub.hero.image} alt={heroImageAlt || hub.hero.heading} fill sizes="(max-width: 1024px) 100vw, 896px" className="object-cover" />
          </motion.div>
        )}
      </section>

      {/* ---- Tool Categories ---- */}
      <section id="tools" className="container-x mt-24">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Tool Categories</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Our <span className="grad-text">automation suite</span>
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hub.categories.map((c, i) => (
            <motion.a
              key={c.id}
              href={c.id === "crm" ? "#crm" : "#other-tools"}
              {...fade}
              transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
              className="group glow-border flex flex-col rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary ring-1 ring-ink/10 transition-all group-hover:from-primary group-hover:to-secondary group-hover:text-white">
                <Icon name={c.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{c.desc}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* ---- CRM Software Section ---- */}
      <section id="crm" className="container-x mt-24 scroll-mt-28">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Flagship Tool</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="grad-text">{hub.crm.heading}</span>
          </h2>
          <div
            className="prose-jhb mt-4 text-muted [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: hub.crm.overviewHtml }}
          />
        </motion.div>

        {/* features */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {hub.crm.features.map((f, i) => (
            <motion.div
              key={f.title}
              {...fade}
              transition={{ duration: 0.45, delay: (i % 2) * 0.06 }}
              className="flex gap-4 rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft"
            >
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* workflow process */}
        {hub.crm.workflow.length > 0 && (
          <div className="mt-14">
            <h3 className="text-center font-display text-xl font-bold">CRM Workflow Process</h3>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {hub.crm.workflow.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <motion.span
                    {...fade}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
                  >
                    {step}
                  </motion.span>
                  {i < hub.crm.workflow.length - 1 && <span className="text-primary/50">→</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CRM benefits */}
        {hub.crm.benefits.length > 0 && (
          <div className="mx-auto mt-14 max-w-3xl rounded-3xl border border-ink/10 bg-surface p-8 shadow-soft">
            <h3 className="font-display text-xl font-bold">Key CRM Benefits</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {hub.crm.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-ink/90">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-[10px] text-white">✓</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---- Other Automation Tools ---- */}
      <section id="other-tools" className="container-x mt-24 scroll-mt-28">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">More Tools</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Other <span className="grad-text">automation tools</span>
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((c, i) => (
            <motion.div
              key={c.id}
              {...fade}
              transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
              className="flex gap-4 rounded-2xl border border-ink/10 bg-surface p-5 shadow-soft"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary ring-1 ring-ink/10">
                <Icon name={c.icon} className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---- Benefits ---- */}
      <section className="container-x mt-24">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Why Automate</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Benefits of <span className="grad-text">business automation</span>
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {hub.benefits.map((b, i) => (
            <motion.div
              key={b.title}
              {...fade}
              transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
              className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft"
            >
              <h3 className="font-display text-lg font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <div className="mt-24">
        <FaqAccordion items={hub.faqs} />
      </div>

      {/* ---- CTA ---- */}
      <section className="container-x my-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-secondary/10 px-6 py-14 text-center shadow-soft sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-[100px]" />
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{hub.cta.heading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">{hub.cta.text}</p>
          {hub.cta.buttonLabel && (
            <a href={hub.cta.buttonHref} className="btn btn-primary mt-8 !px-7 !py-3.5">
              {hub.cta.buttonLabel}
              <span aria-hidden>→</span>
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
