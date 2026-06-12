import { createClient } from "./supabase/server";
import type { Post, PostCard } from "./posts";

const CARD_COLS =
  "id, slug, title, excerpt, cover_image, category, author, published_at";

export async function getPublishedPosts(limit?: number): Promise<PostCard[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("jhb_posts")
      .select(CARD_COLS)
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (limit) q = q.limit(limit);
    const { data } = await q;
    return (data as PostCard[]) ?? [];
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return (data as Post) ?? null;
  } catch {
    return null;
  }
}

export async function getRelatedPosts(
  slug: string,
  category: string | null,
  limit = 3
): Promise<PostCard[]> {
  try {
    const supabase = await createClient();
    const fetchPosts = async (cat: string | null) => {
      let q = supabase
        .from("jhb_posts")
        .select(CARD_COLS)
        .eq("status", "published")
        .neq("slug", slug)
        .order("published_at", { ascending: false })
        .limit(limit);
      if (cat) q = q.eq("category", cat);
      const { data } = await q;
      return (data as PostCard[]) ?? [];
    };

    // Prefer same-category posts; fall back to most recent if not enough.
    let related = category ? await fetchPosts(category) : [];
    if (related.length < limit) {
      const recent = await fetchPosts(null);
      const seen = new Set(related.map((p) => p.id));
      related = [...related, ...recent.filter((p) => !seen.has(p.id))].slice(
        0,
        limit
      );
    }
    return related;
  } catch {
    return [];
  }
}

export async function getPublishedSlugs(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jhb_posts")
      .select("slug")
      .eq("status", "published");
    return (data ?? []).map((r: { slug: string }) => r.slug);
  } catch {
    return [];
  }
}

/* ---- Admin (staff reads, includes drafts via RLS) ---- */

export async function getAllPostsAdmin(): Promise<Post[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jhb_posts")
    .select("*")
    .order("updated_at", { ascending: false });
  return (data as Post[]) ?? [];
}

export async function getPostByIdAdmin(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("jhb_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Post) ?? null;
}
