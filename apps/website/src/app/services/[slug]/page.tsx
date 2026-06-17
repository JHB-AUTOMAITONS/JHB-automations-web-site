import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serviceDetails } from "@jhb/shared/data";
import { getServiceBySlug, getServices } from "@jhb/shared/services-server";
import { getServiceFaqs } from "@jhb/shared/faqs-server";
import { getServiceAnchorLinks } from "@jhb/shared/service-links-server";
import { getPublishedServiceContent } from "@jhb/shared/service-pages-server";
import ServiceDetailView from "@/components/ServiceDetail";

// Pre-render the default slugs; changed slugs render on-demand (dynamicParams).
export function generateStaticParams() {
  return serviceDetails.map((s) => ({ slug: s.slug }));
}
export const dynamicParams = true;
// Render per-request (SSR): the published content fetcher uses the cookie-aware
// Supabase client, so the page must be dynamic. This guarantees admin edits to a
// service page appear immediately and removes the build-time prerender warning.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getServiceBySlug(slug);
  if (!data) return { title: "Service Not Found — JHB Automations" };
  const canonical = `/services/${data.slug}`;
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.metaKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    alternates: { canonical },
    openGraph: {
      siteName: "JHB Automations",
      type: "website",
      url: canonical,
      title: data.metaTitle,
      description: data.metaDescription,
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getServiceBySlug(slug);
  if (!data) notFound();

  const [services, faqRows, linkRows, dbContent] = await Promise.all([
    getServices(),
    getServiceFaqs(data.key),
    getServiceAnchorLinks(data.key),
    getPublishedServiceContent(data.key),
  ]);

  // Published editor content overrides the code defaults (per-field fallback).
  const db =
    dbContent && dbContent.status === "published"
      ? {
          heroHeading: dbContent.hero_heading || "",
          heroDescriptionHtml: dbContent.hero_description || "",
          heroLink: dbContent.hero_link || "",
          features:
            dbContent.features && dbContent.features.length > 0 ? dbContent.features : [],
          image: dbContent.image_url,
          imageAlt: dbContent.image_alt,
          imageTitle: dbContent.image_title,
        }
      : null;
  const related = services
    .filter((s) => s.key !== data.key)
    .slice(0, 4)
    .map((s) => ({ title: s.title, slug: s.slug, icon: s.icon }));
  const faqs = faqRows.map((f) => ({ question: f.question, answer: f.answer }));
  const links = linkRows.map((l) => ({
    anchor_text: l.anchor_text,
    url: l.url,
    new_tab: l.new_tab,
    link_type: l.link_type,
    sponsored: l.sponsored,
    ugc: l.ugc,
  }));

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: data.title,
    serviceType: data.title,
    description: data.metaDescription || data.intro,
    url: `${site}/services/${data.slug}`,
    areaServed: "Salem, Tamil Nadu, India",
    provider: {
      "@type": "Organization",
      name: "JHB Automations",
      url: site,
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site },
      { "@type": "ListItem", position: 2, name: "Services", item: `${site}/services` },
      {
        "@type": "ListItem",
        position: 3,
        name: data.title,
        item: `${site}/services/${data.slug}`,
      },
    ],
  };
  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <ServiceDetailView data={data} related={related} faqs={faqs} links={links} db={db} />
    </>
  );
}
