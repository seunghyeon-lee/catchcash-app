"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CameraState } from "@/features/ar/types/ar.types";

function isCameraSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

/**
 * 후면 카메라 실시간 프리뷰 스트림 관리 (공식 명세 7장).
 * 실시간 배경은 @capacitor/camera가 아니라 getUserMedia를 사용한다(7.3).
 *
 * 담당: 지원 여부 확인 / getUserMedia / 상태(loading·ready·denied·unsupported·error) /
 *      stopCamera(모든 track 종료) / unmount 시 자동 track 종료.
 */
export function useCameraStream() {
  const [state, setState] = useState<CameraState>("idle");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startingRef = useRef(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const requestCamera = useCallback(async () => {
    if (startingRef.current || streamRef.current) return;
    if (!isCameraSupported()) {
      setState("unsupported");
      return;
    }

    startingRef.current = true;
    setState("loading");
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = media;
      setStream(media);
      setState("ready");
    } catch (error) {
      const name = (error as DOMException)?.name;
      // 권한 거부와 카메라 점유/기타 오류를 구분(공식 명세 15장).
      if (name === "NotAllowedError" || name === "SecurityError") {
        setState("denied");
      } else {
        setState("error");
      }
    } finally {
      startingRef.current = false;
    }
  }, []);

  // 화면을 벗어날 때(unmount) 모든 track을 반드시 종료한다(7.4). route 변경도 여기서 커버.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  return { state, stream, requestCamera, stopCamera };
}
