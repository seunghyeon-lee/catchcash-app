"use client";

import { AppHeader } from "@/components/layout/app-header";

/**
 * 프로필/문의 화면 상단 GNB 래퍼.
 * - 기본: Type B (`back-actions`)
 * - `/profile` 은 Type A 이므로 화면에서 `AppHeader variant="main-actions"` 를 직접 쓴다.
 */
export function ProfileTopAppBar({
  backHref,
  title = "catch cash",
  variant = "back-actions",
}: {
  backHref?: string;
  title?: string;
  variant?: "main-actions" | "back-actions" | "back-title";
}) {
  return <AppHeader variant={variant} title={title} backHref={backHref} />;
}
