import { notFound } from "next/navigation";
import { getServicePage, getInternalPages } from "@jhb/shared/service-pages-server";
import ServicePageEditor from "@/components/ServicePageEditor";

export default async function ServicePageEditorPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const [page, internalPages] = await Promise.all([
    getServicePage(key),
    getInternalPages(),
  ]);
  if (!page) notFound();
  return <ServicePageEditor page={page} internalPages={internalPages} />;
}
