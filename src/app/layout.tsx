import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { getSettings } from "@/lib/content.server";
import { getServiceLinks } from "@/lib/services.server";

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
  openGraph: {
    title: "JHB Automations — Intelligent AI Automation",
    description:
      "Transform your business with intelligent AI automation, web development and data-driven growth.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, serviceLinks] = await Promise.all([
    getSettings(),
    getServiceLinks(),
  ]);
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        <SiteChrome settings={settings} serviceLinks={serviceLinks}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
