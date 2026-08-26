import { getAuthenticatedUserSession } from "@/lib/profile/auth-session";
import { mockNotifications, sortNotifications, type AppNotification } from "@/lib/mock/notifications";

export type NotificationDataSource = "supabase" | "mock";

export type ListNotificationsResult = {
  notifications: AppNotification[];
  source: NotificationDataSource;
  errorMessage?: string;
};

/** `lib/mock/notifications.ts` 의 `AppNotification` 과 컬럼명을 1:1로 맞춰 둔 select */
const NOTIFICATION_SELECT = "id, type, title, body, target_route, is_read, created_at, read_at";

/**
 * `/notification` 과 GNB 알림 팝업이 함께 쓰는 알림 목록 조회.
 *
 * 정렬은 04_1 7-1(안읽음 먼저, 그 안에서 최신순)을 DB 쪽에서 그대로 태운다 —
 * `notifications_user_read_created_idx` 가 (user_id, is_read, created_at desc) 라 인덱스를 탄다.
 *
 * 세션이 없거나 조회가 실패하면 기존 mock 목록을 그대로 돌려준다. 알림함은 화면 어디서든
 * 열리는 팝업이라 여기서 빈 배열을 반환하면 다른 화면 위에서 빈 알림함이 떠 버린다.
 */
export async function listNotifications(): Promise<ListNotificationsResult> {
  const session = await getAuthenticatedUserSession();

  if (!session) {
    return { notifications: sortNotifications(mockNotifications), source: "mock" };
  }

  const { data, error } = await session.client
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("user_id", session.userId)
    .order("is_read", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return {
      notifications: sortNotifications(mockNotifications),
      source: "mock",
      errorMessage: "알림을 불러오지 못했어. 잠시 후 다시 확인해줘.",
    };
  }

  return {
    notifications: (data ?? []) as AppNotification[],
    source: "supabase",
  };
}

export type MarkNotificationReadResult = {
  source: NotificationDataSource;
  ok: boolean;
};

/**
 * 알림 1건 읽음 처리 (04_1 7-3).
 *
 * `is_read = false` 조건을 함께 걸어, 이미 읽은 알림을 다시 눌러도 `read_at` 이
 * 최초 읽은 시각에서 지금으로 덮이지 않게 한다.
 *
 * `read_at` 은 클라이언트 시계 기준이다. DB 쪽 default 가 없고 이 화면에서만 쓰는
 * 표시용 값이라 오차는 감수한다 — 정렬 기준은 `created_at` 이지 `read_at` 이 아니다.
 *
 * 세션이 없으면 DB에 쓰지 않고 mock 성공만 돌려준다 (fake user_id 금지).
 */
export async function markNotificationRead(notificationId: string): Promise<MarkNotificationReadResult> {
  const session = await getAuthenticatedUserSession();

  if (!session) {
    return { source: "mock", ok: true };
  }

  const { error } = await session.client
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", session.userId)
    .eq("is_read", false);

  return { source: "supabase", ok: !error };
}

/**
 * "모두 읽음" — 안읽은 알림만 한 번에 갱신한다.
 * `notifications_update_own` 정책이 `user_id = auth.uid()` 라 본인 행만 대상이 된다.
 */
export async function markAllNotificationsRead(): Promise<MarkNotificationReadResult> {
  const session = await getAuthenticatedUserSession();

  if (!session) {
    return { source: "mock", ok: true };
  }

  const { error } = await session.client
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", session.userId)
    .eq("is_read", false);

  return { source: "supabase", ok: !error };
}
