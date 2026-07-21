export type NearbyTreasure = {
  id: string;
  title: string;
  place: string;
  distance: string;
  icon: "chest" | "tree";
};

export type HuntLog = {
  id: string;
  text: string;
  time: string;
  tone: "success" | "miss" | "found";
};

export const nearbyTreasures: NearbyTreasure[] = [
  {
    id: "t1",
    title: "한강공원 보물",
    place: "반포한강공원",
    distance: "120m",
    icon: "chest",
  },
  {
    id: "t2",
    title: "한강공원 보물",
    place: "반포한강공원",
    distance: "120m",
    icon: "tree",
  },
];

export const huntLogs: HuntLog[] = [
  { id: "l1", text: "황금 보물상자 획득", time: "오늘 오후 2:34", tone: "success" },
  { id: "l2", text: "회색 보물상자 꽝", time: "3일 전", tone: "miss" },
  { id: "l3", text: "숲속 보물상자 발견", time: "1주일 전", tone: "found" },
];
