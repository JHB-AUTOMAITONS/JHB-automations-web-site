import { getHero, getStats } from "@jhb/shared/content-server";
import ContentEditor from "@/components/ContentEditor";

export default async function AdminContent() {
  const [hero, stats] = await Promise.all([getHero(), getStats()]);
  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Content</h1>
      <p className="mt-1 text-sm text-muted">
        Edit the text shown on your homepage. Changes go live instantly.
      </p>
      <ContentEditor hero={hero} stats={stats} />
    </div>
  );
}
