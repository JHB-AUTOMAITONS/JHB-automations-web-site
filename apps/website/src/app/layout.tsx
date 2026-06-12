import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { getSettings } from "@jhb/shared/content-server";
import { getServiceLinks } from "@jhb/shared/services-server";

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

export const metadata: Metadata = {
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
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, serviceLinks] = await Promise.all([
    getSettings(),
    getServiceLinks(),
  ]);

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const sameAs = [settings.instagram, settings.facebook, settings.linkedin].filter(
    (u) => u && u !== "#"
  );

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.companyName || "JHB Automations",
    url: site,
    logo: `${site}/logo.png`,
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
        <SiteChrome settings={settings} serviceLinks={serviceLinks}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
