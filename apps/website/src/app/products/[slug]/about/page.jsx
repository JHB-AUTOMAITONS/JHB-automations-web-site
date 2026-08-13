import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { existsSync } from "fs";
import { join } from "path";
import { getProductBySlug, getPublishedProducts } from "@jhb/shared/products-server";
import { visibleItems } from "@jhb/shared/products";
import { stripHeadingTags, ALIGN_TEXT, richTextAlign } from "@jhb/shared/containers";
import { Heading } from "@jhb/shared/heading";
import { sanitizeRichText } from "@jhb/shared/rich-text";
import Reveal from "@/components/Reveal";
import PageContainers from "@/components/PageContainers";
import SmartLink from "@/components/SmartLink";

// Pre-render the About page for each product that has a detail page.
export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products
    .filter((p) => !p.href || !p.href.trim())
    .map((p) => ({ slug: p.slug }));
}
// New products added in the admin render on demand (no rebuild needed).
export const dynamicParams = true;

// Only render an image we actually have — remote (storage) URLs always; local
// /public paths only if the file exists. Prevents broken-image placeholders.
function hasImage(src) {
  if (!src) return false;
  if (/^https?:\/\//.test(src)) return true;
  try {
    return existsSync(join(process.cwd(), "public", src.replace(/^\//, "")));
  } catch {
    return false;
  }
}

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  const a = p?.about;
  if (!p || !a) return { title: "Not Found — JHB Automations" };
  const strip = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const canonical = a.canonical?.trim() || `/products/${p.slug}/about`;
  const ogImages = a.ogImage?.trim()
    ? [a.ogImage.trim()]
    : hasImage(a.image)
      ? [a.image]
      : undefined;
  return {
    title: a.metaTitle || `About ${p.title} — JHB Automations`,
    description: a.metaDescription || strip(a.heroDescription),
    alternates: { canonical },
    openGraph: {
      siteName: "JHB Automations",
      type: "website",
      url: canonical,
      title: a.ogTitle || a.metaTitle || `About ${p.title}`,
      description: a.ogDescription || a.metaDescription || strip(a.heroDescription),
      ...(ogImages ? { images: ogImages } : {}),
    },
  };
}

export default async function AboutProductPage({
  params,
}) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p || p.status !== "published") notFound();
  const a = p.about;
  const containers = a.containers ?? [];
  // Drop hidden cards BEFORE rendering — the feature/benefit cards are numbered
  // from the array index, so skipping inside the map would leave gaps. The
  // existing length>0 guards below now test the FILTERED arrays, so hiding every
  // card in a block removes the block instead of stranding its heading over an
  // empty grid. Absent `hidden` = shown (see products.ts).
  const aboutStats = visibleItems(a.stats);
  const aboutFeatures = visibleItems(a.features);
  const aboutBenefits = visibleItems(a.benefits);

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: a.metaTitle || `About ${p.title}`,
    description: a.metaDescription || a.heroDescription,
    url: `${site}/products/${p.slug}/about`,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site },
      { "@type": "ListItem", position: 2, name: p.title, item: `${site}/products/${p.slug}` },
      { "@type": "ListItem", position: 3, name: `About ${p.title}`, item: `${site}/products/${p.slug}/about` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="relative pt-24">
        <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

        <PageContainers containers={containers} zone="top" />

        {/* Hero */}
        <section className="container-x">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span>/</span>
            <Link href={`/products/${p.slug}`} className="hover:text-ink">{p.title}</Link>
            <span>/</span>
            <span className="text-ink">About</span>
          </nav>

          {/* Hero hidden → the breadcrumb above survives, which matters here:
              it carries the only other link back to the product page (the
              "← Back to" button lives inside this block). */}
          {!a.heroHidden && (
          <div className="mt-8 grid items-center gap-8 lg:grid-cols-2">
            {/* Brand logo — prominent, contained, padded, never cropped */}
            {hasImage(a.image) && (
              <Reveal delay={0.05} className="lg:order-1">
                <div className="group relative mx-auto w-full max-w-lg">
                  <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.75rem] bg-gradient-to-br from-primary/25 to-secondary/25 blur-3xl" />
                  <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white p-8 shadow-glow sm:p-10">
                    <div className="relative aspect-[5/2]">
                      <Image
                        src={a.image}
                        alt={a.imageAlt || "Vasool Tamil Brand Logo"}
                        fill
                        priority
                        sizes="(max-width: 1024px) 90vw, 520px"
                        className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                      />
                    </div>
                  </div>
                </div>
              </Reveal>
            )}
            <div className="lg:order-2">
              <Reveal><span className="eyebrow">About</span></Reveal>
              <Reveal delay={0.06}>
                <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
                  <span className="grad-text">{a.heroTitle || `About ${p.title}`}</span>
                </h1>
              </Reveal>
              {a.heroDescription && (
                <Reveal delay={0.12}>
                  <div
                    className="prose-jhb mt-6 text-lg leading-relaxed text-muted [&_a]:font-medium [&_a]:text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(a.heroDescription) }}
                  />
                </Reveal>
              )}
              <Reveal delay={0.18}>
                <Link href={`/products/${p.slug}`} className="btn btn-ghost mt-8 !px-6 !py-3 !text-sm">
                  ← Back to {p.title}
                </Link>
              </Reveal>
            </div>
          </div>
          )}
        </section>

        <PageContainers containers={containers} zone="after-hero" />

        {/* Overview */}
        {!a.overviewHidden && a.overview && (
          <section className="container-x mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal><span className="eyebrow">Our Story</span></Reveal>
              <Reveal delay={0.08}>
                <div
                  className="prose-jhb mt-5 text-lg leading-relaxed text-muted [&_a]:font-medium [&_a]:text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(a.overview) }}
                />
              </Reveal>
            </div>
          </section>
        )}

        <PageContainers containers={containers} zone="after-overview" />

        {/* Stats */}
        {!a.statsHidden && aboutStats.length > 0 && (
          <section className="container-x mt-16">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {aboutStats.map((s, i) => (
                <Reveal key={s.label} delay={(i % 4) * 0.06}>
                  <div className="glass rounded-2xl p-6 text-center">
                    <p className="font-display text-4xl font-bold grad-text">{s.value}</p>
                    <p className="mt-1 text-sm text-muted">{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <PageContainers containers={containers} zone="after-stats" />

        {/* Features */}
        {!a.featuresHidden && aboutFeatures.length > 0 && (
          <section className="container-x mt-16">
            <div className="mx-auto max-w-2xl text-center">
              <Reveal><h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">What makes it <span className="grad-text">different</span></h2></Reveal>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {aboutFeatures.map((f, i) => (
                <Reveal key={f.title} delay={(i % 3) * 0.06}>
                  <div className="glass glow-border flex h-full items-start gap-4 rounded-2xl p-6">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">{i + 1}</span>
                    <div className="min-w-0">
                      {(() => {
                        const s = sanitizeRichText(f.title);
                        const ta = richTextAlign(s);
                        return (
                          <Heading
                            tag="h3"
                            className={`font-display text-lg font-semibold [&_p]:m-0 [&_a]:text-primary ${ta ? ALIGN_TEXT[ta] : ""}`}
                            html={stripHeadingTags(s)}
                          />
                        );
                      })()}
                      <div
                        className="mt-1.5 text-sm leading-relaxed text-muted [&_p]:m-0 [&_a]:text-primary [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5"
                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(f.desc) }}
                      />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <PageContainers containers={containers} zone="after-features" />

        {/* Benefits */}
        {!a.benefitsHidden && aboutBenefits.length > 0 && (
          <section className="container-x mt-16">
            <div className="mx-auto max-w-2xl text-center">
              <Reveal><h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">The <span className="grad-text">benefits</span></h2></Reveal>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {aboutBenefits.map((b, i) => (
                <Reveal key={b.title} delay={(i % 2) * 0.06}>
                  <div className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
                    {(() => {
                      const s = sanitizeRichText(b.title);
                      const ta = richTextAlign(s);
                      return (
                        <Heading
                          tag="h3"
                          className={`font-display text-lg font-semibold [&_p]:m-0 [&_a]:text-primary ${ta ? ALIGN_TEXT[ta] : ""}`}
                          html={stripHeadingTags(s)}
                        />
                      );
                    })()}
                    <div
                      className="mt-1.5 text-sm leading-relaxed text-muted [&_p]:m-0 [&_a]:text-primary [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: sanitizeRichText(b.desc) }}
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <PageContainers containers={containers} zone="after-benefits" />

        {/* CTA */}
        {/* Falls back to hardcoded copy when its fields are blank, so emptying
            them can't remove it — the toggle is the only way. */}
        {!a.ctaHidden && (
        <section className="container-x my-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-secondary/10 px-6 py-10 text-center shadow-soft sm:px-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-[100px]" />
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{a.ctaHeading || `See ${p.title} in action`}</h2>
            {a.ctaText && <p className="mx-auto mt-4 max-w-xl text-muted">{a.ctaText}</p>}
            <SmartLink href={a.ctaButtonHref || "/#contact"} className="btn btn-primary mt-8 !px-7 !py-3.5">
              {a.ctaButtonLabel || "Book a Free Demo"}
              <span aria-hidden>→</span>
            </SmartLink>
          </div>
        </section>
        )}

        <PageContainers containers={containers} zone="bottom" />
      </main>
    </>
  );
}
