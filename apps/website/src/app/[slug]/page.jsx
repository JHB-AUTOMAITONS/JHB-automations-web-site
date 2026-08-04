import { notFound } from "next/navigation";
import { getServiceBySlug, getServices } from "@jhb/shared/services-server";
import { getServiceFaqs } from "@jhb/shared/faqs-server";
import { getServiceAnchorLinks } from "@jhb/shared/service-links-server";
import { getPublishedServiceContent } from "@jhb/shared/service-pages-server";
import { getSettings } from "@jhb/shared/content-server";
import ServiceDetailView from "@/components/ServiceDetail";

// Pre-render every known service at its effective (DB) slug for fast first loads.
export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}
// New services added in the admin render on demand (no rebuild needed).
export const dynamicParams = true;

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;
  const data = await getServiceBySlug(slug);
  if (!data) return { title: "Service Not Found — JHB Automations" };
  const canonical = `/${data.slug}`;
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
}) {
  const { slug } = await params;
  const data = await getServiceBySlug(slug);
  if (!data) notFound();

  const [services, faqRows, linkRows, dbContent, settings] = await Promise.all([
    getServices(),
    getServiceFaqs(data.key),
    getServiceAnchorLinks(data.key),
    getPublishedServiceContent(data.key),
    getSettings(),
  ]);

  // Published editor content overrides the code defaults (per-field fallback).
  const db =
    dbContent && dbContent.status === "published"
      ? {
          heroHeading: dbContent.hero_heading || "",
          heroHighlight: dbContent.hero_highlight || "",
          heroTail: dbContent.hero_tail || "",
          heroDescriptionHtml: dbContent.hero_description || "",
          heroLink: dbContent.hero_link || "",
          features:
            dbContent.features && dbContent.features.length > 0 ? dbContent.features : [],
          whatsIncluded: dbContent.whats_included ?? null,
          whyChoose: dbContent.why_choose ?? [],
          cta: dbContent.cta ?? null,
          chrome: dbContent.chrome ?? null,
          containers: dbContent.containers ?? [],
          image: dbContent.image_url,
          imageAlt: dbContent.image_alt,
          imageTitle: dbContent.image_title,
        }
      : null;
  const related = services
    .filter((s) => s.key !== data.key)
    .slice(0, 4)
    .map((s) => ({ title: s.title, slug: s.slug, icon: s.icon }));
  // key → public URL, so the editable Related Services cards resolve their target.
  const relatedUrlByKey = Object.fromEntries(services.map((s) => [s.key, `/${s.slug}`]));
  // FAQ source of truth: the Service Page editor's published FAQs (the
  // `jhb_services.faq` column). Falls back to the legacy /faqs-screen table
  // (jhb_service_faqs) for pages whose FAQs were never edited in the page
  // editor, so nothing that is currently live disappears.
  const editorFaqs =
    dbContent && dbContent.status === "published"
      ? (dbContent.faq ?? []).filter((f) => (f.question || "").trim())
      : [];
  const faqs = (editorFaqs.length > 0 ? editorFaqs : faqRows).map((f) => ({
    question: f.question,
    answer: f.answer,
  }));
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
    url: `${site}/${data.slug}`,
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
        item: `${site}/${data.slug}`,
      },
    ],
  };
  // No page-level FAQPage schema here — <FaqAccordion> (rendered inside
  // ServiceDetailView below, same faqs.length > 0 condition) already emits it,
  // and previously both fired at once, giving each service page two
  // near-identical FAQPage script blocks.

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
      <ServiceDetailView data={data} related={related} relatedUrlByKey={relatedUrlByKey} faqs={faqs} links={links} db={db} faqShowNumbers={settings.faqShowNumbers} />
    </>
  );
}
