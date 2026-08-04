import Reveal from "@/components/Reveal";
import Stats from "@/components/Stats";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getAbout } from "@jhb/shared/about-server";
import { getStats } from "@jhb/shared/content-server";
import { AboutView } from "@jhb/shared/about-view";

export async function generateMetadata() {
  const about = await getAbout();
  return {
    title: about.metaTitle,
    description: about.metaDescription,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  // All copy is managed in Admin → About Page (jhb_content "about"); falls back
  // to the built-in defaults until an admin saves. The page body is the shared
  // <AboutView>, which the admin editor's live preview renders too — so the
  // preview always matches this page. The website injects its animated Reveal,
  // Stats and Breadcrumbs; the admin preview renders them statically.
  // Fetch the CMS-editable stats too, so the About page's Stats section reflects
  // admin edits (previously it rendered <Stats /> with no items → always the
  // hardcoded defaults, diverging from the home page).
  const [about, stats] = await Promise.all([getAbout(), getStats()]);

  return (
    <AboutView
      about={about}
      Reveal={Reveal}
      breadcrumbs={
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "About", href: "/about" },
          ]}
        />
      }
      stats={<Stats items={stats.items} />}
    />
  );
}
