import ToolScaffold from "@/components/ai/ToolScaffold";

export default function CompetitorPage() {
  return (
    <ToolScaffold
      title="Competitor Analysis"
      summary="Compare your pages against ranking competitors and surface keyword & content gaps."
      willDo={[
        "Pull competitor keywords and rankings from the SEO connector",
        "Diff your content vs. top-ranking pages (content-gap analysis)",
        "Recommend keywords/topics to add and angles to win",
      ]}
      dependsOn="A live SEO connector with a competitor/SERP endpoint (e.g. DataForSEO/SE Ranking). Set SEO_CONNECTOR_BASE_URL."
      related={[
        { href: "/ai-seo/keyword-research", label: "Keyword Research" },
        { href: "/ai-seo/analyzer", label: "SEO Analyzer" },
      ]}
    />
  );
}
