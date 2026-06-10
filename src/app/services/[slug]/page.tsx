import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serviceDetails } from "@/lib/data";
import { getServiceBySlug, getServices } from "@/lib/services.server";
import ServiceDetailView from "@/components/ServiceDetail";

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
  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: data.metaKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    openGraph: {
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

  const related = (await getServices())
    .filter((s) => s.key !== data.key)
    .slice(0, 4)
    .map((s) => ({ title: s.title, slug: s.slug, icon: s.icon }));

  return <ServiceDetailView data={data} related={related} />;
}
