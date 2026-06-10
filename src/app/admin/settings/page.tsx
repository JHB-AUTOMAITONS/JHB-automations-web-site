import { getSettings } from "@/lib/content.server";
import SettingsEditor from "@/components/admin/SettingsEditor";

export default async function AdminSettings() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        Website Settings
      </h1>
      <p className="mt-1 text-sm text-muted">
        Company info, contact details and social links — used across the site.
      </p>
      <SettingsEditor initial={settings} />
    </div>
  );
}
