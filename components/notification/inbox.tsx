"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { icons, ui } from "@/lib/assets";
import {
  mockNotifications,
  notificationFilters,
  type NotificationCategory,
} from "@/lib/mock/notifications";

type NotificationInboxProps = {
  open: boolean;
  onClose: () => void;
};

const categoryIcon = {
  treasure: icons.notifTreasure,
  coupon: icons.notifCoupon,
  notice: icons.notifNotice,
  setting: icons.notifSetting,
} as const;

const categoryFrame = {
  treasure: ui.notifTreasure,
  coupon: ui.notifCoupon,
  notice: ui.notifNotice,
  setting: ui.notifSetting,
} as const;

export function NotificationInbox({ open, onClose }: NotificationInboxProps) {
  const [filter, setFilter] = useState<NotificationCategory>("all");

  const items = useMemo(() => {
    return mockNotifications.filter((item) => {
      if (filter === "all") return true;
      if (filter === "unread") return item.unread;
      if (filter === "treasure") return item.category === "treasure";
      if (filter === "coupon") return item.category === "coupon";
      if (filter === "notice") return item.category === "notice";
      return true;
    });
  }, [filter]);

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
                  className="relative h-8 shrink-0 px-4 text-sm font-medium"
                  style={{
                    backgroundImage: `url(${active ? ui.filterChipActive : ui.filterChipInactive})`,
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    color: active ? "#fff" : "#000",
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="relative min-h-[72px] bg-white px-4 py-3"
                style={{
                  backgroundImage: `url(${categoryFrame[item.category]})`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="flex gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center">
                    <Image src={categoryIcon[item.category]} alt="" width={20} height={20} unoptimized />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[15px] font-medium text-ink">{item.title}</p>
                      <span className="shrink-0 text-xs text-muted">{item.time}</span>
                    </div>
                    <p className="mt-1 text-sm leading-snug text-muted">{item.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
