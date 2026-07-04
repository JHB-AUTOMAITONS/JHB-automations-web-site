"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ToolsHub } from "@jhb/shared/tools-hub";
import { PageContainersView } from "@jhb/shared/container-view";
import Icon from "./Icon";
import FaqAccordion from "./FaqAccordion";
import SmartLink from "./SmartLink";

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

export default function ToolsHubView({ hub, heroImageAlt, faqShowNumbers = true }: { hub: ToolsHub; heroImageAlt?: string; faqShowNumbers?: boolean }) {
  const others = hub.categories.filter((c) => c.id !== "crm");
  const containers = hub.containers ?? [];

  return (
    <main className="relative pt-24">
      {/* ambient glows */}
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

      <PageContainersView containers={containers} zone="top" />

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
            className="prose-jhb mt-6 text-lg leading-relaxed text-muted [&_a]:font-medium [&_a]:text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: hub.hero.description }}
          />
          {hub.hero.ctaLabel && (
            <motion.div {...fade} transition={{ duration: 0.5, delay: 0.15 }} className="mt-8">
              <SmartLink href={hub.hero.ctaHref} className="btn btn-primary !px-7 !py-3.5">
                {hub.hero.ctaLabel}
                <span aria-hidden>→</span>
              </SmartLink>
            </motion.div>
          )}
        </div>
        {hub.hero.image && (
          <motion.div {...fade} className="relative mx-auto mt-10 aspect-[16/9] max-w-4xl overflow-hidden rounded-3xl border border-ink/10 shadow-soft-lg">
            <Image src={hub.hero.image} alt={heroImageAlt || hub.hero.heading} fill sizes="(max-width: 1024px) 100vw, 896px" className="object-cover" />
          </motion.div>
        )}
      </section>

      <PageContainersView containers={containers} zone="after-hero" />

      {/* ---- Tool Categories ---- */}
      <section id="tools" className="container-x mt-16">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          {hub.sections.categoriesEyebrow && <span className="eyebrow">{hub.sections.categoriesEyebrow}</span>}
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {hub.sections.categoriesHeadingLead}{hub.sections.categoriesHeadingLead && hub.sections.categoriesHeadingHighlight ? " " : ""}
            {hub.sections.categoriesHeadingHighlight && <span className="grad-text">{hub.sections.categoriesHeadingHighlight}</span>}
          </h2>
        </motion.div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <PageContainersView containers={containers} zone="after-categories" />

      {/* ---- CRM Software Section ---- */}
      <section id="crm" className="container-x mt-16 scroll-mt-28">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          {hub.sections.crmEyebrow && <span className="eyebrow">{hub.sections.crmEyebrow}</span>}
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="grad-text">{hub.crm.heading}</span>
          </h2>
          <div
            className="prose-jhb mt-4 text-muted [&_a]:text-primary"
            dangerouslySetInnerHTML={{ __html: hub.crm.overviewHtml }}
          />
        </motion.div>

        {/* features */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
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
          <div className="mt-10">
            <h3 className="text-center font-display text-xl font-bold">{hub.sections.crmWorkflowHeading}</h3>
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
          <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-ink/10 bg-surface p-8 shadow-soft">
            <h3 className="font-display text-xl font-bold">{hub.sections.crmBenefitsHeading}</h3>
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

      <PageContainersView containers={containers} zone="after-crm" />

      {/* ---- Other Automation Tools ---- */}
      <section id="other-tools" className="container-x mt-16 scroll-mt-28">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          {hub.sections.otherToolsEyebrow && <span className="eyebrow">{hub.sections.otherToolsEyebrow}</span>}
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {hub.sections.otherToolsHeadingLead}{hub.sections.otherToolsHeadingLead && hub.sections.otherToolsHeadingHighlight ? " " : ""}
            {hub.sections.otherToolsHeadingHighlight && <span className="grad-text">{hub.sections.otherToolsHeadingHighlight}</span>}
          </h2>
        </motion.div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <PageContainersView containers={containers} zone="after-other-tools" />

      {/* ---- Benefits ---- */}
      <section className="container-x mt-16">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          {hub.sections.benefitsEyebrow && <span className="eyebrow">{hub.sections.benefitsEyebrow}</span>}
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {hub.sections.benefitsHeadingLead}{hub.sections.benefitsHeadingLead && hub.sections.benefitsHeadingHighlight ? " " : ""}
            {hub.sections.benefitsHeadingHighlight && <span className="grad-text">{hub.sections.benefitsHeadingHighlight}</span>}
          </h2>
        </motion.div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <PageContainersView containers={containers} zone="after-benefits" />

      {/* ---- FAQ ---- */}
      <div className="mt-16">
        <FaqAccordion items={hub.faqs} showNumbers={faqShowNumbers} />
      </div>

      <PageContainersView containers={containers} zone="after-faq" />

      {/* ---- CTA ---- */}
      <section className="container-x my-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-secondary/10 px-6 py-10 text-center shadow-soft sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-[100px]" />
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{hub.cta.heading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">{hub.cta.text}</p>
          {hub.cta.buttonLabel && (
            <SmartLink href={hub.cta.buttonHref} className="btn btn-primary mt-8 !px-7 !py-3.5">
              {hub.cta.buttonLabel}
              <span aria-hidden>→</span>
            </SmartLink>
          )}
        </div>
      </section>

      <PageContainersView containers={containers} zone="bottom" />
    </main>
  );
}
