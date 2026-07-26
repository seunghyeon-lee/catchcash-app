"use client";

import { useEffect, useRef } from "react";

/**
 * 세로 휠로 가로 스크롤 컨테이너를 움직인다 (데스크톱에서 마우스 휠로 캐릭터/색상 넘기기).
 *
 * React 의 `onWheel` 은 passive 로 붙어서 `preventDefault()` 가 먹지 않는다.
 * 그래서 ref 로 네이티브 리스너를 `{ passive: false }` 로 직접 단다.
 *
 * - 트랙패드 가로 제스처(`deltaX` 우세)는 브라우저 기본 동작에 맡긴다.
 * - 좌/우 끝에 닿으면 `preventDefault` 하지 않아 페이지 세로 스크롤이 이어진다.
 */
export function useHorizontalWheel<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;

      const atStart = event.deltaY < 0 && el.scrollLeft <= 0;
      const atEnd = event.deltaY > 0 && el.scrollLeft >= max - 1;
      if (atStart || atEnd) return;

      event.preventDefault();
      el.scrollLeft = Math.min(max, Math.max(0, el.scrollLeft + event.deltaY));
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

  return ref;
}
