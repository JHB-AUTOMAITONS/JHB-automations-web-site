import Link from "next/link";
import { getAllPostsAdmin } from "@jhb/shared/posts-server";
import { getBlogHeroDraft, getBlogArticleHeroDraft } from "@jhb/shared/content-server";
import PostsTable from "@/components/PostsTable";
import BlogHeroEditor from "@/components/BlogHeroEditor";
import BlogArticleHeroEditor from "@/components/BlogArticleHeroEditor";

export default async function AdminPosts() {
  const [posts, hero, articleHero] = await Promise.all([
    getAllPostsAdmin(),
    getBlogHeroDraft(),
    getBlogArticleHeroDraft(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Blog</h1>
          <p className="mt-1 text-sm text-muted">
            Create, edit and publish blog articles.
          </p>
        </div>
        <Link href="/posts/new" className="btn btn-primary !px-5 !py-2.5 !text-sm">
          + New Post
        </Link>
      </div>

      <PostsTable
        posts={posts.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          status: p.status,
          updated_at: p.updated_at,
          likes: p.likes ?? 0,
        }))}
      />

      <BlogHeroEditor initial={hero} />

      <BlogArticleHeroEditor initial={articleHero} />
    </div>
  );
}
