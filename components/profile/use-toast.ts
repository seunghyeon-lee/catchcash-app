"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** 잠깐 떴다 사라지는 토스트 메시지 상태. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number>();

  const show = useCallback((next: string) => {
    setMessage(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), 1600);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { message, show };
}
