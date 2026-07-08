import Link from "next/link";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import PostCard from "./PostCard";
import { getPublishedPosts } from "@jhb/shared/posts-server";

export default async function BlogPreview({
  eyebrow = "Insights",
  headingLead = "Latest From the",
  headingHighlight = "Blog",
  description = "Practical tips on AI automation, marketing and growing your business.",
  viewAllText = "View All Blogs",
}: {
  eyebrow?: string;
  headingLead?: string;
  headingHighlight?: string;
  description?: string;
  viewAllText?: string;
} = {}) {
  const posts = await getPublishedPosts(3);
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="relative py-8 sm:py-10 lg:py-12">
      <div className="container-x">
        <SectionHeading
          eyebrow={eyebrow}
          title={
            <>
              {headingLead}{headingLead && headingHighlight ? " " : ""}
              {headingHighlight && <span className="grad-text">{headingHighlight}</span>}
            </>
          }
          desc={description}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={(i % 3) * 0.06}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/blog" className="btn btn-primary">
            {viewAllText} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
