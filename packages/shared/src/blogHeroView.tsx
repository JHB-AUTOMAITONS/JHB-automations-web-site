import type { BlogHero } from "./content";

// SINGLE source of truth for the blog hero banner — rendered on the public blog
// page AND in the admin live preview, so the preview matches the site exactly.
//
// Full-width banner: editable background image (gradient fallback), adjustable
// dark overlay, badge + heading, configurable height / radius / alignment.
// Responsive via clamp(): desktop honours the configured height, tablet/mobile
// scale down. Text is centered below lg and uses the chosen alignment on desktop.
export default function BlogHeroBanner({ hero }: { hero: BlogHero }) {
  if (hero.enabled === false) return null;

  const height = Math.max(240, hero.height || 560);
  const radius = Math.max(0, hero.borderRadius || 0);
  const overlay = Math.min(100, Math.max(0, hero.overlayOpacity ?? 50)) / 100;
  const lgAlign =
    hero.align === "center" ? "lg:items-center lg:text-center"
      : hero.align === "right" ? "lg:items-end lg:text-right"
        : "lg:items-start lg:text-left";

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: `clamp(340px, 52vw, ${height}px)`,
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
      }}
      aria-label="Blog"
    >
      {hero.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hero.image}
          alt={hero.imageAlt}
          {...(hero.imageTitle ? { title: hero.imageTitle } : {})}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-ink to-secondary/40" />
      )}

      {/* dark overlay for readability */}
      <div className="absolute inset-0" style={{ backgroundColor: hero.overlayColor || "#0a0e1a", opacity: overlay }} />

      {/* content — vertically centered, centered on mobile/tablet, aligned per setting on desktop */}
      <div className="container-x relative flex h-full items-center">
        <div className={`flex w-full flex-col items-center text-center ${lgAlign}`}>
          <div className="max-w-2xl">
            {hero.badge ? (
              <span className="inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
                {hero.badge}
              </span>
            ) : null}
            {hero.heading ? (
              <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-6xl">
                {hero.heading}
              </h1>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
