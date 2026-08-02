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
 * mock only. Supabase notifications 연결은 후속 작업.
 */
export function NotificationFeed({ onAfterSelect }: NotificationFeedProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<NotificationFilter>("all");
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

  const handleSelect = (item: AppNotification) => {
    markRead(item.id);
    onAfterSelect?.();
    if (!item.target_route) return;
    router.push(item.target_route);
  };

  return (
    <div className="px-6 pb-6 pt-6">
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
