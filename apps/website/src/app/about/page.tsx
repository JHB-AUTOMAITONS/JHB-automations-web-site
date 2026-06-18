import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import Stats from "@/components/Stats";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAbout } from "@jhb/shared/about-server";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout();
  return {
    title: about.metaTitle,
    description: about.metaDescription,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  // All copy is managed in Admin → About Page (jhb_content "about"); falls back
  // to the built-in defaults until an admin saves.
  const about = await getAbout();

  return (
    <main className="relative pt-28">
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      {/* Hero */}
      <section className="container-x">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "About", href: "/about" },
          ]}
        />

        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="eyebrow">{about.heroEyebrow}</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              {about.heroTitleLead}{" "}
              <span className="grad-text">{about.heroTitleHighlight}</span>{" "}
              {about.heroTitleTail}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              {about.heroSubtitle}
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
                {about.missionIcon}
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold">
                {about.missionLabel}{" "}
                <span className="grad-text">{about.missionHighlight}</span>
              </h2>
              <p className="mt-3 leading-relaxed text-muted">{about.missionBody}</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass glow-border h-full rounded-3xl p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 text-2xl ring-1 ring-ink/10">
                {about.visionIcon}
              </span>
              <h2 className="mt-5 font-display text-2xl font-bold">
                {about.visionLabel}{" "}
                <span className="grad-text">{about.visionHighlight}</span>
              </h2>
              <p className="mt-3 leading-relaxed text-muted">{about.visionBody}</p>
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
            <span className="eyebrow">{about.valuesEyebrow}</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
              {about.valuesHeadingLead}{" "}
              <span className="grad-text">{about.valuesHeadingHighlight}</span>
            </h2>
          </Reveal>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {about.values.map((v, i) => (
            <Reveal key={`${v.title}-${i}`} delay={(i % 4) * 0.06}>
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

      {/* CTA */}
      <section className="container-x pb-28">
        <div className="glow-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-surface to-secondary/15 p-10 text-center sm:p-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {about.ctaTitleLead}{" "}
            <span className="grad-text">{about.ctaTitleHighlight}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">{about.ctaBody}</p>
          <Link href={about.ctaButtonHref} className="btn btn-primary mt-8">
            {about.ctaButtonLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
