"use client";

import AiTool from "@/components/ai/AiTool";
import { aiAnalyze } from "../actions";

export default function AnalyzerPage() {
  return (
    <AiTool
      title="SEO Analyzer"
      description="Score a live URL (or paste content) across technical, meta, heading, image, schema and content-depth checks, then get prioritized fixes from Claude."
      submitLabel="🔬 Analyze"
      fields={[
        { name: "url", label: "Page URL", placeholder: "https://your-site.com/page/ (recommended)" },
        { name: "title", label: "Title (if no URL)", placeholder: "Meta / page title" },
        { name: "contentHtml", label: "Content HTML (if no URL)", type: "textarea", placeholder: "Paste the page/article HTML…" },
      ]}
      run={(v) =>
        aiAnalyze({
          url: v.url || undefined,
          title: v.title || undefined,
          contentHtml: v.contentHtml || undefined,
          withRecommendations: true,
        })
      }
    />
  );
}
