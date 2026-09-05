"use client";

import { useCallback } from "react";

/**
 * 햅틱/진동 피드백 (공식 명세 17.1).
 * 우선순위: Capacitor Haptics → navigator.vibrate → 미지원 시 생략.
 * 햅틱은 보조 UX이므로 어떤 실패도 전체 기능을 막지 않는다(모두 무시).
 */
export function useHapticFeedback() {
  const impact = useCallback(async () => {
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      try {
        navigator.vibrate?.(40);
      } catch {
        // 미지원 기기 — 무시.
      }
    }
  }, []);

  return { impact };
}
