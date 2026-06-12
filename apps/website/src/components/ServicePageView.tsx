"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ServiceSections } from "@jhb/shared/service-page";
import type { FaqItem } from "@jhb/shared/faqs";
import Icon from "./Icon";
import Reveal from "./Reveal";
import FaqAccordion from "./FaqAccordion";

type RelatedLink = { title: string; slug: string; icon: string };
type Stat = { value: string; label: string };

export default function ServicePageView({
  title,
  icon,
  stats,
  sections,
  related = [],
  faqs = [],
}: {
  title: string;
  icon: string;
  stats: Stat[];
  sections: ServiceSections;
  related?: RelatedLink[];
  faqs?: FaqItem[];
}) {
  const { hero, about, benefits, process, whyUs, clients, testimonials, office, cta } =
    sections;

  return (
    <main className="relative pt-32">
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      {/* Hero */}
      {hero.enabled && (
        <section className="container-x">
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
            <Link href="/#home" className="transition-colors hover:text-ink">Home</Link>
            <span>/</span>
            <Link href="/services" className="transition-colors hover:text-ink">Services</Link>
            <span>/</span>
            <span className="text-primary">{title}</span>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              {hero.eyebrow && (
                <motion.span
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="eyebrow"
                >
                  {hero.eyebrow}
                </motion.span>
              )}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl"
              >
                <span className="grad-text">{hero.heading}</span>
              </motion.h1>
              {hero.subheading && (
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
                >
                  {hero.subheading}
                </motion.p>
              )}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                {hero.ctaText && (
                  <Link href={hero.ctaLink} className="btn btn-primary">
                    {hero.ctaText} →
                  </Link>
                )}
                <Link href="/services" className="btn btn-ghost">
                  All Services
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center"
            >
              {hero.image ? (
                <div className="glass-strong glow-border overflow-hidden rounded-3xl shadow-glow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hero.image} alt={title} className="aspect-square w-full object-cover" />
                </div>
              ) : (
                <>
                  <div className="absolute inset-8 animate-spin-slow rounded-full border border-dashed border-ink/10" />
                  <div className="absolute inset-16 rounded-full border border-ink/[0.06]" />
                  <div className="glass-strong glow-border relative grid h-40 w-40 place-items-center rounded-[2rem] shadow-glow">
                    <span className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/10 to-secondary/10" />
                    <Icon name={icon} className="relative h-20 w-20 text-accent" />
                  </div>
                  {stats.map((s, i) => (
                    <div
                      key={s.label}
                      className={`glass absolute rounded-2xl p-3 text-center shadow-glow ${
                        ["left-0 top-6", "right-0 top-1/3", "bottom-6 left-8"][i] ?? "hidden"
                      } ${i === 1 ? "animate-float" : "animate-float-slow"}`}
                    >
                      <p className="font-display text-lg font-bold grad-text">{s.value}</p>
                      <p className="text-[10px] text-muted">{s.label}</p>
                    </div>
                  ))}
                </>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* About */}
      {about.enabled && (
        <section className="container-x py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">{about.title}</h2>
              <div
                className="prose-jhb mt-5 space-y-4 text-lg leading-relaxed text-muted"
                dangerouslySetInnerHTML={{ __html: about.descriptionHtml }}
              />
            </Reveal>
            <Reveal delay={0.1}>
              {about.image ? (
                <div className="glass-strong overflow-hidden rounded-3xl shadow-glow">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={about.image} alt={about.title} className="aspect-[4/3] w-full object-cover" />
                </div>
              ) : (
                <div className="glass-strong grid aspect-[4/3] place-items-center rounded-3xl shadow-glow">
                  <Icon name={icon} className="h-20 w-20 text-accent" />
                </div>
              )}
            </Reveal>
          </div>
        </section>
      )}

      {/* Benefits / What's Included */}
      {benefits.enabled && benefits.items.length > 0 && (
        <section className="container-x py-20">
          <Reveal>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{benefits.title}</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {benefits.items.map((f, i) => (
              <motion.div
                key={`${f.title}-${i}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                className="glass glow-border rounded-2xl p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 font-display text-sm font-bold text-primary ring-1 ring-ink/10">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Process */}
      {process.enabled && process.steps.length > 0 && (
        <section className="container-x py-20">
          <Reveal>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{process.title}</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {process.steps.map((s, i) => (
              <Reveal key={`${s.title}-${i}`} delay={(i % 4) * 0.06}>
                <div className="glass glow-border h-full rounded-2xl p-6">
                  <span className="font-display text-3xl font-bold grad-text">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      {whyUs.enabled && (
        <section className="container-x py-12">
          <div className="glass-strong glow-border relative overflow-hidden rounded-3xl p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-secondary/15 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-2">
              <div>
                <span className="eyebrow">Why Choose Us</span>
                <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">{whyUs.title}</h2>
                <p className="mt-4 text-muted">{whyUs.description}</p>
              </div>
              <ul className="space-y-4">
                {whyUs.features.map((b, i) => (
                  <motion.li
                    key={`${b}-${i}`}
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
      )}

      {/* Client Showcase */}
      {clients.enabled && clients.logos.length > 0 && (
        <section className="container-x py-16">
          <Reveal>
            <h2 className="mb-8 text-center font-display text-2xl font-bold sm:text-3xl">
              {clients.title}
            </h2>
          </Reveal>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {clients.logos.map((logo, i) => (
              <div
                key={i}
                className="glass flex h-20 w-36 items-center justify-center rounded-2xl p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo}
                  alt="Client logo"
                  loading="lazy"
                  className="max-h-12 w-auto max-w-full object-contain opacity-80 transition-opacity hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.enabled && testimonials.items.length > 0 && (
        <section className="container-x py-16">
          <Reveal>
            <h2 className="mb-10 text-center font-display text-3xl font-bold sm:text-4xl">
              {testimonials.title}
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.items.map((t, i) => (
              <Reveal key={i} delay={(i % 3) * 0.06}>
                <figure className="glass glow-border h-full rounded-2xl p-6">
                  <div className="mb-3 flex text-accent">★★★★★</div>
                  <blockquote className="text-sm leading-relaxed text-ink/80">
                    “{t.review}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    {t.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.photo}
                        alt={t.name}
                        loading="lazy"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white">
                        {(t.name || "?").slice(0, 1)}
                      </span>
                    )}
                    <div>
                      <p className="font-display text-sm font-semibold">{t.name}</p>
                      {t.company && (
                        <p className="text-xs text-muted">{t.company}</p>
                      )}
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="container-x py-20">
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
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <div className="pb-12">
          <FaqAccordion items={faqs} />
        </div>
      )}

      {/* Office Location (per-service override) */}
      {office.enabled && (
        <section className="container-x py-16">
          <div className="glass-strong glow-border overflow-hidden rounded-3xl shadow-soft">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-10">
                <span className="eyebrow">Visit Us</span>
                <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
                  {office.title}
                </h2>
                <ul className="mt-6 space-y-4 text-sm">
                  {office.address && (
                    <li className="flex gap-3">
                      <span>📍</span>
                      <address className="not-italic leading-relaxed text-muted">
                        {office.address}
                      </address>
                    </li>
                  )}
                  {office.phone && (
                    <li className="flex items-center gap-3">
                      <span>📞</span>
                      <a href={`tel:${office.phone.replace(/\s+/g, "")}`} className="font-medium hover:text-primary">
                        {office.phone}
                      </a>
                    </li>
                  )}
                  {office.email && (
                    <li className="flex items-center gap-3">
                      <span>✉️</span>
                      <a href={`mailto:${office.email}`} className="font-medium hover:text-primary">
                        {office.email}
                      </a>
                    </li>
                  )}
                </ul>
                {office.image && (
                  <div className="mt-6 overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={office.image} alt="Office" loading="lazy" className="aspect-video w-full object-cover" />
                  </div>
                )}
              </div>
              <div className="min-h-[300px] p-6 lg:p-8 lg:pl-0">
                {office.mapEmbedUrl ? (
                  <iframe
                    title="Office location map"
                    src={office.mapEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full min-h-[260px] w-full rounded-2xl border-0 shadow-soft"
                    allowFullScreen
                  />
                ) : (
                  <div className="grid h-full min-h-[260px] place-items-center rounded-2xl bg-base text-sm text-muted">
                    Add a Google Map embed URL
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {cta.enabled && (
        <section className="container-x pb-28">
          <div className="glow-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-surface to-secondary/15 p-10 text-center sm:p-16">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{cta.heading}</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">{cta.description}</p>
            {cta.buttonText && (
              <Link href={cta.buttonLink} className="btn btn-primary mt-8">
                {cta.buttonText} →
              </Link>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
