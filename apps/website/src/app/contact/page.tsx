import type { Metadata } from "next";
import { getSettings } from "@jhb/shared/content-server";
import Contact from "@/components/Contact";
import Reveal from "@/components/Reveal";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Contact Us — JHB Automations",
  description:
    "Get in touch. Tell us about your goals and we'll map the fastest path to automated, predictable growth.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  // Contact details are managed in Admin → Settings (jhb_settings). Reading them
  // here keeps the quick-channel cards, hours strip and the contact form in sync
  // with every admin edit (no hardcoded numbers/addresses).
  const settings = await getSettings();
  const telDigits = settings.phone.replace(/[^\d]/g, "");
  const channels = [
    {
      icon: "📞",
      label: "Call us",
      value: settings.phone,
      href: `tel:${settings.phone.replace(/\s+/g, "")}`,
    },
    {
      icon: "✉️",
      label: "Email us",
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    {
      icon: "💬",
      label: "WhatsApp",
      value: "Chat with us",
      href: `https://wa.me/${telDigits}`,
    },
  ];

  return (
    <main className="relative pt-24">
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-secondary/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      {/* Hero */}
      <section className="container-x">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Contact", href: "/contact" },
          ]}
        />

        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="eyebrow">{settings.pageHeroes.contact.eyebrow}</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              {settings.pageHeroes.contact.headingLead}{" "}
              <span className="grad-text">{settings.pageHeroes.contact.headingHighlight}</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              {settings.pageHeroes.contact.description}
            </p>
          </Reveal>
        </div>

        {/* quick channels */}
        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
          {channels.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06}>
              <a
                href={c.href}
                className="group glass glow-border flex h-full flex-col items-center gap-2 rounded-2xl p-6 text-center transition-transform hover:-translate-y-1"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl ring-1 ring-ink/10">
                  {c.icon}
                </span>
                <span className="mt-1 text-xs uppercase tracking-wider text-muted">
                  {c.label}
                </span>
                <span className="min-w-0 max-w-full break-words font-medium text-ink transition-colors group-hover:text-primary">
                  {c.value}
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Full contact form + info (reused component) */}
      <Contact settings={settings} />

      {/* Hours strip */}
      <section className="container-x pb-20">
        <div className="glass flex flex-col items-center justify-between gap-3 rounded-2xl p-6 text-center sm:flex-row sm:text-left">
          <p className="flex items-center gap-3 text-sm text-muted">
            <span className="text-xl">🕘</span>
            Office Hours: {settings.hours}
          </p>
          <p className="flex items-center gap-3 text-sm text-muted">
            <span className="text-xl">📍</span>
            {settings.address}
          </p>
        </div>
      </section>
    </main>
  );
}
