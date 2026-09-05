"use client";

import { useEffect, useRef } from "react";

/**
 * 후면 카메라 스트림을 전체 화면 배경으로 표시한다(공식 명세 6·7장).
 * playsInline/muted/autoPlay + object-cover 전체 화면.
 */
export function CameraVideoBackground({ stream }: { stream: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    // iOS WebView 자동재생 정책 대비: 실패해도 전체 흐름을 막지 않는다.
    video.play().catch(() => {});
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      aria-hidden
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
