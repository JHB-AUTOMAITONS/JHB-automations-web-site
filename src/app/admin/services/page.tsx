import { getServices } from "@/lib/services.server";
import ServicesEditor from "@/components/admin/ServicesEditor";

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

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        Services SEO &amp; Slugs
      </h1>
      <p className="mt-1 text-sm text-muted">
        Edit each service&apos;s URL slug, page title, meta description and
        keywords. Changing a slug changes the page&apos;s URL across the whole
        site (menu, footer, links).
      </p>
      <ServicesEditor entries={entries} />
    </div>
  );
}
