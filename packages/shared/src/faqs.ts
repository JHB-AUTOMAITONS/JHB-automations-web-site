// Service FAQ types — client-safe.

export type ServiceFaq = {
  id: string;
  service_key: string;
  question: string;
  answer: string;
  sort_order: number;
};

export type FaqItem = { question: string; answer: string };

// FAQ answers are stored as rich HTML. For JSON-LD (FAQPage) and plain-text
// contexts (search), strip tags and decode the few common entities so the
// structured data stays clean and valid.
export function faqPlainText(html: string): string {
  return (html || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}
