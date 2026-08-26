// 알림 Mock Data
// 화면 정의서: docs/frontend/user-app/04_1_Notification_Inbox_Screen.md
// 필드명·타입은 Supabase `public.notifications`(supabase/migrations/001_init_mvp_schema.sql:170)에 맞춘다.
// 다음 단계에서 이 배열만 실제 조회 결과로 갈아끼우면 화면은 그대로 동작한다.

/** DB `public.notification_type` enum 과 1:1 */
export type NotificationType = "treasure" | "coupon" | "notice" | "setting" | "support";

/** 필터칩 값 — 유형 필터 + 상태 필터(`unread`) + 기본값(`all`) */
export type NotificationFilter = "all" | "unread" | NotificationType;

const NOTIFICATION_TYPES: NotificationType[] = ["treasure", "coupon", "notice", "setting", "support"];

/**
 * 조회 결과의 `type` 을 화면이 아는 값으로 좁힌다.
 *
 * 알림 카드는 `type` 으로 아이콘·프레임 에셋을 찾는데, DB `notification_type` enum 에
 * 값이 하나 늘고 프론트가 아직 모르면 `typeIcon[type]` 이 undefined 가 되어
 * `next/image` 가 src 없이 렌더되면서 알림함 전체가 터진다.
 * 모르는 유형은 성격이 가장 무난한 공지로 모아 카드만이라도 뜨게 한다.
 */
export function toNotificationType(value: string | null | undefined): NotificationType {
  return NOTIFICATION_TYPES.includes(value as NotificationType) ? (value as NotificationType) : "notice";
}

/** DB `public.notifications` 행 구조 */
export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** 클릭 시 이동할 앱 내 경로. DB에서 nullable 이라 없을 수 있다. */
  target_route: string | null;
  is_read: boolean;
  /** ISO 8601 (timestamptz) */
  created_at: string;
  read_at: string | null;
};

/**
 * 필터칩 목록 (04_1 4-1).
 *
 * 정의서 기준 6종(전체/안읽음/쿠폰/보물/공지/설정)에 **문의답변**(`support`)을 더했다.
 * 관리자가 답변을 등록하면 DB 트리거가 `type = 'support'` 알림을 넣기 때문에
 * 유형 필터에도 자리가 있어야 한다 — 유형 칩은 `NotificationType` 전부를 덮는다.
 */
export const notificationFilters: { id: NotificationFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "unread", label: "안읽음" },
  { id: "coupon", label: "쿠폰" },
  { id: "treasure", label: "보물" },
  { id: "notice", label: "공지" },
  { id: "setting", label: "설정" },
  { id: "support", label: "문의답변" },
];

/**
 * 정렬 규칙 (04_1 7-1): 안읽은 알림 먼저, 같은 상태 안에서는 최신순.
 * DB에서 읽어올 때도 같은 순서(`order('is_read').order('created_at', desc)`)를 쓴다.
 */
export function sortNotifications<T extends Pick<AppNotification, "is_read" | "created_at">>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/**
 * mock 이라 `created_at` 을 모듈 로드 시각 기준 상대값으로 만든다.
 * 고정 ISO 로 박아두면 시간이 지날수록 전부 "N개월 전"으로 보여 시안 확인이 안 된다.
 * DB 연동 시 이 배열이 통째로 조회 결과로 바뀌므로 이 헬퍼도 같이 사라진다.
 */
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

export const mockNotifications: AppNotification[] = [
  {
    id: "0f1b2c3d-4e5f-4a6b-8c9d-0e1f2a3b4c5d",
    type: "treasure",
    title: "근처에 보물 떴다.",
    body: "반경 500m 안에 새 보물이 나타났다. 빨리 찾거라",
    target_route: "/map",
    is_read: false,
    created_at: minutesAgo(0),
    read_at: null,
  },
  {
    id: "1a2b3c4d-5e6f-4a7b-8c9d-1e2f3a4b5c6d",
    type: "coupon",
    title: "전리품 챙길 시간이다",
    body: "보관함에서 쿠폰을 받거라",
    target_route: "/inventory",
    is_read: false,
    created_at: minutesAgo(48),
    read_at: null,
  },
  {
    /**
     * 문의 답변 알림.
     * 관리자가 답변을 등록하면 DB 트리거 `resolve_inquiry_after_reply`(001_init_mvp_schema.sql:282)가
     * 같은 값으로 행을 만든다 — 제목/본문/`target_route` 를 트리거와 동일하게 둔다.
     */
    id: "2b3c4d5e-6f7a-4b8c-9d0e-2f3a4b5c6d7e",
    type: "support",
    title: "문의 답변 도착",
    body: "등록한 문의에 관리자의 답변이 도착했어요.",
    target_route: "/support/inquiry_001",
    is_read: false,
    created_at: minutesAgo(5 * 60),
    read_at: null,
  },
  {
    id: "3c4d5e6f-7a8b-4c9d-0e1f-3a4b5c6d7e8f",
    type: "notice",
    title: "사냥 규칙이 바뀌었다.",
    body: "새 이용 안내를 확인하라",
    target_route: "/guide",
    is_read: true,
    created_at: minutesAgo(26 * 60),
    read_at: minutesAgo(25 * 60),
  },
  {
    id: "4d5e6f7a-8b9c-4d0e-1f2a-4b5c6d7e8f90",
    type: "setting",
    title: "위치 권한이 꺼져 있다.",
    body: "이러면 보물 못 찾는다.",
    target_route: "/profile",
    is_read: true,
    created_at: minutesAgo(3 * 24 * 60),
    read_at: minutesAgo(3 * 24 * 60 - 30),
  },
];

/**
 * `created_at` → 알림 카드 우측 시간 표기.
 * 04_1 6.5.4 가 시간 문구를 6~8자로 제한하므로 짧은 형태만 쓴다.
 */
export function formatNotificationTime(createdAt: string): string {
  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) return "";

  const minutes = Math.floor((Date.now() - created.getTime()) / 60_000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;

  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit" })
    .format(created)
    .replace(/\.$/, "");
}
