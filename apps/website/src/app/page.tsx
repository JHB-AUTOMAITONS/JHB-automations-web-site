import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import AboutSection from "@/components/AboutSection";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import FounderPerspective from "@/components/FounderPerspective";
import ClientLogos from "@/components/ClientLogos";
import Faq from "@/components/Faq";
import BlogPreview from "@/components/BlogPreview";
import CtaSection from "@/components/CtaSection";
import Contact from "@/components/Contact";
import { getStats, getSettings, buildMetadata, getSeo } from "@jhb/shared/content-server";
import { getServices } from "@jhb/shared/services-server";
import { getPublishedHome } from "@jhb/shared/home-server";
import { composeHeroHeading } from "@jhb/shared/home";
import PageContainers from "@/components/PageContainers";
import { getActiveTestimonials } from "@jhb/shared/testimonials-server";
import { getMediaAltMap } from "@jhb/shared/media-server";
import { altFor } from "@jhb/shared/media";
import { getActiveHomeFaqs } from "@jhb/shared/home-faqs-server";
import { getActiveClientLogos } from "@jhb/shared/client-logos-server";
import { getPartners } from "@jhb/shared/partners-server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/", {
    title: "JHB Automations — Best Digital Marketing in Salem",
    description:
      "Grow your business online with AI automation, web development and data-driven digital marketing.",
  });
}

export default async function Home() {
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

  // Map the editable hero block onto the Hero component's props
  const heroContent = {
    badge: home.hero.badge,
    title: composeHeroHeading(home.hero.title, home.hero.highlight),
    highlight: "",
    subtitle: home.hero.subtitle,
    ctaPrimaryLabel: home.hero.buttonText,
    ctaPrimaryHref: home.hero.buttonHref,
    ctaSecondaryLabel: home.hero.buttonSecondaryText,
    ctaSecondaryHref: home.hero.buttonSecondaryHref,
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
      {seo?.structured_data && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seo.structured_data }}
        />
      )}
      <PageContainers containers={home.containers} zone="top" />
      <Hero
        content={heroContent}
        heroImage={home.hero.image}
        heroImageAlt={altFor(home.hero.image, altMap, "JHB Automations")}
        heroImageTitle={home.hero.imageTitle || undefined}
        marquee={partners.items.map((p) => p.name)}
        marqueeLabel={home.hero.marqueeLabel}
      />
      <PageContainers containers={home.containers} zone="after-hero" />
      {partners.enabled && <Partners heading={partners.heading} items={partners.items} />}
      <PageContainers containers={home.containers} zone="after-partners" />
      <AboutSection about={home.about} imageAlt={altFor(home.about.image, altMap, home.about.title)} />
      <PageContainers containers={home.containers} zone="after-about" />
      <Services
        items={serviceCards}
        eyebrow={home.servicesSection.eyebrow}
        heading={home.servicesSection.title}
        subheading={home.servicesSection.subtitle}
        viewAllText={home.servicesSection.viewAllText}
        learnMoreText={home.servicesSection.learnMoreText}
      />
      <PageContainers containers={home.containers} zone="after-services" />
      <Stats
        items={stats.items}
        eyebrow={home.statsHeader.eyebrow}
        headingLead={home.statsHeader.headingLead}
        headingHighlight={home.statsHeader.headingHighlight}
      />
      <PageContainers containers={home.containers} zone="after-stats" />
      <Testimonials
        items={testimonialItems}
        eyebrow={home.testimonialsHeader.eyebrow}
        headingLead={home.testimonialsHeader.headingLead}
        headingHighlight={home.testimonialsHeader.headingHighlight}
        description={home.testimonialsHeader.description}
        ratingValue={home.testimonialsHeader.ratingValue}
        ratingText={home.testimonialsHeader.ratingText}
      />
      <PageContainers containers={home.containers} zone="after-testimonials" />
      <FounderPerspective founder={home.founder} />
      <PageContainers containers={home.containers} zone="after-founder" />
      <ClientLogos
        items={clientLogos}
        eyebrow={home.clientLogosHeader.eyebrow}
        headingLead={home.clientLogosHeader.headingLead}
        headingHighlight={home.clientLogosHeader.headingHighlight}
        description={home.clientLogosHeader.description}
      />
      <PageContainers containers={home.containers} zone="after-clients" />
      <Faq
        items={homeFaqs}
        eyebrow={home.faqHeader.eyebrow}
        headingLead={home.faqHeader.headingLead}
        headingHighlight={home.faqHeader.headingHighlight}
        description={home.faqHeader.description}
        linkText={home.faqHeader.linkText}
        linkHref={home.faqHeader.linkHref}
        showNumbers={settings.faqShowNumbers}
        image={home.faqHeader.image ?? null}
        imageAlt={home.faqHeader.imageAlt ?? ""}
        imageTitle={home.faqHeader.imageTitle ?? ""}
        imageCaption={home.faqHeader.imageCaption ?? ""}
        imageDescription={home.faqHeader.imageDescription ?? ""}
        imageSide={home.faqHeader.imageSide ?? "left"}
        imageSettings={home.faqHeader.imageSettings}
        showIllustration={home.faqHeader.showIllustration !== false}
      />
      <PageContainers containers={home.containers} zone="after-faq" />
      <BlogPreview
        eyebrow={home.blogHeader.eyebrow}
        headingLead={home.blogHeader.headingLead}
        headingHighlight={home.blogHeader.headingHighlight}
        description={home.blogHeader.description}
        viewAllText={home.blogHeader.viewAllText}
      />
      <PageContainers containers={home.containers} zone="after-blog" />
      <CtaSection cta={home.cta} />
      <PageContainers containers={home.containers} zone="after-cta" />
      {seo?.seo_content && (
        <section className="container-x py-10">
          <div
            className="prose-jhb mx-auto max-w-3xl text-muted [&_a]:text-primary [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: seo.seo_content }}
          />
        </section>
      )}
      <Contact
        settings={settings}
        eyebrow={home.contactHeader.eyebrow}
        headingLead={home.contactHeader.headingLead}
        headingHighlight={home.contactHeader.headingHighlight}
        description={home.contactHeader.description}
      />
      <PageContainers containers={home.containers} zone="bottom" />
    </main>
  );
}
