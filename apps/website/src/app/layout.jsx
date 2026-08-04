import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { getSettings, getLegal, getAuthorPublisherDoc } from "@jhb/shared/content-server";
import { getServiceLinks } from "@jhb/shared/services-server";
import { getPublishedProducts } from "@jhb/shared/products-server";
import { productHref } from "@jhb/shared/products";

// ISR: every route under this layout is regenerated at most once per 30s, so
// admin edits go live within ~30s without a rebuild. Lower for fresher content
// (e.g. 10), or set 0 to render fully dynamically on every request.
export const revalidate = 30;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export async function generateMetadata() {
  // Favicon: an admin-set Branding → Favicon (should be a SQUARE image) overrides
  // the bundled static brand-mark; when it's empty we fall back to the crisp
  // /public files. A new upload has a fresh URL so browsers refetch it, and saving
  // Branding purges the site cache (revalidateWebsite), so a changed tab icon
  // appears without a rebuild — just a hard refresh to beat the browser's own
  // aggressive favicon cache.
  const settings = await getSettings();
  const fav = (settings.branding?.favicon || "").trim();
  const adminFavicon = /^https?:\/\//i.test(fav) || fav.startsWith("/");
  const icons = adminFavicon
    ? { icon: fav, shortcut: fav, apple: fav }
    : {
        icon: [
          { url: "/favicon.ico?v=2", sizes: "any" },
          { url: "/favicon-32x32.png?v=2", type: "image/png", sizes: "32x32" },
          { url: "/favicon-16x16.png?v=2", type: "image/png", sizes: "16x16" },
        ],
        apple: "/apple-touch-icon.png?v=2",
        shortcut: "/favicon.ico?v=2",
      };
  return {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "JHB Automations — Intelligent AI Automation for Business Growth",
  description:
    "We build AI-powered systems, automate workflows, develop high-performance websites, and create digital growth strategies that help businesses scale faster.",
  keywords: [
    "AI Automation",
    "AI Chatbot Development",
    "Website Development",
    "CRM Automation",
    "WhatsApp Automation",
    "Digital Marketing",
    "SEO",
    "Business Growth",
  ],
  applicationName: "JHB Automations",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: "JHB Automations",
    locale: "en_IN",
    title: "JHB Automations — Intelligent AI Automation",
    description:
      "Transform your business with intelligent AI automation, web development and data-driven growth.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "JHB Automations — Intelligent AI Automation",
    description:
      "Transform your business with intelligent AI automation, web development and data-driven growth.",
    images: ["/og.png"],
  },
  // Admin favicon override → static /public brand-mark fallback (computed above).
  icons,
  manifest: "/site.webmanifest",
  verification: {
    google: "VEX8_7EyGMoR-RqJ5_QiWfETA0rFUJRpvZLPuTtl2fQ",
  },
  };
}

export default async function RootLayout({
  children,
}) {
  const [settings, serviceLinks, products, legal, authorPublisher] = await Promise.all([
    getSettings(),
    getServiceLinks(),
    getPublishedProducts(),
    getLegal(),
    getAuthorPublisherDoc(),
  ]);
  const pub = authorPublisher.global.publisher;
  const productLinks = products.map((p) => ({
    label: p.title,
    href: productHref(p),
    icon: "spark",
  }));
  // Fixed routes; the slug field only feeds each page's canonical URL.
  const legalLinks = [
    legal.privacy.enabled ? { label: legal.privacy.title, href: "/privacy-policy" } : null,
    legal.terms.enabled ? { label: legal.terms.title, href: "/terms-and-conditions" } : null,
  ].filter(Boolean);

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const sameAs = [settings.instagram, settings.facebook, settings.linkedin].filter(
    (u) => u && u !== "#"
  );

  // Publisher (Organization) — global Author & Publisher SEO settings enrich the
  // sitewide Organization node (E-E-A-T) with sensible fallbacks to site settings.
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": pub.orgType || "Organization",
    name: pub.name || settings.companyName || "JHB Automations",
    url: pub.website || site,
    logo: pub.logo || (/^https?:\/\//.test(settings.branding?.headerLogo || "") ? settings.branding.headerLogo : `${site}/logo.png`),
    description: pub.description || settings.tagline,
    email: settings.email,
    telephone: settings.phone,
    sameAs,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.companyName || "JHB Automations",
    url: site,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        {/* Web fonts offered by the admin Rich Text Editor font-family dropdown,
            loaded so published content renders the same face the editor previews.
            Keep in sync with apps/admin/src/components/editorFonts.ts (web: true).
            Loaded NON-render-blocking: media="print" doesn't match screen so the
            browser fetches it without blocking paint, then the inline script below
            flips it to "all" once loaded (React strips literal onload="" attributes
            on host elements, so the swap has to happen via a real script tag rather
            than an inline handler). A previous blocking version of this link was a
            confirmed contributor to this site's poor Core Web Vitals (SEO audit,
            2026-08). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          id="editor-google-fonts"
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&family=Oswald:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Roboto+Slab:wght@400;700&family=Ubuntu:wght@400;500;700&display=swap"
          media="print"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(l){if(!l)return;if(l.sheet){l.media='all';return}l.onload=function(){l.media='all'}})(document.getElementById('editor-google-fonts'));",
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lato:wght@400;700&family=Merriweather:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;600;700&family=Oswald:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Roboto+Slab:wght@400;700&family=Ubuntu:wght@400;500;700&display=swap"
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <SiteChrome settings={settings} serviceLinks={serviceLinks} productLinks={productLinks} legalLinks={legalLinks}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
