import type { Metadata } from "next";
import type { Post, PostCard } from "@jhb/shared/posts";
import { getPublishedPosts, getPostBySlug, getRelatedPosts } from "@jhb/shared/posts-server";
import BlogPreviewClient from "./BlogPreviewClient";

export const metadata: Metadata = {
  title: "Blog preview — JHB Automations admin",
  robots: { index: false, follow: false },
};

// Always fresh; the post being edited is streamed in live over postMessage.
export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Fallback so the preview is never blank before the editor sends its first draft
// (e.g. a brand-new post, or a site with no published posts yet).
const PLACEHOLDER: Post = {
  id: "preview",
  slug: "your-post-slug",
  title: "Your blog post title",
  excerpt: "",
  content_html: "",
  cover_image: null,
  category: null,
  tags: [],
  author: "JHB Automations",
  status: "draft",
  meta_title: null,
  meta_description: null,
  published_at: null,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

export default async function BlogPreviewPage() {
  // Seed from the most recent published post when one exists, so Related
  // Articles and surrounding chrome look realistic.
  const latest = await getPublishedPosts(1);
  let seedPost: Post = PLACEHOLDER;
  let related: PostCard[] = [];

  if (latest[0]) {
    const [full, rel] = await Promise.all([
      getPostBySlug(latest[0].slug),
      getRelatedPosts(latest[0].slug, latest[0].category, 3),
    ]);
    if (full) seedPost = full;
    related = rel;
  }

  return <BlogPreviewClient seedPost={seedPost} related={related} siteUrl={SITE} />;
}
