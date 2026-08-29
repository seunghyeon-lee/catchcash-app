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

export function mapTreasureClaimToResultUi(
  claim: MockTreasureClaim | undefined,
  reward: Pick<MockReward, "name" | "brand"> | undefined,
) {
  if (!claim || claim.result !== "success") {
    return {
      badge: "꽝",
      titleLines: ["아쉽네. 빈 상자다."],
      subtitle: "다른 상자나 뒤져봐.",
      emptyLines:
        claim?.result === "too_far"
          ? ["아직 너무 멀다.", "조금 더 가까이 가라."]
          : ["상자 안이 텅 비었다.", "아쉽네 ㅋ"],
      supportLinkLabel: "문의하기",
      huntLog: [
        "보물 상자 접근",
        "상자 열기 시도",
        claim?.result === "too_far" ? "거리 부족" : "보상 없음",
      ],
    } as const;
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
