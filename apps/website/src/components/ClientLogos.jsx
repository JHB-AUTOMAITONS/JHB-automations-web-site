import Reveal from "./Reveal";
import { ALIGN_TEXT } from "@jhb/shared/containers";

// Server component: the whole marquee is pure CSS (no client JS state, so
// there's nothing to re-render) — only the heading uses <Reveal> for its
// entrance animation.
export default function ClientLogos({
  items = [],
  eyebrow = "Trusted Partnerships",
  headingLead = "Our Valuable",
  headingHighlight = "Clients",
  description = "Brands across industries trust JHB Automations to drive their growth.",
  headingAlign,
  descriptionAlign,
}) {
  // Logo-only, fully database-driven: render uploaded logos, no text names.
  const clients = (items ?? [])
    .filter((c) => c.logo_url)
    .map((c) => ({ id: c.id, logo: c.logo_url, alt: c.alt_text, title: c.image_title }));
  if (clients.length === 0) return null;

  // Split into 3 sequential rows — order is preserved end-to-end (row 1 holds
  // the first third, row 2 the next third, row 3 the rest) — so no logo is
  // reordered or dropped, only redistributed across rows.
  const per = Math.ceil(clients.length / 3);
  const rows = [clients.slice(0, per), clients.slice(per, per * 2), clients.slice(per * 2)].filter(
    (r) => r.length > 0
  );
  // Slightly different durations per row so 3 rows never fall back into sync.
  const durations = [34, 40, 46];

  return (
    <section
      id="clients"
      className="relative overflow-hidden bg-gradient-to-br from-[#0A1230] via-[#0C1A3A] to-[#070B1F] section-y sec-bg-custom"
      aria-labelledby="clients-heading"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-secondary/20 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] opacity-40" />

      <div className="container-x relative">
        <Reveal y={24} duration={0.6} className={`mx-auto max-w-2xl ${ALIGN_TEXT[headingAlign ?? "center"]}`}>
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
          {description && <p className={`mt-3 text-white/60 ${ALIGN_TEXT[descriptionAlign ?? "center"]}`}>{description}</p>}
        </Reveal>
      </div>

      {/* 3 continuously scrolling rows (full-bleed, outside container-x so the
          edge fade reaches the section edges) — row 1 & 3 scroll right→left,
          row 2 scrolls left→right. Same rows/card size at every breakpoint;
          only the card dimensions and speed scale down on smaller screens. */}
      <div className="relative mt-10 flex flex-col gap-3 sm:gap-4">
        {rows.map((row, i) => (
          <MarqueeRow key={i} items={row} reverse={i === 1} duration={durations[i]} rowIndex={i} />
        ))}
      </div>
    </section>
  );
}

function MarqueeRow({
  items,
  reverse,
  duration,
  rowIndex,
}) {
  // Duplicate the row so the loop point is invisible: the animation runs from
  // translate3d(0,0,0) to translate3d(-50%,0,0) (or the reverse), and since the
  // second half is a pixel-identical copy of the first, the reset is seamless.
  const loop = [...items, ...items];
  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
      <div
        data-row={rowIndex}
        className={`client-logos-row flex w-max gap-3 will-change-transform sm:gap-4 lg:gap-5 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        } group-hover:[animation-play-state:paused]`}
        style={{ animationDuration: `${duration}s` }}
      >
        {loop.map((c, i) => (
          <LogoCard key={`${c.id}-${i}`} client={c} duplicate={i >= items.length} />
        ))}
      </div>
    </div>
  );
}

function LogoCard({ client, duplicate }) {
  return (
    <div
      // The duplicated half of the loop is decorative (a11y-wise the first
      // pass already announced every logo), so hide it from screen readers.
      aria-hidden={duplicate || undefined}
      className="group/logo flex h-16 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/10 hover:shadow-[0_18px_40px_-12px_rgba(37,99,235,0.5)] sm:h-20 sm:w-32 sm:p-4 lg:h-24 lg:w-40 lg:p-5"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={client.logo}
        alt={client.alt || "Client logo"}
        title={client.title || undefined}
        loading="lazy"
        decoding="async"
        // h/w-full (not max-*) → small source logos scale UP to fill the card
        // instead of floating tiny in the middle; object-contain still scales
        // large ones down and never crops, so aspect ratio is always kept.
        // grayscale(10%) → full colour on hover is a subtle premium touch.
        className="h-full w-full object-contain object-center grayscale-[10%] transition-all duration-300 group-hover/logo:scale-105 group-hover/logo:grayscale-0"
        style={{ imageRendering: "auto" }}
      />
    </div>
  );
}
