import { getAllClientLogos } from "@jhb/shared/client-logos-server";
import ClientLogoManager from "@/components/ClientLogoManager";

export default async function AdminClientLogos() {
  const items = await getAllClientLogos();
  return <ClientLogoManager initial={items} />;
}
