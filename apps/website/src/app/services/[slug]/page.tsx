import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serviceDetails } from "@jhb/shared/data";
import { getServiceBySlug, getServices } from "@jhb/shared/services-server";
import { getServiceFaqs } from "@jhb/shared/faqs-server";
import { getServiceSectionsRaw } from "@jhb/shared/service-page-server";
import { defaultSections, mergeSections } from "@jhb/shared/service-page";
import ServicePageView from "@/components/ServicePageView";

// Pre-render the default slugs; changed slugs render on-demand (dynamicParams).
export function generateStaticParams() {
  return serviceDetails.map((s) => ({ slug: s.slug }));
}
export const dynamicParams = true;

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

  const [services, faqRows, publishedSections] = await Promise.all([
    getServices(),
    getServiceFaqs(data.key),
    getServiceSectionsRaw(data.key, "published"),
  ]);
  const related = services
    .filter((s) => s.key !== data.key)
    .slice(0, 4)
    .map((s) => ({ title: s.title, slug: s.slug, icon: s.icon }));
  const faqs = faqRows.map((f) => ({ question: f.question, answer: f.answer }));

  // Merge published (DB) section edits over the defaults derived from code content
  const sections = mergeSections(
    defaultSections({
      title: data.title,
      tagline: data.tagline,
      intro: data.intro,
      features: data.features,
      benefits: data.benefits,
    }),
    publishedSections
  );

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
      <ServicePageView
        title={data.title}
        icon={data.icon}
        stats={data.stats}
        sections={sections}
        related={related}
        faqs={faqs}
      />
    </>
  );
}
