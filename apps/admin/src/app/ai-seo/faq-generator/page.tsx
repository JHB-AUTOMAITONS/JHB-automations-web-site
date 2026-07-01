"use client";

import AiTool from "@/components/ai/AiTool";
import { buildPrompt, aiGenerateFaqs } from "../actions";

export default function FaqGeneratorPage() {
  return (
    <AiTool
      title="FAQ Generator"
      description="Generate People-Also-Ask-style FAQs. Build the prompt, run it in claude.ai, paste the reply back, then add them to a Blog post, Service page or Product FAQ section."
      responseFormat="json"
      fields={[
        { name: "topic", label: "Topic / focus", required: true, placeholder: "e.g. CRM automation for loan businesses" },
        { name: "count", label: "How many", type: "select", defaultValue: "6", options: [4, 6, 8, 10].map((n) => ({ value: String(n), label: `${n} FAQs` })) },
        { name: "contentHtml", label: "Base on content (optional)", type: "textarea", placeholder: "Paste content to ground the FAQs…" },
      ]}
      buildPrompt={(v) => buildPrompt("faqs", v)}
      run={(v) => aiGenerateFaqs({ topic: v.topic, count: Number(v.count) || 6, contentHtml: v.contentHtml || undefined })}
    />
  );
}
