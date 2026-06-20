import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getServices } from "@jhb/shared/services-server";
import { buildMetadata } from "@jhb/shared/content-server";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/services", {
    title: "Our Services — JHB Automations",
    description:
      "Explore our full range of AI automation, web development, marketing and growth services.",
  });
}

export default async function ServicesIndex() {
  const services = await getServices();
  return (
    <main className="relative pt-28">
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <section className="container-x">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Services", href: "/services" },
          ]}
        />

        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="eyebrow">What We Do</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Our <span className="grad-text">Services</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-4 text-lg text-muted">
              Click any service to explore how we deliver measurable growth for
              your business.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 pb-28 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 3) * 0.06}>
              <Link
                href={`/services/${s.slug}`}
                className="group glass glow-border flex h-full flex-col rounded-2xl p-6 transition-transform hover:-translate-y-1.5"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary ring-1 ring-ink/10 transition-all group-hover:from-primary group-hover:to-secondary group-hover:text-white group-hover:shadow-glow">
                  <Icon
                  name={s.icon}
                  className="h-6 w-6 transition-transform duration-300 group-hover:animate-wiggle"
                />
                </span>
                <h2 className="mt-5 break-words font-display text-lg font-semibold">
                  {s.title}
                </h2>
                <p className="mt-2 flex-1 break-words text-sm leading-relaxed text-muted">
                  {s.short}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Learn more
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
