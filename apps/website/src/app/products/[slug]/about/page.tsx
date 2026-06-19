import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { existsSync } from "fs";
import { join } from "path";
import { getProductBySlug, getPublishedProducts } from "@jhb/shared/products-server";
import Reveal from "@/components/Reveal";

// Static export: pre-render the About page for each product that has a detail page.
export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products
    .filter((p) => !p.href || !p.href.trim())
    .map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

// Only render an image we actually have — remote (storage) URLs always; local
// /public paths only if the file exists. Prevents broken-image placeholders.
function hasImage(src: string | null): boolean {
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
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  const a = p?.about;
  if (!p || !a) return { title: "Not Found — JHB Automations" };
  const strip = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const canonical = a.canonical?.trim() || `/products/${p.slug}/about`;
  const ogImages = a.ogImage?.trim()
    ? [a.ogImage.trim()]
    : hasImage(a.image)
      ? [a.image as string]
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p || p.status !== "published") notFound();
  const a = p.about;

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

      <main className="relative pt-28">
        <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

        {/* Hero */}
        <section className="container-x">
          <nav className="flex items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
            <a href="/" className="hover:text-ink">Home</a>
            <span>/</span>
            <a href={`/products/${p.slug}`} className="hover:text-ink">{p.title}</a>
            <span>/</span>
            <span className="text-ink">About</span>
          </nav>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-2">
            {/* Brand logo — prominent, contained, padded, never cropped */}
            {hasImage(a.image) && (
              <Reveal delay={0.05} className="lg:order-1">
                <div className="group relative mx-auto w-full max-w-lg">
                  <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.75rem] bg-gradient-to-br from-primary/25 to-secondary/25 blur-3xl" />
                  <div className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white p-8 shadow-glow sm:p-10">
                    <div className="relative aspect-[5/2]">
                      <Image
                        src={a.image as string}
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
                    className="prose-jhb mt-6 text-lg leading-relaxed text-muted [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: a.heroDescription }}
                  />
                </Reveal>
              )}
              <Reveal delay={0.18}>
                <a href={`/products/${p.slug}`} className="btn btn-ghost mt-8 !px-6 !py-3 !text-sm">
                  ← Back to {p.title}
                </a>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Overview */}
        {a.overview && (
          <section className="container-x mt-24">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal><span className="eyebrow">Our Story</span></Reveal>
              <Reveal delay={0.08}>
                <div
                  className="prose-jhb mt-5 text-lg leading-relaxed text-muted [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: a.overview }}
                />
              </Reveal>
            </div>
          </section>
        )}

        {/* Stats */}
        {a.stats.length > 0 && (
          <section className="container-x mt-24">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {a.stats.map((s, i) => (
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

        {/* Features */}
        {a.features.length > 0 && (
          <section className="container-x mt-24">
            <div className="mx-auto max-w-2xl text-center">
              <Reveal><h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">What makes it <span className="grad-text">different</span></h2></Reveal>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {a.features.map((f, i) => (
                <Reveal key={f.title} delay={(i % 3) * 0.06}>
                  <div className="glass glow-border flex h-full items-start gap-4 rounded-2xl p-6">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">{i + 1}</span>
                    <div>
                      <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Benefits */}
        {a.benefits.length > 0 && (
          <section className="container-x mt-24">
            <div className="mx-auto max-w-2xl text-center">
              <Reveal><h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">The <span className="grad-text">benefits</span></h2></Reveal>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {a.benefits.map((b, i) => (
                <Reveal key={b.title} delay={(i % 2) * 0.06}>
                  <div className="rounded-2xl border border-ink/10 bg-surface p-6 shadow-soft">
                    <h3 className="font-display text-lg font-semibold">{b.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{b.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="container-x my-24">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-secondary/10 px-6 py-14 text-center shadow-soft sm:px-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-[100px]" />
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{a.ctaHeading || `See ${p.title} in action`}</h2>
            {a.ctaText && <p className="mx-auto mt-4 max-w-xl text-muted">{a.ctaText}</p>}
            <a href={a.ctaButtonHref || "/#contact"} className="btn btn-primary mt-8 !px-7 !py-3.5">
              {a.ctaButtonLabel || "Book a Free Demo"}
              <span aria-hidden>→</span>
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
