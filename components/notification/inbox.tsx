"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { icons, ui } from "@/lib/assets";
import {
  formatNotificationTime,
  mockNotifications,
  notificationFilters,
  type NotificationFilter,
  type NotificationType,
} from "@/lib/mock/notifications";

type NotificationInboxProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * `support`(문의 답변 도착)는 04_1 정의서에 없던 유형이라 전용 아이콘/프레임 에셋이 없다.
 * DB `notification_type` enum 에는 이미 있고 답변 등록 트리거가 이 유형으로 알림을 만들므로,
 * 성격이 가장 가까운 공지(notice) 에셋을 재사용해 렌더링만 되게 해둔다. 에셋 나오면 여기만 교체.
 */
const typeIcon: Record<NotificationType, string> = {
  treasure: icons.notifTreasure,
  coupon: icons.notifCoupon,
  notice: icons.notifNotice,
  setting: icons.notifSetting,
  support: icons.notifNotice,
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

  const items = useMemo(() => {
    return mockNotifications.filter((item) => {
      if (filter === "all") return true;
      if (filter === "unread") return !item.is_read;
      return item.type === filter;
    });
  }, [filter]);

  /** 04_1 6절 — 알림 유형별 이동 경로는 행의 `target_route` 하나로 처리한다. */
  const handleSelect = (targetRoute: string | null) => {
    if (!targetRoute) return;
    onClose();
    router.push(targetRoute);
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
          <div className="mb-6">
            <p className="text-[28px] font-medium leading-tight text-ink">뭐가 또 왔다.</p>
            <p className="mt-3 text-base text-soft">읽을 건 읽고, 넘길 건 넘겨.</p>
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

          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.target_route)}
                  disabled={!item.target_route}
                  className="relative block min-h-[72px] w-full bg-white px-4 py-3 text-left transition-transform enabled:active:translate-x-0.5 enabled:active:translate-y-0.5"
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
                        <p className="text-[15px] font-medium text-ink">{item.title}</p>
                        <span className="shrink-0 text-xs text-muted">
                          {formatNotificationTime(item.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-snug text-muted">{item.body}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
