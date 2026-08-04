import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getProductBySlug, getPublishedProducts } from "@jhb/shared/products-server";
import { getSettings } from "@jhb/shared/content-server";
import { stripHeadingTags, ALIGN_TEXT, richTextAlign } from "@jhb/shared/containers";
import { Heading } from "@jhb/shared/heading";
import { sanitizeRichText } from "@jhb/shared/rich-text";
import { RichInline } from "@jhb/shared/rich-inline";
import Reveal from "@/components/Reveal";
import FaqAccordion from "@/components/FaqAccordion";
import PageContainers from "@/components/PageContainers";
import SmartLink from "@/components/SmartLink";

// Pre-render products that have a real detail page (no external href).
export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products
    .filter((p) => !p.href || !p.href.trim())
    .map((p) => ({ slug: p.slug }));
}
// New products added in the admin render on demand (no rebuild needed).
export const dynamicParams = true;

// Plain-text version of rich HTML, for meta/schema descriptions.
const stripHtml = (s) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Product Not Found — JHB Automations" };
  const canonical = p.canonical?.trim() || `/products/${p.slug}`;
  const ogImages = p.ogImage?.trim() ? [p.ogImage.trim()] : p.image ? [p.image] : undefined;
  return {
    title: p.metaTitle || `${p.title} — JHB Automations`,
    description: p.metaDescription || stripHtml(p.description),
    alternates: { canonical },
    openGraph: {
      siteName: "JHB Automations",
      type: "website",
      url: canonical,
      title: p.ogTitle || p.metaTitle || p.title,
      description: p.ogDescription || p.metaDescription || stripHtml(p.description),
      ...(ogImages ? { images: ogImages } : {}),
    },
  };
}

export default async function ProductPage({
  params,
}) {
  const { slug } = await params;
  const [p, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!p || p.status !== "published") notFound();
  // Products that link to an existing page/URL just redirect there.
  if (p.href && p.href.trim()) redirect(p.href.trim());

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.metaDescription || stripHtml(p.description),
    url: `${site}/products/${p.slug}`,
    ...(p.image ? { image: p.image } : {}),
    brand: { "@type": "Brand", name: "JHB Automations" },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site },
      { "@type": "ListItem", position: 2, name: p.title, item: `${site}/products/${p.slug}` },
    ],
  };
  // No page-level FAQPage schema here — <FaqAccordion> below (same
  // p.faqs.length > 0 condition) already emits it; both used to fire at once.

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="relative pt-24">
        <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

        <PageContainers containers={p.containers ?? []} zone="top" />

        {/* ---- Hero ---- */}
        <section className="container-x">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ink">Home</Link>
            <span>/</span>
            <span className="text-primary">JHB Products</span>
            <span>/</span>
            <span className="text-ink">{p.title}</span>
          </nav>

          <div className="mt-8 flex flex-col items-center gap-10">
            <div className="hero-content">
              <Reveal>
                <span className="eyebrow">JHB Product</span>
              </Reveal>
              <Reveal delay={0.06}>
                <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
                  {p.title}
                  {p.highlight && <> <span className="grad-text">{p.highlight}</span></>}
                </h1>
              </Reveal>
              {p.description && (
                <Reveal delay={0.12}>
                  <div
                    className="hero-desc prose-jhb text-lg text-muted [&_a]:font-medium [&_a]:text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(p.description) }}
                  />
                </Reveal>
              )}
              <Reveal delay={0.18}>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link href="/#contact" className="btn btn-primary !px-7 !py-3.5">
                    Book a Free Demo
                    <span aria-hidden>→</span>
                  </Link>
                  <Link href={`/products/${p.slug}/about`} className="btn btn-ghost !px-7 !py-3.5">
                    About {p.title}
                  </Link>
                </div>
              </Reveal>
            </div>

            {p.image && (
              <Reveal delay={0.1}>
                <div className="glass-strong relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-3xl shadow-glow">
                  <Image src={p.image} alt={p.imageAlt || p.title} fill priority sizes="(max-width: 1024px) 100vw, 672px" className="object-cover" />
                </div>
              </Reveal>
            )}
          </div>
        </section>

        <PageContainers containers={p.containers ?? []} zone="after-hero" />

        {/* ---- Overview ---- */}
        {p.overview && (
          <section className="container-x mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <span className="eyebrow">Overview</span>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  What is <span className="grad-text">{p.title}</span>?
                </h2>
              </Reveal>
              <Reveal delay={0.14}>
                <div
                  className="prose-jhb mt-5 text-lg leading-relaxed text-muted [&_a]:font-medium [&_a]:text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(p.overview) }}
                />
              </Reveal>
            </div>
          </section>
        )}

        <PageContainers containers={p.containers ?? []} zone="after-overview" />

        {/* ---- Feature sections (Features, Loan Types, Staff, GPS, Reports…) ---- */}
        {p.sections.map((sec) => (
          <section key={sec.title} className="container-x mt-16">
            <div className="mx-auto max-w-2xl text-center">
              <Reveal>
                <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  <span className="grad-text">{sec.title}</span>
                </h2>
              </Reveal>
              {sec.subtitle && (
                <Reveal delay={0.08}>
                  <p className="mt-3 text-muted">{sec.subtitle}</p>
                </Reveal>
              )}
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sec.items.map((it, i) => (
                <Reveal key={it.title} delay={(i % 3) * 0.06}>
                  <div className="glass glow-border flex h-full items-start gap-4 rounded-2xl p-6">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      {(() => {
                        const s = sanitizeRichText(it.title);
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
                        dangerouslySetInnerHTML={{ __html: sanitizeRichText(it.desc) }}
                      />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        ))}

        <PageContainers containers={p.containers ?? []} zone="after-sections" />

        {/* ---- Pricing ---- */}
        {p.pricing.length > 0 && (
          <section id="pricing" className="container-x mt-16 scroll-mt-28">
            <div className="mx-auto max-w-2xl text-center">
              <Reveal>
                <span className="eyebrow">Pricing</span>
              </Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Simple, <span className="grad-text">transparent pricing</span>
                </h2>
              </Reveal>
            </div>
            <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
              {p.pricing.map((plan, i) => (
                <Reveal key={plan.name} delay={(i % 3) * 0.06}>
                  <div className={`flex h-full flex-col rounded-3xl border p-7 shadow-soft ${plan.highlighted ? "border-primary bg-gradient-to-br from-primary/10 to-secondary/10 shadow-glow" : "border-ink/10 bg-surface"}`}>
                    {plan.highlighted && (
                      <span className="mb-3 w-fit rounded-full bg-gradient-to-r from-primary to-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                    <p className="mt-3">
                      <span className="font-display text-3xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-sm text-muted">{plan.period}</span>}
                    </p>
                    <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                      {plan.features.filter((f) => f && f.replace(/<[^>]*>/g, "").trim()).map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2.5 text-ink/90">
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-[10px] text-white">✓</span>
                          <RichInline html={f} />
                        </li>
                      ))}
                    </ul>
                    <SmartLink href={plan.ctaHref || "/#contact"} className={`mt-6 ${plan.highlighted ? "btn btn-primary" : "btn btn-ghost"} w-full`}>
                      {plan.ctaLabel || "Get Started"}
                    </SmartLink>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <PageContainers containers={p.containers ?? []} zone="after-pricing" />

        {/* ---- FAQ ---- */}
        {p.faqs.length > 0 && (
          <div className="mt-16">
            <FaqAccordion items={p.faqs} showNumbers={settings.faqShowNumbers} />
          </div>
        )}

        <PageContainers containers={p.containers ?? []} zone="after-faq" />

        {/* ---- CTA ---- */}
        <section className="container-x my-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-surface to-secondary/10 px-6 py-10 text-center shadow-soft sm:px-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/20 blur-[100px]" />
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Ready to try <span className="grad-text">{p.title}</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Book a free demo and we&apos;ll show you how {p.title} fits your business.
            </p>
            <Link href="/#contact" className="btn btn-primary mt-8 !px-7 !py-3.5">
              Book a Free Demo
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <PageContainers containers={p.containers ?? []} zone="bottom" />
      </main>
    </>
  );
}
