import type { MetadataRoute } from "next";
import { getServices } from "@jhb/shared/services-server";
import { getPublishedSlugs } from "@jhb/shared/posts-server";
import { getPublishedProducts } from "@jhb/shared/products-server";
import { productHref } from "@jhb/shared/products";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = ["", "/services", "/about", "/contact", "/blog"].map(
    (p) => ({
      url: `${BASE}${p}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: p === "" ? 1 : 0.8,
    })
  );

  // Use the effective public slugs from the DB so renamed services appear with
  // their current URL (not the hardcoded original slug).
  const services = (await getServices()).map((s) => ({
    url: `${BASE}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const postSlugs = await getPublishedSlugs();
  const posts = postSlugs.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // JHB Products — include each product's internal destination (e.g. the tools
  // hub, or its /products/{slug} detail page).
  const products = (await getPublishedProducts())
    .map((p) => productHref(p))
    .filter((h) => h.startsWith("/"))
    .map((h) => ({
      url: `${BASE}${h}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticRoutes, ...services, ...products, ...posts];
}
