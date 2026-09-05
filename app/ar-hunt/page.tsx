"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { ARCloseButton } from "@/features/ar/components/ARCloseButton";
import { ARErrorFallback } from "@/features/ar/components/ARErrorFallback";
import { ARInstructionCard } from "@/features/ar/components/ARInstructionCard";
import { ARLoadingOverlay } from "@/features/ar/components/ARLoadingOverlay";
import { ARStatusBadge } from "@/features/ar/components/ARStatusBadge";
import { ARTapIndicator } from "@/features/ar/components/ARTapIndicator";
import { CameraVideoBackground } from "@/features/ar/components/CameraVideoBackground";
import { useARLifecycleCleanup } from "@/features/ar/hooks/useARLifecycleCleanup";
import { useCameraStream } from "@/features/ar/hooks/useCameraStream";
import { useHapticFeedback } from "@/features/ar/hooks/useHapticFeedback";
import { useTreasureClaim } from "@/features/ar/hooks/useTreasureClaim";
import type {
  ARHuntStatus,
  ChestResult,
  ChestVariant,
  ClaimFailureReason,
} from "@/features/ar/types/ar.types";

// R3F/Three는 브라우저 전용이므로 SSR을 끄고 동적 로드한다.
const ARCanvas = dynamic(() => import("@/features/ar/components/ARCanvas").then((m) => m.ARCanvas), {
  ssr: false,
});

type OverlayError = {
  title: string;
  description?: string;
  /** camera=권한/카메라 재시도, claim-retry=재터치 가능, map-only=지도 복귀만 */
  kind: "camera" | "claim-retry" | "map-only";
};

/** 운영/검증 실패 사유 → AR 오버레이 문구/동작 매핑(공식 명세 20 STEP20). */
function mapClaimFailure(reason: ClaimFailureReason, message: string): OverlayError {
  const retryable: ClaimFailureReason[] = ["LOCATION_ERROR", "SERVER_ERROR", "TOO_FAR"];
  const titleByReason: Record<ClaimFailureReason, string> = {
    LOCATION_ERROR: "현재 위치를 확인할 수 없어요.",
    TOO_FAR: "보물에서 너무 멀어졌어요.",
    ALREADY_CLAIMED: "이미 획득한 보물이에요.",
    SUSPENDED_USER: "현재 계정으로는 사냥할 수 없어요.",
    EXPIRED_TREASURE: "사냥 기간이 끝난 보물이에요.",
    INVALID_TREASURE: "보물 정보를 찾을 수 없어요.",
    UNAUTHENTICATED: "로그인이 필요해요.",
    SERVER_ERROR: "사냥에 실패했어요. 다시 시도해주세요.",
  };
  return {
    title: titleByReason[reason] ?? message,
    description: reason === "LOCATION_ERROR" ? "위치 권한을 확인한 뒤 다시 시도해주세요." : undefined,
    kind: retryable.includes(reason) ? "claim-retry" : "map-only",
  };
}

function ArHuntContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const treasureId = searchParams.get("treasureId");

  const { state: cameraState, stream, requestCamera, stopCamera } = useCameraStream();
  const { impact } = useHapticFeedback();
  const { claimTreasure } = useTreasureClaim();

  const [status, setStatus] = useState<ARHuntStatus>("initial");
  const [chestResult, setChestResult] = useState<ChestResult | undefined>(undefined);
  const [arError, setArError] = useState<OverlayError | null>(null);
  // controlled 열림 승인 신호. 정상 claim(SUCCESS/EMPTY) 후 증가시켜 상자 open을 시작한다.
  const [openSignal, setOpenSignal] = useState(0);

  // 추후 보물/보상 정책에 따라 variant를 결정한다(현재는 basic 고정).
  const chestVariant: ChestVariant = "basic";

  // treasureId가 없으면 AR을 진행하지 않고 지도로 복귀한다(공식 명세 5.2).
  useEffect(() => {
    if (!treasureId) router.replace("/map");
  }, [treasureId, router]);

  // 진입 시 카메라 초기화.
  useEffect(() => {
    if (!treasureId) return;
    setStatus("camera_loading");
    void requestCamera();
  }, [treasureId, requestCamera]);

  // 카메라 상태 → AR 상태/오류 반영.
  useEffect(() => {
    switch (cameraState) {
      case "ready":
        setStatus((prev) => (prev === "camera_loading" || prev === "initial" ? "ready" : prev));
        break;
      case "denied":
        setStatus("permission_denied");
        setArError({
          title: "카메라 권한을 허용해야 사냥에 참여할 수 있어요.",
          description: "권한을 허용한 뒤 다시 시도해주세요.",
          kind: "camera",
        });
        break;
      case "unsupported":
        setStatus("unsupported");
        setArError({ title: "이 기기에서는 카메라 사냥을 사용할 수 없어요.", kind: "map-only" });
        break;
      case "error":
        setStatus("camera_error");
        setArError({
          title: "카메라를 시작하지 못했어요.",
          description: "다른 앱에서 카메라를 사용 중인지 확인해주세요.",
          kind: "camera",
        });
        break;
      default:
        break;
    }
  }, [cameraState]);

  // 화면 이탈/백그라운드 시 카메라 정리.
  useARLifecycleCleanup(stopCamera);

  const handleClose = useCallback(() => {
    stopCamera();
    router.push("/map");
  }, [router, stopCamera]);

  const handleCameraRetry = useCallback(() => {
    setArError(null);
    setStatus("camera_loading");
    void requestCamera();
  }, [requestCamera]);

  const handleClaimRetry = useCallback(() => {
    setArError(null);
    setStatus("ready");
  }, []);

  // 상자 탭(controlled onTap) → 중복 잠금 → 햅틱 → GPS 재조회 → claim RPC(공식 명세 10.2 / 12.1).
  // controlled라 탭만으로는 상자가 열리지 않는다. claim 결과에 따라 open 여부를 승인한다.
  const handleChestTap = useCallback(async () => {
    if (status !== "ready" || !treasureId) return;
    setStatus("claiming");
    void impact();

    const outcome = await claimTreasure(treasureId);
    if (outcome.kind === "failure") {
      // 운영/검증 실패: openSignal을 올리지 않아 상자는 idle 유지 + 오류 안내(리더 v2 — open 금지).
      setStatus("failed");
      setArError(mapClaimFailure(outcome.reason, outcome.message));
      return;
    }

    // 정상 결과(SUCCESS=win / EMPTY=lose): result 세팅 후 openSignal 증가 → 상자 open 승인(공식 명세 10.3).
    setChestResult(outcome.result);
    setStatus("opening");
    setOpenSignal((n) => n + 1);
  }, [status, treasureId, impact, claimTreasure]);

  // 상자 Open 연출 완료(onOpenComplete) → 카메라 정리 후 결과 화면으로 이동(공식 명세 22·23장).
  const handleOpenComplete = useCallback(() => {
    if (!treasureId) return;
    setStatus("claimed");
    stopCamera();
    // SUCCESS→win→result=success, EMPTY→lose→result=empty (기존 result=fail 폐기, 리더 v2 §5).
    const resultParam = chestResult === "lose" ? "empty" : "success";
    router.push(`/hunt-result?result=${resultParam}&treasureId=${encodeURIComponent(treasureId)}`);
  }, [router, treasureId, stopCamera, chestResult]);

  // 운영/검증 실패 시에도 상자를 idle 상태로 계속 보여준다(리더 v2 — 실패 시 상자 idle 유지).
  const showCanvas =
    status === "ready" ||
    status === "claiming" ||
    status === "opening" ||
    status === "claimed" ||
    status === "failed";

  return (
    <section className="relative h-[100dvh] w-screen overflow-hidden bg-black">
      {/* Layer 1: 카메라 배경 */}
      {stream ? <CameraVideoBackground stream={stream} /> : null}

      {/* Layer 2: dark overlay (vignette) */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%)" }}
      />

      {/* Layer 3: 투명 R3F Canvas + 3D 상자 */}
      {showCanvas ? (
        <ARCanvas
          variant={chestVariant}
          result={chestResult}
          disabled={status !== "ready"}
          openSignal={openSignal}
          onTap={handleChestTap}
          onOpenComplete={handleOpenComplete}
        />
      ) : null}

      {/* Layer 4: AR UI */}
      <ARCloseButton onClose={handleClose} />
      <ARInstructionCard text="상자를 터치해 열어보거라" />
      {status === "ready" ? <ARTapIndicator /> : null}
      <ARStatusBadge
        label={status === "claiming" ? "보상 확인 중..." : "AR 사냥 모드 활성화"}
        active={status === "ready"}
      />

      {/* Layer 5: 로딩 / 오류 (claiming은 상자 열림 연출 + 상태배지로 표시, 전체 오버레이 미사용) */}
      {status === "camera_loading" ? <ARLoadingOverlay message="카메라를 준비하고 있어요..." /> : null}

      {arError ? (
        <ARErrorFallback
          title={arError.title}
          description={arError.description}
          primaryLabel={arError.kind === "map-only" ? undefined : "다시 시도"}
          onPrimary={
            arError.kind === "camera"
              ? handleCameraRetry
              : arError.kind === "claim-retry"
                ? handleClaimRetry
                : undefined
          }
          secondaryLabel="지도로 돌아가기"
          onSecondary={handleClose}
        />
      ) : null}
    </section>
  );
}

export default function ArHuntPage() {
  return (
    <Suspense fallback={null}>
      <ArHuntContent />
    </Suspense>
  );
}
