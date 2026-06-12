// Service Content (rich text) — client-safe types.
export type ServiceContent = { title: string; html: string };
export type ServiceContentVersion = {
  id: string;
  title: string;
  content_html: string;
  created_at: string;
};
