import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { getSettings } from "@jhb/shared/content-server";
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

export async function generateMetadata(): Promise<Metadata> {
  const favicon = (await getSettings()).branding?.favicon;
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
  ...(favicon ? { icons: { icon: favicon, shortcut: favicon, apple: favicon } } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, serviceLinks, products] = await Promise.all([
    getSettings(),
    getServiceLinks(),
    getPublishedProducts(),
  ]);
  const productLinks = products.map((p) => ({
    label: p.title,
    href: productHref(p),
    icon: "spark",
  }));

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const sameAs = [settings.instagram, settings.facebook, settings.linkedin].filter(
    (u) => u && u !== "#"
  );

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.companyName || "JHB Automations",
    url: site,
    logo: /^https?:\/\//.test(settings.branding?.headerLogo || "") ? settings.branding.headerLogo : `${site}/logo.png`,
    description: settings.tagline,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <SiteChrome settings={settings} serviceLinks={serviceLinks} productLinks={productLinks}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
