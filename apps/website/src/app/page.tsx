import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import AboutSection from "@/components/AboutSection";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Process from "@/components/Process";
import FounderPerspective from "@/components/FounderPerspective";
import ClientLogos from "@/components/ClientLogos";
import Faq from "@/components/Faq";
import CtaSection from "@/components/CtaSection";
import Contact from "@/components/Contact";
import { getStats, getSettings, buildMetadata } from "@jhb/shared/content-server";
import { getServices } from "@jhb/shared/services-server";
import { getPublishedHome } from "@jhb/shared/home-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/", {
    title: "JHB Automations — Best Digital Marketing in Salem",
    description:
      "Grow your business online with AI automation, web development and data-driven digital marketing.",
  });
}

export default async function Home() {
  const [home, stats, settings, services] = await Promise.all([
    getPublishedHome(),
    getStats(),
    getSettings(),
    getServices(),
  ]);

  // Map the editable hero block onto the Hero component's props
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

  // Apply per-card content overrides from the Home manager
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
      <Hero content={heroContent} heroImage={home.hero.image} />
      <Partners />
      <AboutSection about={home.about} />
      <Services
        items={serviceCards}
        heading={home.servicesSection.title}
        subheading={home.servicesSection.subtitle}
      />
      <Stats items={stats.items} />
      <Testimonials />
      <Process />
      <FounderPerspective />
      <ClientLogos />
      <Faq />
      <CtaSection cta={home.cta} />
      <Contact settings={settings} />
    </main>
  );
}
