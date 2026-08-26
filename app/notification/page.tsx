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
      {/*
        backHref 를 주지 않아 AppHeader 가 router.back() 을 쓰게 둔다.
        알림함은 GNB 가 붙은 모든 화면에서 열리는데 `/home` 으로 못박아 두면
        `/profile` 이나 `/support` 에서 알림을 열었을 때 엉뚱한 화면으로 튕긴다.
        GNB 문서 4-1 도 뒤로가기를 "이전 화면으로 이동"으로 정의한다.
      */}
      <AppHeader variant="back-actions" title="알림" />
      <NotificationFeed />
      <BottomNav />
    </section>
  );
}
