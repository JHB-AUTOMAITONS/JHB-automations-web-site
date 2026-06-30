import { getServices } from "@jhb/shared/services-server";
import ServicesEditor from "@/components/ServicesEditor";

export default async function AdminServices() {
  const services = await getServices();
  const entries = services.map((s) => ({
    key: s.key,
    title: s.title,
    slug: s.slug,
    metaTitle: s.metaTitle,
    metaDescription: s.metaDescription,
    metaKeywords: s.metaKeywords,
  }));

  return <ServicesEditor entries={entries} />;
}
