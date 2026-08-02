"use client";

import Image from "next/image";
import { icons } from "@/lib/assets";
import { NotificationFeed } from "@/components/notification/notification-feed";

type NotificationInboxProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * 알림함 팝업 — 홈 등 아직 AppHeader 미적용 화면에서 사용.
 * 목록 본문은 `/notification` 과 동일한 `NotificationFeed` 를 쓴다.
 */
export function NotificationInbox({ open, onClose }: NotificationInboxProps) {
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
        <div className="overflow-y-auto">
          <NotificationFeed onAfterSelect={onClose} />
        </div>
      </div>
    </div>
  );
}
