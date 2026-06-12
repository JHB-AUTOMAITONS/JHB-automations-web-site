import { notFound } from "next/navigation";
import { getServices } from "@jhb/shared/services-server";
import { getServiceSectionsRaw } from "@jhb/shared/service-page-server";
import { getServiceFaqs } from "@jhb/shared/faqs-server";
import { defaultSections, mergeSections } from "@jhb/shared/service-page";
import ServicePageBuilder from "@/components/ServicePageBuilder";

export default async function ServiceBuilderPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const services = await getServices();
  const svc = services.find((s) => s.key === key);
  if (!svc) notFound();

  const [draftRaw, faqRows] = await Promise.all([
    getServiceSectionsRaw(key, "draft"),
    getServiceFaqs(key),
  ]);
  const sections = mergeSections(
    defaultSections({
      title: svc.title,
      tagline: svc.tagline,
      intro: svc.intro,
      features: svc.features,
      benefits: svc.benefits,
    }),
    draftRaw
  );

  return (
    <ServicePageBuilder
      serviceKey={key}
      title={svc.title}
      icon={svc.icon}
      stats={svc.stats}
      initialSlug={svc.slug}
      initialMetaTitle={svc.metaTitle}
      initialMetaDescription={svc.metaDescription}
      initialMetaKeywords={svc.metaKeywords}
      initialSections={sections}
      initialFaqs={faqRows.map((f) => ({ question: f.question, answer: f.answer }))}
    />
  );
}
