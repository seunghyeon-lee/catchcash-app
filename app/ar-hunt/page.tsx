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
import { useNearestTreasureTarget } from "@/features/ar/hooks/useNearestTreasureTarget";
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
  /** camera=권한/카메라 재시도, claim-retry=재터치, target-retry=보물 재탐색, map-only=지도 복귀만 */
  kind: "camera" | "claim-retry" | "target-retry" | "map-only";
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
  // 지도/힌트 진입은 query treasureId, BNB 직접 진입은 없음(nearest 자동 선택). 지시서 3장.
  const queryTreasureId = searchParams.get("treasureId");

  const { state: cameraState, stream, requestCamera, stopCamera } = useCameraStream();
  const { impact } = useHapticFeedback();
  const { claimTreasure } = useTreasureClaim();
  const { resolvedTreasureId, resolving, resolveError, retryResolve } =
    useNearestTreasureTarget(queryTreasureId);

  const [status, setStatus] = useState<ARHuntStatus>("initial");
  const [chestResult, setChestResult] = useState<ChestResult | undefined>(undefined);
  const [arError, setArError] = useState<OverlayError | null>(null);
  // controlled 열림 승인 신호. 정상 claim(SUCCESS/EMPTY) 후 증가시켜 상자 open을 시작한다.
  const [openSignal, setOpenSignal] = useState(0);

  // 추후 보물/보상 정책에 따라 variant를 결정한다(현재는 basic 고정).
  const chestVariant: ChestVariant = "basic";

  // 진입 시 카메라 초기화. treasureId 유무와 무관하게 항상 실행한다(BNB 직접 진입 지원, 지시서 2·15장).
  useEffect(() => {
    setStatus("camera_loading");
    void requestCamera();
  }, [requestCamera]);

  // 카메라 상태 + target 상태 → AR 상태 반영.
  useEffect(() => {
    if (cameraState === "denied") {
      setStatus("permission_denied");
      setArError({
        title: "카메라 권한을 허용해야 사냥에 참여할 수 있어요.",
        description: "권한을 허용한 뒤 다시 시도해주세요.",
        kind: "camera",
      });
      return;
    }
    if (cameraState === "unsupported") {
      setStatus("unsupported");
      setArError({ title: "이 기기에서는 카메라 사냥을 사용할 수 없어요.", kind: "map-only" });
      return;
    }
    if (cameraState === "error") {
      setStatus("camera_error");
      setArError({
        title: "카메라를 시작하지 못했어요.",
        description: "다른 앱에서 카메라를 사용 중인지 확인해주세요.",
        kind: "camera",
      });
      return;
    }
    if (cameraState !== "ready") return;

    // 카메라 준비됨 → target 상태 반영. claim 흐름/오류 표시 중이면 유지한다.
    setStatus((prev) => {
      if (prev === "claiming" || prev === "opening" || prev === "claimed" || prev === "failed") {
        return prev;
      }
      if (resolveError) return "failed";
      if (resolving || !resolvedTreasureId) return "target_resolving";
      return "ready";
    });
  }, [cameraState, resolving, resolvedTreasureId, resolveError]);

  // target 탐색 실패 → 오버레이(지시서 16·17장). 카메라 오류 표시 중이면 그 오버레이를 우선한다.
  useEffect(() => {
    if (!resolveError) return;
    if (status === "permission_denied" || status === "unsupported" || status === "camera_error") {
      return;
    }
    if (resolveError === "no_treasure") {
      setArError({
        title: "주변에 사냥할 수 있는 보물이 없어요.",
        description: "지도에서 보물을 찾아보세요.",
        kind: "map-only",
      });
    } else if (resolveError === "server_error") {
      setArError({
        title: "보물 정보를 불러오지 못했어요.",
        description: "잠시 후 다시 시도해주세요.",
        kind: "target-retry",
      });
    } else {
      setArError({
        title: "현재 위치를 확인할 수 없어요.",
        description: "위치 권한을 확인한 뒤 다시 시도해주세요.",
        kind: "target-retry",
      });
    }
  }, [resolveError, status]);

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

  // 보물 재탐색(server_error / location_error). 지도로 튕기지 않고 다시 시도한다.
  // status를 target_resolving으로 되돌려야 카메라+target effect의 "failed" 가드를 벗어나
  // 재조회 성공 시 ready로, 실패 시 다시 failed로 정상 재계산된다(재시도 데드락 방지).
  const handleTargetRetry = useCallback(() => {
    setArError(null);
    setStatus("target_resolving");
    retryResolve();
  }, [retryResolve]);

  // 상자 탭(controlled onTap) → 중복 잠금 → 햅틱 → GPS 재조회 → claim RPC(공식 명세 10.2 / 12.1).
  // controlled라 탭만으로는 상자가 열리지 않는다. claim 결과에 따라 open 여부를 승인한다.
  // 대상은 resolvedTreasureId(지도 진입=query, BNB 진입=nearest). 지시서 19장.
  const handleChestTap = useCallback(async () => {
    if (status !== "ready" || !resolvedTreasureId) return;
    setStatus("claiming");
    void impact();

    const outcome = await claimTreasure(resolvedTreasureId);
    if (outcome.kind === "failure") {
      // 운영/검증 실패: openSignal을 올리지 않아 상자는 idle 유지 + 오류 안내(open 금지).
      setStatus("failed");
      setArError(mapClaimFailure(outcome.reason, outcome.message));
      return;
    }

    // 정상 결과(SUCCESS=win / EMPTY=lose): result 세팅 후 openSignal 증가 → 상자 open 승인(공식 명세 10.3).
    setChestResult(outcome.result);
    setStatus("opening");
    setOpenSignal((n) => n + 1);
  }, [status, resolvedTreasureId, impact, claimTreasure]);

  // 상자 Open 연출 완료(onOpenComplete) → 카메라 정리 후 결과 화면으로 이동(공식 명세 22·23장).
  // resolvedTreasureId를 결과 화면에 전달한다(BNB 직접 진입도 실제 보물 참조, 지시서 19장).
  const handleOpenComplete = useCallback(() => {
    if (!resolvedTreasureId) return;
    setStatus("claimed");
    stopCamera();
    // SUCCESS→win→result=success, EMPTY→lose→result=empty (기존 result=fail 폐기, 리더 v2 §5).
    const resultParam = chestResult === "lose" ? "empty" : "success";
    router.push(
      `/hunt-result?result=${resultParam}&treasureId=${encodeURIComponent(resolvedTreasureId)}`,
    );
  }, [router, resolvedTreasureId, stopCamera, chestResult]);

  // 운영/검증 실패 시에도 상자를 idle 상태로 계속 보여준다(리더 v2 — 실패 시 상자 idle 유지).
  // target_resolving은 상자 대신 로딩을 보여주므로 제외한다.
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

      {/* Layer 5: 로딩 / 오류 (claiming은 상자 열림 연출 + 상태배지로 표시, 전체 오버레이 미사용).
          오류 오버레이가 떠 있으면 로딩을 함께 표시하지 않는다(중첩 방지). */}
      {status === "camera_loading" && !arError ? (
        <ARLoadingOverlay message="카메라를 준비하고 있어요..." />
      ) : null}
      {status === "target_resolving" && !arError ? (
        <ARLoadingOverlay message="주변 보물을 찾고 있어요..." />
      ) : null}

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
                : arError.kind === "target-retry"
                  ? handleTargetRetry
                  : undefined
          }
          secondaryLabel={arError.kind === "map-only" ? "지도에서 보물 찾기" : "지도로 돌아가기"}
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
