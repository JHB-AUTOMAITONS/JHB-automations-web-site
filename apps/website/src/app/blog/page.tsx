import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import PostCard from "@/components/PostCard";
import BlogHeroBanner from "@jhb/shared/blog-hero-view";
import { getPublishedPosts } from "@jhb/shared/posts-server";
import { buildMetadata, getSettings, getBlogHero } from "@jhb/shared/content-server";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/blog", {
    title: "Blog — JHB Automations",
    description:
      "Insights on AI automation, digital marketing, SEO and business growth from the JHB Automations team.",
  });
}

export default async function BlogIndex() {
  const [posts, settings, hero] = await Promise.all([
    getPublishedPosts(),
    getSettings(),
    getBlogHero(),
  ]);

  return (
    <main className="relative">
      {/* Full-width banner hero — fully CMS-managed (image, badge, heading,
          overlay, height, alignment, radius). Same component as the admin preview. */}
      <BlogHeroBanner hero={hero} />

      <section className="container-x pb-20 pt-12">
        {posts.length === 0 ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-ink/10 bg-surface p-10 text-center text-muted shadow-soft">
            {settings.blogSearchEmpty || "No articles published yet. Check back soon!"}
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={(i % 3) * 0.06}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
