import ContentCleanup from "@/components/ContentCleanup";

export const dynamic = "force-dynamic";

export default function MaintenancePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Content Cleanup</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Remove pasted-from-Microsoft-Word / Google-Docs / Outlook formatting artifacts (XML
        namespaces, <code>mso-</code> styles, conditional comments, hidden Office metadata) from all
        stored content in one pass. Real formatting — headings, bold/italic, lists, tables, links and
        images — is preserved. This fixes both the admin previews and the live website, because it
        cleans the content at the source.
      </p>
      <p className="mt-2 max-w-2xl text-xs text-muted">
        Recommended: click <strong>Preview (dry-run)</strong> first to see exactly what would change,
        then <strong>Clean content now</strong> to apply.
      </p>
      <div className="mt-6">
        <ContentCleanup />
      </div>
    </div>
  );
}
