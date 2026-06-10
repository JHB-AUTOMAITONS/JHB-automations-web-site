import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import Services from "@/components/Services";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import { getHero, getStats, getSettings, buildMetadata } from "@/lib/content.server";
import { getServices } from "@/lib/services.server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/", {
    title: "JHB Automations — Best Digital Marketing in Salem",
    description:
      "Grow your business online with AI automation, web development and data-driven digital marketing.",
  });
}

export default async function Home() {
  const [hero, stats, settings, services] = await Promise.all([
    getHero(),
    getStats(),
    getSettings(),
    getServices(),
  ]);

  const serviceCards = services.map((s) => ({
    title: s.title,
    desc: s.short,
    icon: s.icon,
    slug: s.slug,
  }));

  return (
    <main className="relative">
      <Hero content={hero} />
      <Partners />
      <Services items={serviceCards} />
      <Stats items={stats.items} />
      <Testimonials />
      <Process />
      <Contact settings={settings} />
    </main>
  );
}
