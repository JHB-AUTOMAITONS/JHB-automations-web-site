"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import ParticleBackground from "./ParticleBackground";
import CursorGlow from "./CursorGlow";
import ScrollProgress from "./ScrollProgress";
import Navbar from "./Navbar";
import Footer from "./Footer";
import OfficeLocation from "./OfficeLocation";
import PageViewTracker from "./PageViewTracker";
import type { SiteSettings } from "@jhb/shared/content";
import type { ServiceLink } from "@jhb/shared/services-server";

export default function SiteChrome({
  children,
  settings,
  serviceLinks,
}: {
  children: ReactNode;
  settings: SiteSettings;
  serviceLinks: ServiceLink[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <PageViewTracker />
      <ParticleBackground />
      <CursorGlow />
      <ScrollProgress />
      <Navbar serviceLinks={serviceLinks} />
      {children}
      <OfficeLocation settings={settings} />
      <Footer settings={settings} serviceLinks={serviceLinks} />
    </>
  );
}
