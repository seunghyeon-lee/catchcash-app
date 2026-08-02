"use client";

import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NotificationFeed } from "@/components/notification/notification-feed";

/**
 * 알림함 화면 — `04_1_Notification_Inbox_Screen` (`/notification`)
 * mock only. Supabase notifications 연결은 후속 작업.
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
