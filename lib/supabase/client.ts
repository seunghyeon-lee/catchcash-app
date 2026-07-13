import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key");
  }
  return client;
}
