"use client";

import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NotificationFeed } from "@/components/notification/notification-feed";

/**
 * 알림함 화면 — `04_1_Notification_Inbox_Screen` (`/notification`)
 * 목록 조회는 `NotificationFeed` 안의 `listNotifications()` 가 담당한다.
 * 세션이 없거나 조회가 실패하면 기존 mock 목록으로 fallback 한다.
 */
export default function NotificationPage() {
  return (
    <section className="min-h-screen bg-[#f7f5ef] pb-28">
      <AppHeader variant="back-actions" title="알림" backHref="/home" />
      <NotificationFeed />
      <BottomNav />
    </section>
  );
}
