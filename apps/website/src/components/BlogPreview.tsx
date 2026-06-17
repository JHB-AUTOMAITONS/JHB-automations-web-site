import Link from "next/link";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import PostCard from "./PostCard";
import { getPublishedPosts } from "@jhb/shared/posts-server";

export default async function BlogPreview() {
  const posts = await getPublishedPosts(3);
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="relative py-16 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Insights"
          title={
            <>
              Latest From the <span className="grad-text">Blog</span>
            </>
          }
          desc="Practical tips on AI automation, marketing and growing your business."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 0.06}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/blog" className="btn btn-primary">
            View All Blogs <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
