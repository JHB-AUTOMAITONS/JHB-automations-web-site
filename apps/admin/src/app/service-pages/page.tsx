import { getServicePageSummaries } from "@jhb/shared/service-pages-server";
import ServicePagesList from "@/components/ServicePagesList";

export default async function AdminServicePages() {
  const items = await getServicePageSummaries();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Service Pages</h1>
      <p className="mt-1 text-sm text-muted">
        Full CMS editor for each service page — hero, rich content, features, CTA,
        FAQ, images &amp; SEO. Content is saved to the database (drafts &amp; publish);
        the live pages are wired separately.
      </p>
      <ServicePagesList items={items} />
    </div>
  );
}
