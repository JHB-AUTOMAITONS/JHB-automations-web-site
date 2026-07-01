"use client";

import AiTool from "@/components/ai/AiTool";
import { buildPrompt, aiGenerateContent } from "../actions";

export default function ServiceWriterPage() {
  return (
    <AiTool
      title="Service Page Writer"
      description="Generate conversion-focused service-page copy as clean HTML. Build the prompt, run it in claude.ai, paste the HTML back, then copy into the Service Page editor."
      responseFormat="text"
      fields={[
        { name: "keyword", label: "Primary keyword", placeholder: "e.g. WhatsApp automation Salem" },
        { name: "brief", label: "Service brief", type: "textarea", required: true, placeholder: "Service name, who it's for, the problem it solves, key features, pricing angle, desired CTA…" },
      ]}
      buildPrompt={(v) => buildPrompt("service", v)}
      run={(v) => aiGenerateContent({ kind: "service", keyword: v.keyword, brief: v.brief })}
    />
  );
}
