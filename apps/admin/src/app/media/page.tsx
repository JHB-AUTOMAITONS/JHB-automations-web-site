import { getMediaLibrary, getImageSeoSettings } from "@jhb/shared/media-server";
import MediaManager from "@/components/MediaManager";

export default async function AdminMedia() {
  const [items, settings] = await Promise.all([
    getMediaLibrary(),
    getImageSeoSettings(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Media Management</h1>
      <p className="mt-1 text-sm text-muted">
        Upload images and manage all image SEO in one place — alt text, title,
        caption, description, keywords &amp; Open Graph. Click any image to edit its
        SEO in the side drawer. Search, bulk-edit, and export an SEO report.
      </p>
      <MediaManager items={items} requireAlt={settings.requireAlt} />
    </div>
  );
}
