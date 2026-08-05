import { getAuthenticatedUserSession } from "@/lib/profile/auth-session";
import { mapTreasureBoxToTreasureUi, type MockTreasure } from "@/lib/hunt/mappers";
import type { MockTreasureBox } from "@/lib/hunt/mock/treasure-boxes";
import { getClaimedTreasureMarker, getMapTreasures } from "@/lib/hunt/selectors";

export type TreasureDataSource = "supabase" | "mock";

export type GetMapTreasuresResult = {
  treasures: MockTreasure[];
  claimedMarker: ReturnType<typeof getClaimedTreasureMarker>;
  source: TreasureDataSource;
  errorMessage?: string;
};

type TreasureBoxRow = Pick<
  MockTreasureBox,
  | "id"
  | "title"
  | "description"
  | "hint_text"
  | "latitude"
  | "longitude"
  | "radius_m"
  | "status"
  | "starts_at"
  | "ends_at"
  | "max_claim_count"
  | "current_claim_count"
  | "marker_image_url"
>;

const TREASURE_BOX_SELECT =
  "id, title, description, hint_text, latitude, longitude, radius_m, status, starts_at, ends_at, max_claim_count, current_claim_count, marker_image_url";

/**
 * `/map` 활성 보물 목록 + 획득 완료 마커 조회.
 * 세션이 없으면 기존 mock을 그대로 반환한다.
 * 획득 완료 마커는 실제 지도 좌표 연동 전까지 mock placeholder를 유지한다.
 */
export async function getMapTreasuresData(): Promise<GetMapTreasuresResult> {
  const session = await getAuthenticatedUserSession();

  if (!session) {
    return { treasures: getMapTreasures(), claimedMarker: getClaimedTreasureMarker(), source: "mock" };
  }

  const { data, error } = await session.client
    .from("treasure_boxes")
    .select(TREASURE_BOX_SELECT)
    .eq("status", "active")
    .is("deleted_at", null);

  if (error) {
    return {
      treasures: getMapTreasures(),
      claimedMarker: getClaimedTreasureMarker(),
      source: "mock",
      errorMessage: "보물 목록을 불러오지 못했어. 잠시 후 다시 확인해줘.",
    };
  }

  const boxes = (data ?? []) as TreasureBoxRow[];
  // 수량이 다 찬 보물상자만 "claimed"로 표시한다. 다른 유저의 treasure_claims는
  // RLS로 읽을 수 없으므로 treasure_boxes 자체의 수량 컬럼으로 판단한다.
  const claimedTreasureBoxIds = new Set(
    boxes.filter((box) => box.current_claim_count >= box.max_claim_count).map((box) => box.id),
  );

  return {
    treasures: boxes.map((box, index) => mapTreasureBoxToTreasureUi(box, index, claimedTreasureBoxIds)),
    claimedMarker: getClaimedTreasureMarker(),
    source: "supabase",
  };
}
