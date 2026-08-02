"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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

type NotificationInboxProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * `support`(문의 답변 도착)는 04_1 정의서에 없던 유형이라 전용 카드 프레임 에셋이 없다.
 * DB `notification_type` enum 에는 이미 있고 답변 등록 트리거가 이 유형으로 알림을 만들므로,
 * 성격이 가장 가까운 공지(notice) 프레임을 재사용한다. 아이콘만 관리자 답변용 헤드셋으로 구분.
 * 에셋 나오면 이 두 맵만 교체하면 된다.
 */
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

export function NotificationInbox({ open, onClose }: NotificationInboxProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  /**
   * 읽음 상태는 화면에서 들고 있는다 (04_1 7-3).
   * Supabase 연동 시 이 state 를 `notifications.is_read` update 결과로 갈아끼우면 된다.
   */
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);

  const items = useMemo(() => {
    const filtered = notifications.filter((item) => {
      if (filter === "all") return true;
      if (filter === "unread") return !item.is_read;
      return item.type === filter;
    });
    return sortNotifications(filtered);
  }, [filter, notifications]);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id && !item.is_read ? { ...item, is_read: true, read_at: new Date().toISOString() } : item,
      ),
    );
  };

  const markAllRead = () => {
    const readAt = new Date().toISOString();
    setNotifications((prev) => prev.map((item) => (item.is_read ? item : { ...item, is_read: true, read_at: readAt })));
  };

  /** 04_1 6절 — 알림 유형별 이동 경로는 행의 `target_route` 하나로 처리한다. */
  const handleSelect = (item: AppNotification) => {
    markRead(item.id);
    if (!item.target_route) return;
    onClose();
    router.push(item.target_route);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-[480px] items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full flex-col bg-paper shadow-2xl">
        <div className="flex items-center justify-between border-b-2 border-ink px-6 py-4">
          <h2 className="text-2xl font-medium text-ink">알림</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center" aria-label="닫기">
            <Image src={icons.actionClose} alt="" width={16} height={16} unoptimized />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6 pt-6">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-[28px] font-medium leading-tight text-ink">뭐가 또 왔다.</p>
              <p className="mt-3 text-base text-soft">읽을 건 읽고, 넘길 건 넘겨.</p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
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

          {items.length === 0 ? (
            /* 빈 상태 (04_1 8-1) — 전용 일러스트가 없어 점선 카드로 대신한다 */
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
                    onClick={() => handleSelect(item)}
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
                          {/* 안읽음은 제목 bold + 점 표시, 읽음은 강조를 뺀다 (04_1 5-4) */}
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
      </div>
    </div>
  );
}
