import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Stats from "@/components/Stats";
import { processSteps } from "@jhb/shared/data";

export const metadata: Metadata = {
  title: "About Us — JHB Automations",
  description:
    "We help businesses automate operations, generate leads and scale faster with intelligent AI systems, web development and data-driven marketing.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: "🎯",
    title: "Results Over Noise",
    desc: "We obsess over measurable outcomes — leads, revenue and ROI — not vanity metrics.",
  },
  {
    icon: "⚙️",
    title: "Engineering Mindset",
    desc: "We treat automation like engineering: reliable, tested and built to scale.",
  },
  {
    icon: "🤝",
    title: "Radical Transparency",
    desc: "Clear reporting, honest timelines and full visibility into everything we do.",
  },
  {
    icon: "🚀",
    title: "Always Innovating",
    desc: "We stay on the frontier of AI so your business is always a step ahead.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative pt-32">
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      {/* Hero */}
      <section className="container-x">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
          <Link href="/#home" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <span className="text-primary">About</span>
        </nav>

        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="eyebrow">Who We Are</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              We Build the <span className="grad-text">Automated Future</span> of
              Business
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              JHB Automations is a next-generation AI automation agency. We help
              ambitious businesses automate their operations, generate leads on
              autopilot and scale faster — combining intelligent AI systems,
              high-performance web development and data-driven marketing.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Story / Mission + Vision */}
      <section className="container-x py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="glass glow-border h-full rounded-3xl p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl ring-1 ring-ink/10">
                🎯
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold">
                Our <span className="grad-text">Mission</span>
              </h2>
              <p className="mt-3 leading-relaxed text-muted">
                To make world-class automation and digital growth accessible to
                every business — removing manual bottlenecks so teams can focus
                on what truly matters: serving customers and growing.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass glow-border h-full rounded-3xl p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 text-2xl ring-1 ring-ink/10">
                🔭
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold">
                Our <span className="grad-text">Vision</span>
              </h2>
              <p className="mt-3 leading-relaxed text-muted">
                A world where every business — from startup to enterprise — runs
                on intelligent systems that work 24/7, turning data into growth
                and conversations into customers.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats (reused animated section) */}
      <Stats />

      {/* Values */}
      <section className="container-x py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Reveal>
            <span className="eyebrow">Our Values</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
              What <span className="grad-text">Drives Us</span>
            </h2>
          </Reveal>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={(i % 4) * 0.06}>
              <div className="glass glow-border h-full rounded-2xl p-6">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-ink/[0.04] text-2xl ring-1 ring-ink/10">
                  {v.icon}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {v.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How we work */}
      <section className="container-x py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Reveal>
            <span className="eyebrow">How We Work</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
              A Proven <span className="grad-text">Process</span>
            </h2>
          </Reveal>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {processSteps.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 0.06}>
              <div className="glass glow-border flex h-full items-start gap-4 rounded-2xl p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-xl ring-1 ring-ink/10">
                  {s.icon}
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                    Phase {i + 1}
                  </p>
                  <h3 className="font-display text-lg font-semibold">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-28">
        <div className="glow-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-surface to-secondary/15 p-10 text-center sm:p-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Let&apos;s Build Something <span className="grad-text">Great</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Ready to automate and scale? Book a free consultation and we&apos;ll
            map your fastest path to growth.
          </p>
          <Link href="/contact" className="btn btn-primary mt-8">
            Book Free Consultation →
          </Link>
        </div>
      </section>
    </main>
  );
}
