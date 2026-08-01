export type MockTreasureBoxStatus = "draft" | "active" | "paused" | "ended" | "deleted";

export type MockTreasureBox = {
  id: string;
  title: string;
  description: string;
  hint_text: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  status: MockTreasureBoxStatus;
  starts_at: string;
  ends_at: string;
  max_claim_count: number;
  current_claim_count: number;
  marker_image_url: string | null;
};

export const mockTreasureBoxes: MockTreasureBox[] = [
  {
    id: "50000000-0000-0000-0000-000000000001",
    title: "한강 공원 보물상자",
    description: "산책길 근처에 숨은 첫 번째 상자",
    hint_text: "물빛이 반짝이는 산책로를 따라가 봐.",
    latitude: 37.5283,
    longitude: 126.9327,
    radius_m: 80,
    status: "active",
    starts_at: "2026-07-27T09:00:00+09:00",
    ends_at: "2026-08-10T21:00:00+09:00",
    max_claim_count: 20,
    current_claim_count: 1,
    marker_image_url: "marker_treasure_box_yellow_shadow_40.svg",
  },
  {
    id: "50000000-0000-0000-0000-000000000002",
    title: "성수 골목 보물상자",
    description: "골목길에서 만나는 작은 보상",
    hint_text: "벽화가 보이는 모퉁이를 찾아봐.",
    latitude: 37.5446,
    longitude: 127.0559,
    radius_m: 60,
    status: "active",
    starts_at: "2026-07-28T10:00:00+09:00",
    ends_at: "2026-08-04T21:00:00+09:00",
    max_claim_count: 10,
    current_claim_count: 0,
    marker_image_url: "marker_treasure_box_purple_shadow_40.svg",
  },
  {
    id: "50000000-0000-0000-0000-000000000003",
    title: "다음 주 오픈 상자",
    description: "개발용 예약 보물상자",
    hint_text: "아직 열리지 않은 상자야.",
    latitude: 37.5665,
    longitude: 126.978,
    radius_m: 50,
    status: "draft",
    starts_at: "2026-08-04T09:00:00+09:00",
    ends_at: "2026-08-18T21:00:00+09:00",
    max_claim_count: 5,
    current_claim_count: 0,
    marker_image_url: null,
  },
];
