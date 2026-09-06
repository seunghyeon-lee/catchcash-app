import { getSupabaseBrowserClientOrNull } from "@/lib/supabase";
import type { AdminRole } from "@/lib/admin/mock-admin-accounts";

/**
 * `/admin/**` 공통 접근 가드가 사용하는 관리자 세션 판정 결과.
 *
 * - `no-env`: Supabase public env가 없어 세션 자체를 확인할 수 없음(안전 측: 접근 차단).
 * - `unauthenticated`: 로그인 세션 없음 → `/admin/login` 이동 대상.
 * - `forbidden`: 로그인은 되었으나 active 관리자가 아님(admin_users 없음/ inactive/ role 불일치)
 *   → `/admin/access-denied` 이동 대상.
 * - `error`: 조회 중 일시 오류. 접근을 확정할 수 없으므로 재로그인 흐름으로 보낸다.
 * - `authorized`: active 관리자 확인 완료. 실제 role/name을 함께 반환한다.
 */
export type AdminSessionResult =
  | { state: "no-env" }
  | { state: "unauthenticated" }
  | { state: "forbidden" }
  | { state: "error" }
  | { state: "authorized"; adminUserId: string; role: AdminRole; name: string; email: string };

const ALLOWED_ADMIN_ROLES: readonly AdminRole[] = ["super_admin", "operator", "viewer"];

// active↔active 페이지 이동 시 매번 getUser round-trip으로 로딩이 깜빡이지 않도록
// 확정 결과(authorized/forbidden)만 짧게 캐시한다. 전체 새로고침 시 모듈이 초기화되어 재확인한다.
const CACHE_TTL_MS = 20_000;

let cache: { result: AdminSessionResult; expiresAt: number } | null = null;

export function clearAdminSessionCache() {
  cache = null;
}

/**
 * 현재 브라우저 세션이 active 관리자(admin_users row 존재 + status=active + 허용 role)인지 판정한다.
 *
 * admin_users RLS(select)는 `has_admin_role`(active 관리자)만 통과하므로,
 * inactive 관리자·일반 사용자·비관리자는 select 결과가 비어 `forbidden`으로 판정된다.
 * 세션이 없을 때 임의 관리자 정보를 만들지 않는다.
 */
export async function loadAdminSession(): Promise<AdminSessionResult> {
  const client = getSupabaseBrowserClientOrNull();
  if (!client) return { state: "no-env" };

  try {
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) return { state: "unauthenticated" };

    const { data, error } = await client
      .from("admin_users")
      .select("id, role, status, name, email")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (error) return { state: "error" };
    if (!data) return { state: "forbidden" };
    if (data.status !== "active") return { state: "forbidden" };
    if (!ALLOWED_ADMIN_ROLES.includes(data.role as AdminRole)) return { state: "forbidden" };

    return {
      state: "authorized",
      adminUserId: data.id as string,
      role: data.role as AdminRole,
      name: (data.name as string | null) ?? "",
      email: (data.email as string | null) ?? "",
    };
  } catch {
    return { state: "error" };
  }
}

/**
 * 캐시를 우선 사용하는 세션 판정. 가드에서 사용한다.
 * `force`가 true면 캐시를 무시하고 다시 조회한다.
 */
export async function resolveAdminSession(options?: { force?: boolean }): Promise<AdminSessionResult> {
  const now = Date.now();
  if (!options?.force && cache && cache.expiresAt > now) {
    return cache.result;
  }

  const result = await loadAdminSession();

  // 확정 결과만 캐시한다. 미인증/일시 오류/ env 없음은 매번 다시 확인한다.
  if (result.state === "authorized" || result.state === "forbidden") {
    cache = { result, expiresAt: now + CACHE_TTL_MS };
  } else {
    cache = null;
  }

  return result;
}
