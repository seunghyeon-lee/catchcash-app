import { loadAdminSession } from "./admin-session";
import { getSupabaseBrowserClient } from "@/lib/supabase";

/**
 * 관리자 CMS 서비스가 공통으로 사용하는 Supabase 관리자 컨텍스트.
 * - 브라우저 Supabase client
 * - RLS와 동일한 기준으로 확인한 active admin의 admin_users.id
 */
export type AdminContext = {
  client: ReturnType<typeof getSupabaseBrowserClient>;
  adminUserId: string;
};

export type AdminDataSource = "supabase" | "mock";

/**
 * 관리자 등록/수정(쓰기) 결과 공통 형태.
 * - source "mock": 세션/관리자 컨텍스트가 없어 실제 DB 쓰기를 하지 않고 안내만 한 경우.
 * - source "supabase" + ok true: 실제 DB 반영 성공(id 반환).
 * - source "supabase" + ok false: 시도했으나 RLS/검증 등으로 실패(message에 사유).
 */
export type AdminWriteResult = {
  source: AdminDataSource;
  ok: boolean;
  id?: string;
  message?: string;
};

/**
 * 현재 Supabase 세션이 active admin인지 확인한 뒤 관리자 컨텍스트를 반환한다.
 *
 * `get_current_admin_session` RPC는 admin_users 테이블을 Data API에 직접 노출하지 않고도
 * active admin 여부와 허용 role을 확인한다. env가 없거나, 세션이 없거나, admin이
 * 아니거나, 조회 중 에러가 발생하면 null을 반환하며 이 경우 각 서비스는 mock fallback을 사용한다.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const session = await loadAdminSession();
  if (session.status !== "authorized") return null;

  return { client: session.client, adminUserId: session.adminUserId };
}
