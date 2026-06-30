"use client";

import AiTool from "@/components/ai/AiTool";
import { aiKeywordResearch, aiKeywordImport } from "../actions";

export default function KeywordResearchPage() {
  return (
    <AiTool
      title="Keyword Research"
      description="Two ways to get keyword data: (1) paste rows you copied from Ubersuggest to use YOUR real numbers, or (2) enter a seed keyword for live data (if a provider is connected) / Claude estimates. The import wins when filled."
      submitLabel="🔑 Research"
      fields={[
        {
          name: "paste",
          label: "Paste from Ubersuggest (recommended)",
          type: "textarea",
          placeholder:
            "Copy rows from Ubersuggest → Keyword Ideas (or the Summary) and paste here, e.g.\nKeyword, Volume, CPC, SD\ndigital marketing in salem, 50, 1.2, 27",
          help: "Tab- or comma-separated. With or without a header row. Uses your real Ubersuggest data — no API needed.",
        },
        { name: "seed", label: "…or seed keyword", placeholder: "e.g. digital marketing salem" },
        { name: "country", label: "Country (ISO)", defaultValue: "IN", placeholder: "IN" },
      ]}
      run={(v) =>
        v.paste?.trim()
          ? aiKeywordImport({ paste: v.paste, seed: v.seed, country: v.country })
          : aiKeywordResearch({ seed: v.seed, country: v.country })
      }
    />
  );
}
