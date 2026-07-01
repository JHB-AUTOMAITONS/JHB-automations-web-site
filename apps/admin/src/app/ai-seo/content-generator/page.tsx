"use client";

import AiTool from "@/components/ai/AiTool";
import { buildPrompt, aiGenerateContent } from "../actions";

export default function ContentGeneratorPage() {
  return (
    <AiTool
      title="AI Content Generator"
      description="Generate on-brand, SEO-aware content blocks. Build the prompt, run it in claude.ai, paste the HTML back, then copy it into the relevant editor."
      responseFormat="text"
      fields={[
        {
          name: "kind",
          label: "Content type",
          type: "select",
          options: ["hero", "section", "service", "product", "cta", "benefits", "features", "process", "testimonials"].map((k) => ({ value: k, label: k[0].toUpperCase() + k.slice(1) })),
          defaultValue: "section",
        },
        { name: "keyword", label: "Primary keyword (optional)", placeholder: "e.g. AI automation Salem" },
        { name: "brief", label: "Brief", type: "textarea", required: true, placeholder: "What should this content say? Audience, goal, key points…" },
      ]}
      buildPrompt={(v) => buildPrompt("content", v)}
      run={(v) => aiGenerateContent({ kind: v.kind, keyword: v.keyword, brief: v.brief })}
    />
  );
}
