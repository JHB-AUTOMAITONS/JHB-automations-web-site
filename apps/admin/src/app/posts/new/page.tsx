import { getAllPostsAdmin } from "@jhb/shared/posts-server";
import PostEditor from "@/components/PostEditor";

export default async function NewPost() {
  const posts = await getAllPostsAdmin();
  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter(Boolean) as string[])
  );
  return <PostEditor post={null} categories={categories} />;
}
