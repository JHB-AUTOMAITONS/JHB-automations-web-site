import type { Metadata } from "next";
import { getStats, getSettings, getSeo } from "@jhb/shared/content-server";
import { getServices } from "@jhb/shared/services-server";
import { getPublishedHome } from "@jhb/shared/home-server";
import { getActiveTestimonials } from "@jhb/shared/testimonials-server";
import { getMediaAltMap } from "@jhb/shared/media-server";
import { getActiveHomeFaqs } from "@jhb/shared/home-faqs-server";
import { getActiveClientLogos } from "@jhb/shared/client-logos-server";
import { getPartners } from "@jhb/shared/partners-server";
import BlogPreview from "@/components/BlogPreview";
import HomePreviewClient from "./HomePreviewClient";

// Admin-only live preview surface — never index it.
export const metadata: Metadata = {
  title: "Home preview — JHB Automations admin",
  robots: { index: false, follow: false },
};

// Always render fresh so the editor sees the current published ancillary content
// (partners, stats, testimonials, FAQs, logos, blog). The editable sections are
// streamed in live over postMessage from the admin Home editor.
export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  const [home, stats, settings, services, testimonialItems, altMap, homeFaqs, clientLogos, partners, seo] =
    await Promise.all([
      getPublishedHome(),
      getStats(),
      getSettings(),
      getServices(),
      getActiveTestimonials(),
      getMediaAltMap(),
      getActiveHomeFaqs(),
      getActiveClientLogos(),
      getPartners(),
      getSeo("/"),
    ]);

  // Plain service info (icon + slug + canonical copy) that the client merges the
  // draft's per-card overrides onto — mirrors apps/website/src/app/page.tsx.
  const serviceList = services.map((s) => ({
    slug: s.slug,
    title: s.title,
    short: s.short,
    icon: s.icon,
  }));

  return (
    <HomePreviewClient
      initialHome={home}
      stats={stats}
      settings={settings}
      services={serviceList}
      testimonials={testimonialItems}
      faqs={homeFaqs}
      clientLogos={clientLogos}
      partners={partners}
      altMap={altMap}
      seoContent={seo?.seo_content ?? null}
      blogPreview={<BlogPreview />}
    />
  );
}
