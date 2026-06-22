import { createBrowserClient } from "@supabase/ssr";

// Tolerate accidental "Value: " / "Key: " label prefixes or surrounding
// whitespace/quotes pasted into the env vars (a common dashboard copy-paste
// mistake) so a stray label doesn't produce a Supabase "Invalid API key".
export const cleanEnv = (v?: string) =>
  (v ?? "")
    .trim()
    .replace(/^(?:value|key)\s*:\s*/i, "")
    .replace(/^["']|["']$/g, "")
    .trim();

export function createClient() {
  return createBrowserClient(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
