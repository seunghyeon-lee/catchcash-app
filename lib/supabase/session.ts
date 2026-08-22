import { getSupabaseBrowserClientOrNull } from "./client";

export type BrowserAuthSession = {
  userId: string;
  client: NonNullable<ReturnType<typeof getSupabaseBrowserClientOrNull>>;
};

/**
 * 브라우저 Supabase client 기준으로 현재 인증 세션을 조회한다.
 * env가 없거나, 세션이 없거나, 조회 중 에러가 발생하면 null을 반환한다.
 * 세션이 없을 때 임의 user_id를 만들지 않는다.
 */
export async function getBrowserAuthSession(): Promise<BrowserAuthSession | null> {
  try {
    const client = getSupabaseBrowserClientOrNull();
    if (!client) return null;

    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;

    return { client, userId: data.user.id };
  } catch {
    return null;
  }
}

export async function getCurrentUserId() {
  const session = await getBrowserAuthSession();
  return session?.userId ?? null;
}
