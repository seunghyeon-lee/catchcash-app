import { getAuthenticatedUserSession } from "@/lib/profile/auth-session";

export type ClaimDataSource = "supabase" | "mock";

export type CreateHuntClaimResult = {
  ok: boolean;
  source: ClaimDataSource;
  errorMessage?: string;
};

/**
 * `/ar-hunt` 상자 열기 결과로 `treasure_claims` row 생성을 시도한다.
 * 세션이 없거나 대상 보물이 없으면 DB에 쓰지 않고 기존 mock 성공 흐름을 유지한다.
 * 위치/기간/수량 검증은 아직 서버 RPC가 없어 이 단계에서는 하지 않는다.
 */
export async function createHuntClaim(treasureBoxId: string | null): Promise<CreateHuntClaimResult> {
  const session = await getAuthenticatedUserSession();

  if (!session || !treasureBoxId) {
    return { ok: true, source: "mock" };
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
