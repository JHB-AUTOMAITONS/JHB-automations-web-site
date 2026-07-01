import type { Metadata } from "next";
import { getToolsHub } from "@jhb/shared/tools-hub-server";
import { getMediaAltMap } from "@jhb/shared/media-server";
import { getSettings } from "@jhb/shared/content-server";
import { altFor } from "@jhb/shared/media";
import ToolsHubView from "@/components/ToolsHubView";

export async function generateMetadata(): Promise<Metadata> {
  const hub = await getToolsHub();
  const canonical = "/jhb-automation-tools";
  return {
    title: hub.seo.metaTitle,
    description: hub.seo.metaDescription,
    alternates: { canonical },
    openGraph: {
      siteName: "JHB Automations",
      type: "website",
      url: canonical,
      title: hub.seo.ogTitle || hub.seo.metaTitle,
      description: hub.seo.ogDescription || hub.seo.metaDescription,
    },
  };
}

export default async function JhbAutomationToolsPage() {
  const [hub, altMap, settings] = await Promise.all([getToolsHub(), getMediaAltMap(), getSettings()]);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const heroImageAlt = altFor(hub.hero.image, altMap, hub.hero.heading);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "JHB Automation Tools",
    itemListElement: hub.categories.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.title,
      description: c.desc,
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site },
      { "@type": "ListItem", position: 2, name: "JHB Automation Tools", item: `${site}/jhb-automation-tools` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* FAQPage schema is emitted by FaqAccordion inside ToolsHubView */}
      <ToolsHubView hub={hub} heroImageAlt={heroImageAlt} faqShowNumbers={settings.faqShowNumbers} />
    </>
  );
}
