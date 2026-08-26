import { getAuthenticatedUserSession } from "@/lib/profile/auth-session";

export type ClaimDataSource = "supabase" | "mock";

export type CreateHuntClaimResult = {
  ok: boolean;
  source: ClaimDataSource;
  /**
   * 같은 보물상자에서 이미 성공 claim을 받은 경우 true.
   * 결과 화면(already_claimed) 처리와 UI 매핑은 6차 작업에서 이 값을 소비한다.
   */
  alreadyClaimed?: boolean;
  errorMessage?: string;
};

/**
 * `/ar-hunt` 상자 열기 결과로 `treasure_claims` row 생성을 시도한다.
 * 세션이 없거나 대상 보물이 없으면 DB에 쓰지 않고 기존 mock 성공 흐름을 유지한다.
 * 위치/기간/수량 검증은 아직 서버 RPC가 없어 이 단계에서는 하지 않는다.
 *
 * 중복 획득 방어(2차 "준비"): insert 전에 같은 사용자+상자의 success claim이
 * 이미 있는지 조회해 중복 insert를 막는다. 이 클라이언트 측 선조회는 best-effort이며
 * 동시 요청(race)까지는 막지 못한다. 확실한 1인 1회 보장은 DB unique 제약 또는
 * 서버 RPC가 필요하다(마이그레이션/서버 = 리더 영역, 후속 이슈).
 */
export async function createHuntClaim(treasureBoxId: string | null): Promise<CreateHuntClaimResult> {
  const session = await getAuthenticatedUserSession();

  if (!session || !treasureBoxId) {
    return { ok: true, source: "mock" };
  }

  // 이미 성공 claim이 있으면 다시 insert하지 않는다.
  // 선조회 자체가 실패하면 사용자 흐름을 막지 않도록 그대로 insert를 시도한다(기존 동작 유지).
  const { data: existingClaim } = await session.client
    .from("treasure_claims")
    .select("id")
    .eq("user_id", session.userId)
    .eq("treasure_box_id", treasureBoxId)
    .eq("result", "success")
    .limit(1)
    .maybeSingle();

  if (existingClaim) {
    return { ok: true, source: "supabase", alreadyClaimed: true };
  }

  const { error } = await session.client.from("treasure_claims").insert({
    user_id: session.userId,
    treasure_box_id: treasureBoxId,
    result: "success",
  });

  if (error) {
    return {
      ok: false,
      source: "supabase",
      errorMessage: "사냥 결과를 저장하지 못했어. 잠시 후 다시 시도해줘.",
    };
  }

  return { ok: true, source: "supabase" };
}
