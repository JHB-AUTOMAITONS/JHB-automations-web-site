"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// Lazy-load the canvas background (client-only) so it never blocks first paint.
const AutomationBackground = dynamic(() => import("./AutomationBackground"), {
  ssr: false,
});
import ScrollProgress from "./ScrollProgress";
import Navbar from "./Navbar";
import Footer from "./Footer";
import OfficeLocation from "./OfficeLocation";
import PageViewTracker from "./PageViewTracker";
import type { SiteSettings } from "@jhb/shared/content";
import type { ServiceLink } from "@jhb/shared/services-server";

type DropItem = { label: string; href: string; icon: string };

export default function SiteChrome({
  children,
  settings,
  serviceLinks,
  productLinks = [],
  legalLinks = [],
}: {
  children: ReactNode;
  settings: SiteSettings;
  serviceLinks: ServiceLink[];
  productLinks?: DropItem[];
  legalLinks?: { label: string; href: string }[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  // Individual blog articles (/blog/[slug]) get a clean, static backdrop for a
  // distraction-free read: skip mounting the animated canvas entirely so there's
  // no RAF loop or CPU/GPU cost (better than hiding it with CSS). The blog
  // listing (/blog) and every other page keep the animated background.
  //
  // Segment count (not startsWith) because this site uses trailingSlash: true,
  // so usePathname() yields "/blog/" for the listing and "/blog/<slug>/" for an
  // article. An article is "blog" + at least one more non-empty segment.
  const segments = (pathname ?? "").split("/").filter(Boolean);
  const isBlogArticle = segments[0] === "blog" && segments.length >= 2;

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <PageViewTracker />
      {!isBlogArticle && <AutomationBackground />}
      <ScrollProgress />
      <Navbar serviceLinks={serviceLinks} productLinks={productLinks} branding={settings.branding} navItemsConfig={settings.navItems} />
      {children}
      <OfficeLocation settings={settings} />
      <Footer settings={settings} serviceLinks={serviceLinks} legalLinks={legalLinks} />
    </>
  );
}
