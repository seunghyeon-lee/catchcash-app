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
 * 현재 Supabase 세션이 active admin인지 확인한 뒤 관리자 컨텍스트를 반환한다.
 *
 * `current_admin_user_id` RPC는 admin_users 테이블을 Data API에 직접 노출하지 않고도
 * RLS와 동일한 관리자 식별자를 돌려준다. env가 없거나, 세션이 없거나, admin이
 * 아니거나, 조회 중 에러가 발생하면 null을 반환하며 이 경우 각 서비스는 mock
 * fallback을 사용한다. 세션이 없을 때 임의의 admin id를 만들지 않는다.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  try {
    const client = getSupabaseBrowserClient();

    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) return null;

    const { data: adminUserId, error: adminError } = await client.rpc("current_admin_user_id");
    if (adminError || !adminUserId) return null;

    return { client, adminUserId: adminUserId as string };
  } catch {
    return null;
  }
}
