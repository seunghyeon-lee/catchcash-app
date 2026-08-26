"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { icons, ui } from "@/lib/assets";
import {
  formatNotificationTime,
  mockNotifications,
  notificationFilters,
  sortNotifications,
  type AppNotification,
  type NotificationFilter,
  type NotificationType,
} from "@/lib/mock/notifications";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  toNotificationTargetHref,
} from "@/lib/notification/notification-service";

const typeIcon: Record<NotificationType, string> = {
  treasure: icons.notifTreasure,
  coupon: icons.notifCoupon,
  notice: icons.notifNotice,
  setting: icons.notifSetting,
  support: icons.notifSupport,
};

const typeFrame: Record<NotificationType, string> = {
  treasure: ui.notifTreasure,
  coupon: ui.notifCoupon,
  notice: ui.notifNotice,
  setting: ui.notifSetting,
  support: ui.notifNotice,
};

type NotificationFeedProps = {
  /** 항목 선택 후 추가 동작 (모달 close 등). 기본은 target_route 이동만. */
  onAfterSelect?: () => void;
};

/**
 * 알림 목록 본문 — 팝업(`/` 모달)과 `/notification` 페이지가 공유한다.
 *
 * 데이터는 `listNotifications()` 가 담당한다. 세션이 있으면 본인 `user_id` 알림만 조회하고,
 * 세션이 없거나 조회가 실패하면 기존 mock 목록을 그대로 보여준다.
 */
export function NotificationFeed({ onAfterSelect }: NotificationFeedProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockFallback, setIsMockFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      const result = await listNotifications();

      if (!isMounted) return;

      setNotifications(result.notifications);
      setIsMockFallback(result.source === "mock");
      setErrorMessage(result.errorMessage ?? null);
      setIsLoading(false);
    };

    void loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const items = useMemo(() => {
    const filtered = notifications.filter((item) => {
      if (filter === "all") return true;
      if (filter === "unread") return !item.is_read;
      return item.type === filter;
    });
    return sortNotifications(filtered);
  }, [filter, notifications]);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  /**
   * 읽음 처리는 낙관적으로 먼저 반영한다 — 알림을 누르면 곧바로 다른 화면으로 넘어가기 때문에
   * update 응답을 기다렸다가 칠하면 사용자는 바뀌는 걸 볼 수 없다.
   * update 가 실패하면 되돌려서 화면 상태와 DB 를 다시 맞춘다.
   */
  const applyRead = (ids: string[], readAt: string) => {
    const target = new Set(ids);
    setNotifications((prev) =>
      prev.map((item) => (target.has(item.id) ? { ...item, is_read: true, read_at: readAt } : item)),
    );
  };

  const revertRead = (ids: string[]) => {
    const target = new Set(ids);
    setNotifications((prev) =>
      prev.map((item) => (target.has(item.id) ? { ...item, is_read: false, read_at: null } : item)),
    );
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((item) => !item.is_read).map((item) => item.id);
    if (unreadIds.length === 0) return;

    applyRead(unreadIds, new Date().toISOString());

    const result = await markAllNotificationsRead();
    if (!result.ok) {
      revertRead(unreadIds);
      setErrorMessage("읽음 처리에 실패했어. 잠시 후 다시 시도해줘.");
    }
  };

  /** 04_1 6절 — 알림 유형별 이동 경로는 행의 `target_route` 하나로 처리한다. */
  const handleSelect = async (item: AppNotification) => {
    const wasUnread = !item.is_read;

    if (wasUnread) applyRead([item.id], new Date().toISOString());

    // 이동은 update 결과와 무관하게 먼저 끝낸다 (MD 3차: update 실패해도 기존 이동 흐름 유지).
    onAfterSelect?.();
    if (item.target_route) router.push(toNotificationTargetHref(item.target_route));

    if (!wasUnread) return;

    const result = await markNotificationRead(item.id);
    if (!result.ok) revertRead([item.id]);
  };

  return (
    <div className="px-6 pb-6 pt-6">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-[28px] font-medium leading-tight text-ink">뭐가 또 왔다.</p>
          <p className="mt-3 text-base text-soft">읽을 건 읽고, 넘길 건 넘겨.</p>
        </div>
        {/* 조회 중에는 아직 mock 기준 카운트라, 목록이 확정된 뒤에만 노출한다 */}
        {!isLoading && unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="shrink-0 border-b-2 border-ink pb-0.5 text-sm font-medium text-ink"
          >
            모두 읽음
          </button>
        ) : null}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {notificationFilters.map((chip) => {
          const active = filter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              className={`h-8 shrink-0 rounded-md border-2 border-ink px-3.5 text-sm font-medium tracking-wide ${
                active ? "bg-ink text-white" : "bg-white text-ink"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* 문의/프로필 화면과 같은 톤으로 fallback·에러만 한 줄씩 알린다 */}
      {isMockFallback && !isLoading ? (
        <p className="mb-3 text-xs leading-5 text-muted">로그인 연결 전이라 예시 알림을 보여주고 있어.</p>
      ) : null}
      {errorMessage ? <p className="mb-3 text-sm leading-5 text-[#b42318]">{errorMessage}</p> : null}

      {isLoading ? (
        <p className="py-10 text-center text-base text-muted">알림을 불러오는 중이야.</p>
      ) : items.length === 0 ? (
        <div className="border-2 border-dashed border-ink/50 bg-white/60 px-5 py-12 text-center">
          <p className="text-lg font-medium text-ink">아직 조용하네.</p>
          <p className="mt-2 text-sm text-muted">보물도 소식도 아직 없다.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => void handleSelect(item)}
                className={`relative block min-h-[72px] w-full px-4 py-3 text-left transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                  item.is_read ? "opacity-60" : ""
                }`}
                style={{
                  backgroundImage: `url(${typeFrame[item.type]})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="flex gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center">
                    <Image src={typeIcon[item.type]} alt="" width={20} height={20} unoptimized />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`flex min-w-0 items-center gap-1.5 text-[15px] text-ink ${
                          item.is_read ? "font-normal" : "font-bold"
                        }`}
                      >
                        {item.is_read ? null : (
                          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-ink" />
                        )}
                        <span className="truncate">{item.title}</span>
                      </p>
                      <span className="shrink-0 text-xs text-muted">
                        {formatNotificationTime(item.created_at)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted">{item.body}</p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
