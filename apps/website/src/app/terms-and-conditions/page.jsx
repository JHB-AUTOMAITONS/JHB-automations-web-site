import { notFound } from "next/navigation";
import { getLegal } from "@jhb/shared/content-server";
import LegalPageView, { buildLegalMeta } from "@/components/LegalPageView";

export async function generateMetadata() {
  const { terms } = await getLegal();
  return buildLegalMeta(terms, "/terms-and-conditions");
}

export default async function TermsAndConditionsPage() {
  const { terms } = await getLegal();
  if (!terms.enabled) notFound();
  return (
    <>
      {terms.structuredData.trim() && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: terms.structuredData }} />
      )}
      <LegalPageView doc={terms} />
    </>
  );
}
