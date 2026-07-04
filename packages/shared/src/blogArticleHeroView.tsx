import Link from "next/link";
import type { BlogArticleHero } from "./content";

// SINGLE source of truth for the blog ARTICLE hero banner — rendered on each
// public /blog/[slug] page AND in the admin live preview, so the preview matches
// the site exactly. The appearance (background image per breakpoint, overlay,
// height, bottom-corner radius) comes from the global BlogArticleHero config; the
// breadcrumb, badge (post category), title, author, date and reading time are
// passed in per-post — never editable in admin.
//
// Mirrors the Blog Listing hero (blogHeroView) for a consistent design language:
// full-width background + dark overlay + rounded bottom corners, content centered
// in white. Responsive via clamp() (desktop large, tablet/mobile compact) and a
// <picture> that swaps the background image per breakpoint.
export default function BlogArticleHeroBanner({
  hero,
  title,
  category,
  author,
  dateLabel,
  readingLabel,
}: {
  hero: BlogArticleHero;
  title: string;
  category?: string | null;
  author: string;
  dateLabel: string;
  readingLabel: string;
}) {
  if (hero.enabled === false) return null;

  const height = Math.max(300, hero.height || 460);
  const radius = Math.max(0, hero.borderRadius || 0);
  const overlay = Math.min(100, Math.max(0, hero.overlayOpacity ?? 55)) / 100;
  // Desktop is the base <img>; tablet/mobile override via <source>. Fall back to
  // whatever single image is set so a partial config still shows a background.
  const desktopSrc = hero.imageDesktop || hero.imageTablet || hero.imageMobile || "";

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
      }}
      aria-label={title}
    >
      {desktopSrc ? (
        <picture className="absolute inset-0 block h-full w-full">
          {hero.imageMobile ? <source media="(max-width: 640px)" srcSet={hero.imageMobile} /> : null}
          {hero.imageTablet ? <source media="(max-width: 1024px)" srcSet={hero.imageTablet} /> : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={desktopSrc} alt={hero.imageAlt} className="h-full w-full object-cover" />
        </picture>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-ink to-secondary/40" />
      )}

      {/* dark overlay for legibility */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: hero.overlayColor || "#0a0e1a", opacity: overlay }}
      />

      {/* content — centered, white, over the overlay (clears the fixed nav).
          min-height (not a fixed section height) so long titles GROW the banner
          instead of being clipped; the absolute picture/overlay track it. */}
      <div
        className="container-x relative flex items-center justify-center pb-8 pt-16"
        style={{ minHeight: `clamp(300px, 50vw, ${height}px)` }}
      >
        <div className="flex w-full max-w-3xl flex-col items-center text-center">
          <nav
            className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/80 sm:text-sm"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/blog" className="transition-colors hover:text-white">Blog</Link>
            <span aria-hidden>/</span>
            <span className="max-w-[60vw] truncate text-white">{title}</span>
          </nav>

          {category ? (
            <span className="mt-4 inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
              {category}
            </span>
          ) : null}

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-white/85">
            {dateLabel ? <span>{dateLabel}</span> : null}
            {dateLabel && readingLabel ? <span aria-hidden>·</span> : null}
            {readingLabel ? <span>{readingLabel}</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
