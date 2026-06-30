// Blog post types — client-safe (no server imports).

import type { PageContainer } from "./containers";

export type PostStatus = "draft" | "published";

// A single blog-post FAQ. Each post owns its own independent ordered list
// (jhb_posts.faqs) — there is no global/shared FAQ store. Array order is the
// display/sort order; `answer` is rich-text HTML.
export type BlogFaq = {
  id: string;
  question: string;
  answer: string;
  visible: boolean;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string | null;
  cover_image: string | null;
  category: string | null;
  tags: string[];
  author: string;
  status: PostStatus;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Total likes (jhb_posts.likes) — incremented by the public Like button.
  likes: number;
  // Page-builder containers rendered above/below the post body (jhb_posts.containers).
  containers: PageContainer[];
  // Blog-specific FAQ section (jhb_posts.faqs / jhb_posts.faqs_enabled).
  faqs: BlogFaq[];
  faqs_enabled: boolean;
};

export type PostCard = Pick<
  Post,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "cover_image"
  | "category"
  | "author"
  | "published_at"
  | "likes"
>;

// Estimate reading time in minutes from rich-text HTML (~200 words/min, min 1).
// Used for the "X min read" meta on the blog article hero.
export function readingTimeMinutes(html: string | null): number {
  const text = (html || "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
