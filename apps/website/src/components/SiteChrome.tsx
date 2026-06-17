"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import CursorGlow from "./CursorGlow";

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
}: {
  children: ReactNode;
  settings: SiteSettings;
  serviceLinks: ServiceLink[];
  productLinks?: DropItem[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <PageViewTracker />
      <AutomationBackground />
      <CursorGlow />
      <ScrollProgress />
      <Navbar serviceLinks={serviceLinks} productLinks={productLinks} branding={settings.branding} />
      {children}
      <OfficeLocation settings={settings} />
      <Footer settings={settings} serviceLinks={serviceLinks} />
    </>
  );
}
