import { getServices } from "@jhb/shared/services-server";
import { getAllServiceAnchorLinks } from "@jhb/shared/service-links-server";
import { getPublishedPosts } from "@jhb/shared/posts-server";
import LinkManager from "@/components/LinkManager";

export default async function AdminLinks() {
  const [services, links, posts] = await Promise.all([
    getServices(),
    getAllServiceAnchorLinks(),
    getPublishedPosts(),
  ]);

  const serviceList = services.map((s) => ({ key: s.key, title: s.title }));

  const internalPages = [
    { label: "Home", url: "/" },
    { label: "About", url: "/about" },
    { label: "Contact", url: "/contact" },
    { label: "Blog", url: "/blog" },
    { label: "All Services", url: "/services" },
    ...services.map((s) => ({ label: `Service · ${s.title}`, url: `/services/${s.slug}` })),
    ...posts.map((p) => ({ label: `Blog · ${p.title}`, url: `/blog/${p.slug}` })),
  ];

  const linksByService: Record<
    string,
    {
      anchor_text: string;
      url: string;
      new_tab: boolean;
      link_type: "dofollow" | "nofollow";
      sponsored: boolean;
      ugc: boolean;
    }[]
  > = {};
  for (const s of serviceList) linksByService[s.key] = [];
  for (const l of links) {
    (linksByService[l.service_key] ??= []).push({
      anchor_text: l.anchor_text,
      url: l.url,
      new_tab: l.new_tab,
      link_type: l.link_type,
      sponsored: l.sponsored,
      ugc: l.ugc,
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        Link Management
      </h1>
      <p className="mt-1 text-sm text-muted">
        Add hyperlinks to words/phrases in a service page&apos;s content. Matching
        text is auto-linked on the live site (first occurrence per phrase).
      </p>
      <LinkManager
        services={serviceList}
        internalPages={internalPages}
        linksByService={linksByService}
      />
    </div>
  );
}
