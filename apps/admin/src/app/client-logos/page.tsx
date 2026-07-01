import { getAllClientLogos } from "@jhb/shared/client-logos-server";
import ClientLogoManager from "@/components/ClientLogoManager";

export default async function AdminClientLogos() {
  const items = await getAllClientLogos();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">
        Trusted Partnerships — Client Logos
      </h1>
      <p className="mt-1 text-sm text-muted">
        Logo-only management for the &ldquo;Our Valuable Clients&rdquo; section. Add,
        replace, delete, and reorder logos, set alt text, and toggle visibility. No
        names or text — just logos. Changes go live instantly.
      </p>
      <ClientLogoManager initial={items} />
    </div>
  );
}
