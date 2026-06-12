import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import PostCard from "@/components/PostCard";
import { getPublishedPosts } from "@jhb/shared/posts-server";
import { buildMetadata } from "@jhb/shared/content-server";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/blog", {
    title: "Blog — JHB Automations",
    description:
      "Insights on AI automation, digital marketing, SEO and business growth from the JHB Automations team.",
  });
}

export default async function BlogIndex() {
  const posts = await getPublishedPosts();

  return (
    <main className="relative pt-32">
      <div className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:60px_60px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <section className="container-x pb-28">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
          <Link href="/#home" className="transition-colors hover:text-ink">
            Home
          </Link>
          <span>/</span>
          <span className="text-primary">Blog</span>
        </nav>

        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="eyebrow">Insights</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              From the <span className="grad-text">Blog</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-4 text-lg text-muted">
              Practical insights on AI automation, digital marketing and business
              growth.
            </p>
          </Reveal>
        </div>

        {posts.length === 0 ? (
          <div className="mx-auto mt-14 max-w-md rounded-2xl border border-ink/10 bg-surface p-10 text-center text-muted shadow-soft">
            No articles published yet. Check back soon!
          </div>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
