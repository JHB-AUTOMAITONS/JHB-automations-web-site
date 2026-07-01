"use client";

import AiTool from "@/components/ai/AiTool";
import { buildPrompt, aiGenerateImageSeo } from "../actions";

export default function ImageSeoPage() {
  return (
    <AiTool
      title="Image SEO"
      description="Generate alt text, title, caption, description and a file name from an image. Auto mode (with API key) reads the image URL directly; manual mode tells you to attach the image in claude.ai."
      responseFormat="json"
      fields={[
        { name: "imageUrl", label: "Image URL (needed for one-click auto mode)", placeholder: "https://…/image.webp", help: "In manual mode you can leave this blank and attach the image in claude.ai instead." },
        { name: "context", label: "Page context (optional)", placeholder: "Where is this image used? e.g. Blog hero for ‘AI automation’" },
      ]}
      buildPrompt={(v) => buildPrompt("image-seo", v)}
      run={(v) => aiGenerateImageSeo({ imageUrl: v.imageUrl, context: v.context })}
    />
  );
}
