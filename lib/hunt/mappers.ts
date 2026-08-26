import type { MockGiftProduct } from "@/lib/hunt/mock/gift-products";
import type { MockInventoryItem } from "@/lib/hunt/mock/inventory-items";
import type { MockInventoryItemListRow } from "@/lib/hunt/mock/inventory-item-list";
import type { MockTreasureBox } from "@/lib/hunt/mock/treasure-boxes";
import type { MockTreasureClaim } from "@/lib/hunt/mock/treasure-claims";

export type TreasureStatus = "active" | "claimed";
export type TreasureVariant = "yellow" | "purple";
export type RewardStatus = "available" | "failed" | "used" | "expired" | "canceled";

export type MockTreasure = {
  id: string;
  name: string;
  locationHint: string;
  status: TreasureStatus;
  variant: TreasureVariant;
  position: { left: number; top: number };
  distanceM: number;
  unlockRadiusM: number;
  hint: { order: number; text: string };
};

/** 보관함 목록용. coupon_code / barcode_value 미포함 (inventory_item_list). */
export type MockReward = {
  id: string;
  rewardCode: string;
  name: string;
  brand: string;
  status: RewardStatus;
  image: "coffee" | "sandwich" | null;
  expiresAt: string;
  expiresLabel: string;
  remainingDaysLabel?: string;
  usedAtLabel?: string;
  failReason?: string;
};

/** 보상 상세용. inventory_items 민감 컬럼 포함. */
export type MockRewardDetail = MockReward & {
  couponNumber?: string;
  barcodeValue?: string;
};

const STATUS_MAP: Record<MockInventoryItem["status"], RewardStatus> = {
  ready: "available",
  issued: "available",
  failed: "failed",
  used: "used",
  expired: "expired",
  canceled: "canceled",
};

function resolveRewardImage(giftProduct: MockGiftProduct | undefined): MockReward["image"] {
  if (giftProduct?.product_image_url === "sandwich") return "sandwich";
  if (giftProduct?.product_image_url === "coffee") return "coffee";
  return null;
}

function formatDateLabel(iso: string | null | undefined) {
  if (!iso) return "-";
  return iso.slice(0, 10).replace(/-/g, ".");
}

function mapListFields(
  inventoryItem: Pick<
    MockInventoryItemListRow,
    "id" | "status" | "expired_at" | "used_at" | "issue_failed_reason"
  >,
  giftProduct: MockGiftProduct | undefined,
): MockReward {
  const expiresAt = inventoryItem.expired_at ?? "";
  const expiredLabel = formatDateLabel(expiresAt || null);
  const rewardStatus = STATUS_MAP[inventoryItem.status];

  return {
    id: inventoryItem.id,
    rewardCode: `#CC-${inventoryItem.id.slice(-4).toUpperCase()}`,
    name: giftProduct?.product_name ?? "이름 없는 보상",
    brand: giftProduct?.brand_name ?? "알 수 없음",
    status: rewardStatus,
    image: resolveRewardImage(giftProduct),
    expiresAt,
    expiresLabel:
      inventoryItem.status === "expired"
        ? `${expiredLabel} 만료`
        : expiresAt
          ? `${expiredLabel} 까지`
          : "-",
    remainingDaysLabel: rewardStatus === "available" ? "5일 남음" : undefined,
    usedAtLabel: inventoryItem.used_at ? `${formatDateLabel(inventoryItem.used_at)} 사용됨` : undefined,
    failReason: inventoryItem.issue_failed_reason ?? undefined,
  };
}

export function mapTreasureBoxToTreasureUi(
  treasureBox: MockTreasureBox,
  index: number,
  claimedTreasureBoxIds: Set<string>,
): MockTreasure {
  const fallbackPositions = [
    { left: 68, top: 30 },
    { left: 22, top: 70 },
    { left: 16, top: 45 },
  ];
  const position = fallbackPositions[index] ?? { left: 50, top: 50 };

  return {
    id: treasureBox.id,
    name: treasureBox.title,
    locationHint: treasureBox.description,
    status: claimedTreasureBoxIds.has(treasureBox.id) ? "claimed" : "active",
    variant: index % 2 === 0 ? "yellow" : "purple",
    position,
    distanceM: index === 0 ? 700 : 180,
    unlockRadiusM: treasureBox.radius_m,
    hint: { order: 1, text: treasureBox.hint_text },
  };
}

export function mapInventoryListRowToRewardUi(
  listRow: MockInventoryItemListRow,
  giftProduct: MockGiftProduct | undefined,
): MockReward {
  return mapListFields(listRow, giftProduct);
}

export function mapInventoryItemToRewardDetailUi(
  inventoryItem: MockInventoryItem,
  giftProduct: MockGiftProduct | undefined,
): MockRewardDetail {
  // 4차: 쿠폰번호/바코드는 준비중 처리 — Giftishow(실제 발급) 연결 전까지 실제값을 화면에 노출하지 않는다.
  // 상세 조회 select에서도 coupon_code/barcode_value를 가져오지 않는다(inventory-service 참고).
  return mapListFields(inventoryItem, giftProduct);
}

/** 사냥 결과 상태. DB `claim_result` enum 기준. 성공 외 상태는 결과 화면에서 실패형 UI로 매핑한다. */
export type HuntResultState = "success" | "fail" | "too_far" | "empty" | "expired" | "already_claimed";

type HuntFailContent = {
  badge: string;
  titleLines: readonly string[];
  subtitle: string;
  emptyLines: readonly string[];
  supportLinkLabel: string;
  huntLog: readonly string[];
};

/** 성공을 제외한 결과 상태별 실패형 화면 콘텐츠. (6차: 상태 UI 매핑을 한 곳에서 관리) */
const HUNT_FAIL_CONTENT: Record<Exclude<HuntResultState, "success">, HuntFailContent> = {
  too_far: {
    badge: "꽝",
    titleLines: ["아쉽네. 아직 멀다."],
    subtitle: "조금 더 가까이 가봐.",
    emptyLines: ["아직 너무 멀다.", "조금 더 가까이 가라."],
    supportLinkLabel: "문의하기",
    huntLog: ["보물 상자 접근", "상자 열기 시도", "거리 부족"],
  },
  empty: {
    badge: "꽝",
    titleLines: ["아쉽네. 빈 상자다."],
    subtitle: "다른 상자나 뒤져봐.",
    emptyLines: ["상자 안이 텅 비었다.", "아쉽네 ㅋ"],
    supportLinkLabel: "문의하기",
    huntLog: ["보물 상자 접근", "상자 열기 시도", "보상 없음"],
  },
  expired: {
    badge: "만료",
    titleLines: ["끝난 보물이다."],
    subtitle: "이 상자는 기간이 지났어.",
    emptyLines: ["보물 기간이 끝났다.", "다음 기회를 노려라."],
    supportLinkLabel: "문의하기",
    huntLog: ["보물 상자 접근", "상자 열기 시도", "기간 만료"],
  },
  already_claimed: {
    badge: "이미 받음",
    titleLines: ["벌써 챙긴 보물이다."],
    subtitle: "이 상자 보상은 이미 받았어.",
    emptyLines: ["이미 받은 보물이다.", "보관함에서 확인해."],
    supportLinkLabel: "문의하기",
    huntLog: ["보물 상자 접근", "상자 열기 시도", "이미 획득함"],
  },
  fail: {
    badge: "꽝",
    titleLines: ["아쉽네. 실패다."],
    subtitle: "다시 도전해봐.",
    emptyLines: ["이번엔 안 됐다.", "다음 상자를 노려라."],
    supportLinkLabel: "문의하기",
    huntLog: ["보물 상자 접근", "상자 열기 시도", "획득 실패"],
  },
};

/** 결과 상태 문자열 → 실패형 결과 화면 콘텐츠. 알 수 없는/성공 값은 일반 실패로 처리한다. */
export function buildHuntFailContent(state?: string): HuntFailContent {
  if (state && state !== "success" && state in HUNT_FAIL_CONTENT) {
    return HUNT_FAIL_CONTENT[state as Exclude<HuntResultState, "success">];
  }
  return HUNT_FAIL_CONTENT.fail;
}

export function mapTreasureClaimToResultUi(
  claim: MockTreasureClaim | undefined,
  reward: Pick<MockReward, "name" | "brand"> | undefined,
) {
  if (!claim || claim.result !== "success") {
    return buildHuntFailContent(claim?.result);
  }

  return {
    badge: "건졌다",
    titleLines: ["잘했네.", "하나 건졌다."],
    subtitle: "전리품은 보관함에 넣어뒀다.",
    rewardName: reward?.name ?? "아메리카노 기프티콘",
    rewardBrand: reward?.brand.toUpperCase() ?? "MOCK",
    noticeLines: ["실물은 보관함에서 확인할 수 있습니다.", "쿠폰 코드는 보관함에서 직접 받으세요."],
    huntLog: ["보물 상자 접근", "상자 열기 시도", "보상 발견!"],
    quote: '"세상에 공짜는 없다지만, 이건 진짜인가 보네."',
  } as const;
}
