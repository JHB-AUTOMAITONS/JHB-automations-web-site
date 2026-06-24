"use client";

import { useEffect, useState } from "react";
import type { HomeContent } from "@jhb/shared/home";
import type { StatsContent, SiteSettings } from "@jhb/shared/content";
import type { TestimonialRow } from "@jhb/shared/testimonials";
import type { HomeFaqItem } from "@jhb/shared/home-faqs";
import type { ClientLogo } from "@jhb/shared/client-logos";
import type { PartnersDoc } from "@jhb/shared/partners";
import { altFor } from "@jhb/shared/media";

import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import AboutSection from "@/components/AboutSection";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import FounderPerspective from "@/components/FounderPerspective";
import ClientLogos from "@/components/ClientLogos";
import Faq from "@/components/Faq";
import CtaSection from "@/components/CtaSection";
import Contact from "@/components/Contact";

type ServiceLite = { slug: string; title: string; short: string; icon: string };

/**
 * Draft-aware home preview. Renders the EXACT live home composition
 * (apps/website/src/app/page.tsx) but the editable blocks come from React state
 * that the admin editor streams in over postMessage — so changes appear live.
 *
 * Only the draft-managed sections (hero, about, services, founder, CTA) update
 * live; the instant-save sections (partners, stats, testimonials, FAQs, client
 * logos) and the blog strip render from server data, which the editor can
 * refresh by reloading the iframe.
 */
export default function HomePreviewClient({
  initialHome,
  stats,
  settings,
  services,
  testimonials,
  faqs,
  clientLogos,
  partners,
  altMap,
  seoContent,
  blogPreview,
}: {
  initialHome: HomeContent;
  stats: StatsContent;
  settings: SiteSettings;
  services: ServiceLite[];
  testimonials: TestimonialRow[];
  faqs: HomeFaqItem[];
  clientLogos: ClientLogo[];
  partners: PartnersDoc;
  altMap: Record<string, string>;
  seoContent: string | null;
  blogPreview: React.ReactNode;
}) {
  const [home, setHome] = useState<HomeContent>(initialHome);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; home?: HomeContent } | null;
      if (d && d.type === "jhb-preview:set" && d.home) setHome(d.home);
    };
    window.addEventListener("message", onMsg);
    // Tell the embedding editor we're mounted and ready for the draft. The
    // payload carries no secrets, so a wildcard target origin is fine.
    try {
      window.parent?.postMessage({ type: "jhb-preview:ready" }, "*");
    } catch {
      /* not embedded — standalone load */
    }
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Map the editable hero block onto the Hero component's props (mirrors page.tsx)
  const heroContent = {
    badge: home.hero.badge,
    title: home.hero.title,
    highlight: home.hero.highlight,
    subtitle: home.hero.subtitle,
    ctaPrimaryLabel: home.hero.buttonText,
    ctaPrimaryHref: home.hero.buttonHref,
    ctaSecondaryLabel: "Explore Services",
    ctaSecondaryHref: "#services",
  };

  // Apply per-card content overrides from the Home manager (mirrors page.tsx)
  const overrides = new Map(home.serviceCards.map((o) => [o.slug, o]));
  const serviceCards = services.map((s) => {
    const o = overrides.get(s.slug);
    return {
      title: o?.title || s.title,
      desc: o?.short || s.short,
      icon: s.icon,
      slug: s.slug,
    };
  });

  return (
    <main className="relative">
      <Hero
        content={heroContent}
        heroImage={home.hero.image}
        heroImageAlt={altFor(home.hero.image, altMap, "JHB Automations")}
        heroImageTitle={home.hero.imageTitle || undefined}
        marquee={partners.items.map((p) => p.name)}
      />
      {partners.enabled && <Partners heading={partners.heading} items={partners.items} />}
      <AboutSection about={home.about} imageAlt={altFor(home.about.image, altMap, home.about.title)} />
      <Services
        items={serviceCards}
        heading={home.servicesSection.title}
        subheading={home.servicesSection.subtitle}
      />
      <Stats items={stats.items} />
      <Testimonials items={testimonials} />
      <FounderPerspective founder={home.founder} />
      <ClientLogos items={clientLogos} />
      <Faq items={faqs} />
      {blogPreview}
      <CtaSection cta={home.cta} />
      {seoContent && (
        <section className="container-x py-12">
          <div
            className="prose-jhb mx-auto max-w-3xl text-muted [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: seoContent }}
          />
        </section>
      )}
      <Contact settings={settings} />
    </main>
  );
}
