"use client";

import { useEffect } from "react";

/**
 * AR 화면 이탈/백그라운드 전환 시 카메라 등 리소스를 정리한다(공식 명세 7.4 / 25장).
 *
 * 처리 대상:
 * - 앱 background 전환 (Capacitor App appStateChange)
 * - 페이지 숨김 (visibilitychange hidden / pagehide) — 웹·WebView 공통
 *
 * unmount·route 변경 시 track 종료는 useCameraStream이 담당하므로 여기서 중복 호출하지 않는다.
 * MVP 정책: background → camera stop. 복귀 시 자동 resume 대신 안전한 재초기화(재시도)를 우선한다.
 *
 * @param onLeave 리소스 정리 콜백. 안정적인(useCallback) 참조를 전달해야 한다.
 */
export function useARLifecycleCleanup(onLeave: () => void) {
  useEffect(() => {
    let removeAppListener: (() => void) | undefined;

    // Capacitor App 리스너는 SSR/빌드 안전을 위해 동적 import.
    import("@capacitor/app")
      .then(({ App }) =>
        App.addListener("appStateChange", ({ isActive }) => {
          if (!isActive) onLeave();
        }),
      )
      .then((handle) => {
        removeAppListener = () => {
          void handle.remove();
        };
      })
      .catch(() => {
        // Capacitor 미탑재(순수 웹) 환경 — visibilitychange로 대체.
      });

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") onLeave();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", onLeave);

    return () => {
      removeAppListener?.();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", onLeave);
    };
  }, [onLeave]);
}
