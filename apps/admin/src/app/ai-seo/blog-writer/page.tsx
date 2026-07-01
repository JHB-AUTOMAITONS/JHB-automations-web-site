"use client";

import AiTool from "@/components/ai/AiTool";
import { buildPrompt, aiGenerateBlog } from "../actions";

export default function BlogWriterPage() {
  return (
    <AiTool
      title="Blog Writer"
      description="Generate a complete SEO article — title, meta, H1/H2/H3, body HTML, FAQs, JSON-LD, CTA and internal links. Build the prompt, run it in claude.ai, paste the reply back, then create a new Blog post from it."
      responseFormat="json"
      fields={[
        { name: "topic", label: "Topic", required: true, type: "textarea", placeholder: "e.g. How AI automation cuts response time for service businesses" },
        { name: "primaryKeyword", label: "Primary keyword", required: true, placeholder: "e.g. AI automation for small business" },
        { name: "location", label: "Target location (optional)", placeholder: "e.g. Salem, Tamil Nadu" },
      ]}
      buildPrompt={(v) => buildPrompt("blog", v)}
      run={(v) => aiGenerateBlog({ topic: v.topic, primaryKeyword: v.primaryKeyword, location: v.location })}
    />
  );
}
