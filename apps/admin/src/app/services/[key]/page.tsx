import { notFound } from "next/navigation";
import { getServices } from "@jhb/shared/services-server";
import {
  getDraftServiceContent,
  getServiceContentVersions,
} from "@jhb/shared/service-content-server";
import ServiceEditor from "@/components/ServiceEditor";

export default async function EditService({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const services = await getServices();
  const svc = services.find((s) => s.key === key);
  if (!svc) notFound();

  const [content, versions] = await Promise.all([
    getDraftServiceContent(key),
    getServiceContentVersions(key),
  ]);

  return (
    <ServiceEditor
      serviceKey={key}
      title={svc.title}
      initialSlug={svc.slug}
      initialMetaTitle={svc.metaTitle}
      initialMetaDescription={svc.metaDescription}
      initialMetaKeywords={svc.metaKeywords}
      initialContentTitle={content.title}
      initialContentHtml={content.html}
      versions={versions}
    />
  );
}
