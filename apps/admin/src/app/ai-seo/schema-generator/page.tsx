"use client";

import AiTool from "@/components/ai/AiTool";
import { buildPrompt, aiGenerateSchema } from "../actions";

export default function SchemaGeneratorPage() {
  return (
    <AiTool
      title="Schema Generator"
      description="Generate valid Schema.org JSON-LD for any type. Build the prompt, run it in claude.ai, paste the JSON-LD back, then copy it into the page's Structured Data field."
      responseFormat="text"
      fields={[
        {
          name: "type",
          label: "Schema type",
          type: "select",
          defaultValue: "Article",
          options: ["Article", "BlogPosting", "Product", "Service", "FAQPage", "Organization", "LocalBusiness", "BreadcrumbList", "HowTo", "Review"].map((t) => ({ value: t, label: t })),
        },
        { name: "url", label: "Page URL (optional)", placeholder: "https://your-site.com/page/" },
        { name: "details", label: "Details", type: "textarea", required: true, placeholder: "Describe the entity: name, fields, values to encode…" },
      ]}
      buildPrompt={(v) => buildPrompt("schema", v)}
      run={(v) => aiGenerateSchema({ type: v.type, details: v.details, url: v.url || undefined })}
    />
  );
}
