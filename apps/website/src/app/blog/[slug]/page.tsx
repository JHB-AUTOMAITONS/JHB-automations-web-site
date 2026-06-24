import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/BlogArticle";
import {
  getPostBySlug,
  getRelatedPosts,
  getPublishedSlugs,
} from "@jhb/shared/posts-server";
import { getMediaAltMap, getMediaTitleMap } from "@jhb/shared/media-server";
import { altFor } from "@jhb/shared/media";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateStaticParams() {
  // Pre-render currently-published posts for fast first loads; newly published
  // posts render on demand (dynamicParams below), no rebuild needed.
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article Not Found — JHB Automations" };
  const title = post.meta_title || `${post.title} — JHB Automations`;
  const description = post.meta_description || post.excerpt || undefined;
  const canonical = `/blog/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      siteName: "JHB Automations",
      url: canonical,
      title,
      description,
      type: "article",
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, post.category, 3);
  const [altMap, titleMap] = await Promise.all([getMediaAltMap(), getMediaTitleMap()]);
  const url = `${SITE}/blog/${post.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.meta_description || undefined,
    image: post.cover_image || undefined,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "JHB Automations",
    },
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at,
    mainEntityOfPage: url,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogArticle
        post={post}
        related={related}
        coverAlt={post.cover_image ? altFor(post.cover_image, altMap, post.title) : undefined}
        coverTitle={post.cover_image ? altFor(post.cover_image, titleMap, "") || undefined : undefined}
        shareUrl={url}
      />
    </>
  );
}
