import { getSupabaseBrowserClient } from "@/lib/supabase";

export type AuthenticatedUserSession = {
  userId: string;
  client: ReturnType<typeof getSupabaseBrowserClient>;
};

/**
 * TODO(auth): 로그인 플로우가 완성되면 이 함수가 반환하는 auth.users.id를
 * 프로필/문의 전 화면의 공통 세션 상태로 교체한다. 세션이 없을 때는 임의 UUID를
 * 만들거나 DB에 쓰지 않고 화면별 mock fallback을 사용한다.
 */
export async function getAuthenticatedUserSession(): Promise<AuthenticatedUserSession | null> {
  try {
    const client = getSupabaseBrowserClient();
    const { data, error } = await client.auth.getUser();

    if (error || !data.user) return null;

    return { client, userId: data.user.id };
  } catch {
    // Public Supabase 환경 변수가 없는 로컬 UI 작업도 기존 mock 화면이 유지되어야 한다.
    return null;
  }
}
