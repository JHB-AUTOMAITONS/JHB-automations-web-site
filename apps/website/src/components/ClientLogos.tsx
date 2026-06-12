"use client";

import { motion } from "framer-motion";

/**
 * Replace these with real clients.
 * - Add a logo image to apps/website/public/clients/<file> and set `logo`.
 * - If `logo` is omitted, a clean wordmark is shown as a placeholder.
 */
type Client = { name: string; logo?: string };

const clients: Client[] = [
  { name: "MediCare Plus" },
  { name: "Urban Nest" },
  { name: "PureGlow" },
  { name: "FinEdge" },
  { name: "ShopSphere" },
  { name: "EduSpark" },
  { name: "LogiFlow" },
  { name: "Trendora" },
  { name: "FreshCart" },
  { name: "NovaBank" },
];

export default function ClientLogos() {
  return (
    <section
      id="clients"
      className="relative overflow-hidden bg-gradient-to-br from-[#0A1230] via-[#0C1A3A] to-[#070B1F] py-20 sm:py-24"
      aria-labelledby="clients-heading"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-secondary/20 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-40" />

      <div className="container-x relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Trusted Partnerships
          </span>
          <h2
            id="clients-heading"
            className="mt-5 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Our Valuable <span className="grad-text">Clients</span>
          </h2>
          <p className="mt-3 text-white/60">
            Brands across industries trust JHB Automations to drive their growth.
          </p>
        </motion.div>

        {/* Desktop / tablet: responsive grid */}
        <div className="mt-12 hidden grid-cols-3 gap-4 sm:grid sm:grid-cols-4 lg:grid-cols-5">
          {clients.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: (i % 5) * 0.06 }}
            >
              <LogoCard client={c} />
            </motion.div>
          ))}
        </div>

        {/* Mobile: autoplay marquee */}
        <div className="mt-10 sm:hidden">
          <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused]">
              {[...clients, ...clients].map((c, i) => (
                <div key={`${c.name}-${i}`} className="w-36 shrink-0">
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

function LogoCard({ client }: { client: Client }) {
  return (
    <div className="group/logo flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 hover:shadow-[0_18px_40px_-12px_rgba(37,99,235,0.5)]">
      {client.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={client.logo}
          alt={`${client.name} logo`}
          loading="lazy"
          decoding="async"
          className="max-h-12 w-auto max-w-full object-contain opacity-80 grayscale transition-all duration-300 group-hover/logo:opacity-100 group-hover/logo:grayscale-0"
        />
      ) : (
        <span className="text-center font-display text-base font-semibold text-white/70 transition-colors duration-300 group-hover/logo:text-white">
          {client.name}
        </span>
      )}
    </div>
  );
}
