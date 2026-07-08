import Reveal from "./Reveal";
import type { ClientLogo } from "@jhb/shared/client-logos";

type Logo = { id: string; logo: string; alt?: string | null; title?: string | null };

// Server component: logo grid + mobile marquee are static (CSS animation); only
// the heading and per-logo entrances are animated via <Reveal>.
export default function ClientLogos({
  items = [],
  eyebrow = "Trusted Partnerships",
  headingLead = "Our Valuable",
  headingHighlight = "Clients",
  description = "Brands across industries trust JHB Automations to drive their growth.",
}: {
  items?: ClientLogo[];
  eyebrow?: string;
  headingLead?: string;
  headingHighlight?: string;
  description?: string;
}) {
  // Logo-only, fully database-driven: render uploaded logos, no text names.
  const clients: Logo[] = (items ?? [])
    .filter((c) => c.logo_url)
    .map((c) => ({ id: c.id, logo: c.logo_url as string, alt: c.alt_text, title: c.image_title }));
  if (clients.length === 0) return null;
  return (
    <section
      id="clients"
      className="relative overflow-hidden bg-gradient-to-br from-[#0A1230] via-[#0C1A3A] to-[#070B1F] py-8 sm:py-10 lg:py-12"
      aria-labelledby="clients-heading"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-secondary/20 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-40" />

      <div className="container-x relative">
        <Reveal y={24} duration={0.6} className="mx-auto max-w-2xl text-center">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {eyebrow}
            </span>
          )}
          <h2
            id="clients-heading"
            className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {headingLead}{headingLead && headingHighlight ? " " : ""}
            {headingHighlight && <span className="grad-text">{headingHighlight}</span>}
          </h2>
          {description && <p className="mt-3 text-white/60">{description}</p>}
        </Reveal>

        {/* Desktop / tablet: responsive grid */}
        <div className="mt-10 hidden grid-cols-3 gap-4 sm:grid sm:grid-cols-4 lg:grid-cols-5">
          {clients.map((c, i) => (
            <Reveal key={c.id} y={20} duration={0.45} delay={(i % 5) * 0.06}>
              <LogoCard client={c} />
            </Reveal>
          ))}
        </div>

        {/* Mobile: autoplay marquee */}
        <div className="mt-10 sm:hidden">
          <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused]">
              {[...clients, ...clients].map((c, i) => (
                <div key={`${c.id}-${i}`} className="w-36 shrink-0">
                  <LogoCard client={c} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoCard({ client }: { client: Logo }) {
  return (
    <div className="group/logo h-24 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 hover:shadow-[0_18px_40px_-12px_rgba(37,99,235,0.5)]">
      {/* Dedicated logo container: fixed size, centered, padded, clipped */}
      <div className="flex h-full w-full items-center justify-center overflow-hidden p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={client.logo}
          alt={client.alt || "Client logo"}
          title={client.title || undefined}
          loading="lazy"
          decoding="async"
          // max-* (not h/w-full) → logos scale DOWN to fit but never upscale past
          // native resolution, so they stay crisp; object-contain keeps aspect.
          className="max-h-full max-w-full object-contain object-center transition-transform duration-300 group-hover/logo:scale-105"
          style={{ imageRendering: "auto" }}
        />
      </div>
    </div>
  );
}
