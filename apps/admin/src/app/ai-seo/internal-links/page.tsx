import ToolScaffold from "@/components/ai/ToolScaffold";

export default function InternalLinksPage() {
  return (
    <ToolScaffold
      title="Internal Link Suggestions"
      summary="Build a site-wide internal linking map: which pages should link to which, with suggested anchor text."
      willDo={[
        "Index all published pages, services, products and posts",
        "Use Claude + semantic matching to suggest contextual internal links",
        "Flag orphan pages and over-linked pages",
      ]}
      dependsOn="A content index built from the CMS + repo. Per-page internal links are already produced by ‘Generate SEO with AI’ and the SEO Analyzer."
      related={[
        { href: "/ai-seo/analyzer", label: "SEO Analyzer" },
        { href: "/ai-seo/blog-writer", label: "Blog Writer" },
      ]}
    />
  );
}
