import { getBrowserAuthSession, type BrowserAuthSession } from "@/lib/supabase";

export type AuthenticatedUserSession = BrowserAuthSession;

/**
 * 기존 문의/보관함 fallback 코드 호환용 래퍼.
 * 공통 세션 조회는 `lib/supabase/session.ts`의 `getBrowserAuthSession`을 사용한다.
 * 세션이 없을 때는 임의 UUID를 만들지 않고 null을 반환한다.
 */
export async function getAuthenticatedUserSession(): Promise<AuthenticatedUserSession | null> {
  return getBrowserAuthSession();
}
