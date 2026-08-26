import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

let client: SupabaseClient | undefined;

/**
 * 브라우저/클라이언트 컴포넌트에서 사용하는 Supabase public env를 조회한다.
 * env가 없으면 null을 반환하여 화면에서 mock fallback을 사용할 수 있게 한다.
 */
export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) return null;

  return { url, anonKey };
}

export function hasSupabasePublicEnv() {
  return getSupabasePublicEnv() !== null;
}

export function getSupabaseBrowserClientOrNull() {
  const env = getSupabasePublicEnv();
  if (!env) return null;

  if (!client) {
    client = createClient(env.url, env.anonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        persistSession: true,
      },
    });
  }

  return client;
}

/**
 * 기존 문의/관리자 fallback 코드 호환용.
 * env가 없으면 throw 하므로, 화면/서비스에서는 `getSupabaseBrowserClientOrNull` 또는 try/catch를 사용한다.
 */
export function getSupabaseBrowserClient() {
  const browserClient = getSupabaseBrowserClientOrNull();

  if (!browserClient) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return browserClient;
}
