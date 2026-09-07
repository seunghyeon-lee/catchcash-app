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

type AdminSessionRpcRow = {
  id: string | null;
  role: string | null;
  status: string | null;
  name: string | null;
  email: string | null;
};

// active↔active 페이지 이동 시 매번 getUser round-trip으로 로딩이 깜빡이지 않도록
// 확정 결과(authorized/forbidden)만 짧게 캐시한다. 전체 새로고침 시 모듈이 초기화되어 재확인한다.
const CACHE_TTL_MS = 20_000;

let cache: { result: AdminSessionResult; expiresAt: number } | null = null;

export function clearAdminSessionCache() {
  cache = null;
}

function firstAdminSessionRow(data: AdminSessionRpcRow[] | AdminSessionRpcRow | null): AdminSessionRpcRow | null {
  if (!data) return null;
  if (Array.isArray(data)) return data[0] ?? null;
  return data;
}

/**
 * 현재 브라우저 세션이 active 관리자(admin_users row 존재 + status=active + 허용 role)인지 판정한다.
 *
 * `get_current_admin_session` RPC가 SECURITY DEFINER로 active 관리자 여부를 판정하므로,
 * 브라우저에서 admin_users를 직접 select하지 않는다. 세션이 없을 때 임의 관리자 정보를 만들지 않는다.
 */
export async function loadAdminSession(): Promise<AdminSessionResult> {
  const client = getSupabaseBrowserClientOrNull();
  if (!client) return { state: "no-env" };

  try {
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) return { state: "unauthenticated" };

    const { data, error } = await client.rpc("get_current_admin_session");

    if (error) return { state: "error" };
    const admin = firstAdminSessionRow(data as AdminSessionRpcRow[] | AdminSessionRpcRow | null);
    if (!admin) return { state: "forbidden" };
    if (!admin.id) return { state: "forbidden" };
    if (admin.status !== "active") return { state: "forbidden" };
    if (!ALLOWED_ADMIN_ROLES.includes(admin.role as AdminRole)) return { state: "forbidden" };

    return {
      state: "authorized",
      adminUserId: admin.id as string,
      role: admin.role as AdminRole,
      name: admin.name ?? "",
      email: admin.email ?? "",
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
