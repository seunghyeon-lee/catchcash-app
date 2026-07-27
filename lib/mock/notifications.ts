export type NotificationCategory = "all" | "unread" | "coupon" | "treasure" | "notice";

export type AppNotification = {
  id: string;
  category: Exclude<NotificationCategory, "all" | "unread"> | "setting";
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export const notificationFilters: { id: NotificationCategory; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "unread", label: "안읽음" },
  { id: "coupon", label: "쿠폰" },
  { id: "treasure", label: "보물" },
  { id: "notice", label: "공지" },
];

export const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    category: "treasure",
    title: "근처에 보물 떴다.",
    body: "반경 500m 안에 새 보물이 나타났다. 빨리 찾거라",
    time: "방금 전",
    unread: true,
  },
  {
    id: "n2",
    category: "coupon",
    title: "전리품 챙길 시간이다",
    body: "보관함에서 쿠폰을 받거라",
    time: "방금 전",
    unread: true,
  },
  {
    id: "n3",
    category: "notice",
    title: "사냥 규칙이 바뀌었다.",
    body: "새 이용 안내를 확인하라",
    time: "어제",
    unread: false,
  },
  {
    id: "n4",
    category: "setting",
    title: "위치 권한이 꺼져 있다.",
    body: "이러면 보물 못 찾는다.",
    time: "3일 전",
    unread: false,
  },
];
