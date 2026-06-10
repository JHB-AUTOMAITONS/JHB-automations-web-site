"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import ParticleBackground from "./ParticleBackground";
import CursorGlow from "./CursorGlow";
import ScrollProgress from "./ScrollProgress";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PageViewTracker from "./PageViewTracker";
import type { SiteSettings } from "@/lib/content";
import type { ServiceLink } from "@/lib/services.server";

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
      <Footer settings={settings} serviceLinks={serviceLinks} />
    </>
  );
}
