import { getSettings } from "@jhb/shared/content-server";
import SettingsEditor from "@/components/SettingsEditor";
import AuthorPublisherEditor from "@/components/AuthorPublisherEditor";

export default async function AdminSettings() {
  const settings = await getSettings();
  return (
    <>
      <SettingsEditor initial={settings} />
      <div className="mt-10 border-t border-ink/10 pt-8">
        <h2 className="mb-1 font-display text-xl font-bold">Author &amp; Publisher — Global SEO defaults</h2>
        <p className="mb-4 text-sm text-muted">
          Used in Schema.org structured data (E-E-A-T) across the whole site. Every page uses these unless it overrides them in its own SEO editor. Not shown on the website.
        </p>
        <AuthorPublisherEditor mode="global" />
      </div>
    </>
  );
}
