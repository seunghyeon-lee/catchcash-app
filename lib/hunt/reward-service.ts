import { getAuthenticatedUserSession } from "@/lib/profile/auth-session";
import { getHuntResultByQuery } from "@/lib/hunt/selectors";

export type RewardDataSource = "supabase" | "mock";

type MockHuntResult = ReturnType<typeof getHuntResultByQuery>;

export type GetHuntResultDataResult = MockHuntResult & {
  source: RewardDataSource;
  errorMessage?: string;
};

type GiftProductRow = { brand_name: string; product_name: string };

/**
 * `/hunt-result` 결과 데이터 조회.
 * 실패 결과와 세션 없는 경우는 항상 기존 mock 흐름을 유지한다.
 * 성공 결과는 내 최근 성공 claim의 treasure_box_id로 활성 treasure_rewards +
 * gift_products를 조회해 보상 이름/브랜드만 실 데이터로 덮어쓴다.
 */
export async function getHuntResultData(resultQuery?: string): Promise<GetHuntResultDataResult> {
  const mock = getHuntResultByQuery(resultQuery);
  const session = await getAuthenticatedUserSession();

  if (!session || resultQuery === "fail") {
    return { ...mock, source: "mock" };
  }

  const { data: claim, error: claimError } = await session.client
    .from("treasure_claims")
    .select("treasure_box_id")
    .eq("user_id", session.userId)
    .eq("result", "success")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (claimError) {
    return { ...mock, source: "mock", errorMessage: "보상 정보를 불러오지 못했어. 잠시 후 다시 확인해줘." };
  }
  if (!claim) {
    return { ...mock, source: "mock" };
  }

  const { data: reward, error: rewardError } = await session.client
    .from("treasure_rewards")
    .select("reward_type, gift_products(brand_name, product_name)")
    .eq("treasure_box_id", claim.treasure_box_id)
    .eq("status", "active")
    .maybeSingle();

  if (rewardError) {
    return { ...mock, source: "mock", errorMessage: "보상 정보를 불러오지 못했어. 잠시 후 다시 확인해줘." };
  }

  const giftProduct: GiftProductRow | null = Array.isArray(reward?.gift_products)
    ? (reward.gift_products[0] ?? null)
    : (reward?.gift_products ?? null);

  if (!reward || reward.reward_type === "empty" || !giftProduct) {
    return { ...mock, source: "mock" };
  }

  const successWithReward = {
    ...mock.success,
    rewardName: giftProduct.product_name,
    rewardBrand: giftProduct.brand_name.toUpperCase(),
  } as MockHuntResult["success"];

  return {
    success: successWithReward,
    fail: mock.fail,
    source: "supabase",
  };
}
