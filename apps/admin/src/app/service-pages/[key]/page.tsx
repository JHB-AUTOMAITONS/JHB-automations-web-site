import { notFound } from "next/navigation";
import { getServicePage, getInternalPages } from "@jhb/shared/service-pages-server";
import { getServices } from "@jhb/shared/services-server";
import ServicePageEditor from "@/components/ServicePageEditor";

export default async function ServicePageEditorPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const [page, internalPages, services] = await Promise.all([
    getServicePage(key),
    getInternalPages(),
    getServices(),
  ]);
  if (!page) notFound();
  // Drives the Related Services "Target service" dropdown, auto-titling and the
  // preview's key → URL resolution.
  const serviceSummaries = services.map((s) => ({ key: s.key, title: s.title, slug: s.slug, icon: s.icon }));
  return <ServicePageEditor page={page} internalPages={internalPages} services={serviceSummaries} />;
}
