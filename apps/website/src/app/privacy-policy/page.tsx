import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegal } from "@jhb/shared/content-server";
import LegalPageView, { buildLegalMeta } from "@/components/LegalPageView";

export async function generateMetadata(): Promise<Metadata> {
  const { privacy } = await getLegal();
  return buildLegalMeta(privacy, "/privacy-policy");
}

export default async function PrivacyPolicyPage() {
  const { privacy } = await getLegal();
  if (!privacy.enabled) notFound();
  return (
    <>
      {privacy.structuredData.trim() && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: privacy.structuredData }} />
      )}
      <LegalPageView doc={privacy} />
    </>
  );
}
