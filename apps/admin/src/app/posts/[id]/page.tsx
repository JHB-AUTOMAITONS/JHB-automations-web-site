import { notFound } from "next/navigation";
import { getAllPostsAdmin, getPostByIdAdmin } from "@jhb/shared/posts-server";
import PostEditor from "@/components/PostEditor";

export default async function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, posts] = await Promise.all([
    getPostByIdAdmin(id),
    getAllPostsAdmin(),
  ]);
  if (!post) notFound();

  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean) as string[])
  );

  return <PostEditor post={post} categories={categories} />;
}
