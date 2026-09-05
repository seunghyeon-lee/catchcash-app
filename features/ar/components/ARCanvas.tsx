"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

import { TreasureChest3D } from "@/components/hunt/TreasureChest3D";
import type { ChestResult, ChestVariant } from "@/features/ar/types/ar.types";

type ARCanvasProps = {
  variant: ChestVariant;
  result?: ChestResult;
  disabled?: boolean;
  /** 값이 바뀌면 상자를 닫힘·idle로 리셋(운영/검증 실패 시 사용). */
  resetNonce?: number;
  onOpenStart?: () => void;
  onOpenComplete?: () => void;
};

/**
 * 투명 R3F Canvas (공식 명세 6·8장). 카메라 영상 위에 팀원2 TreasureChest3D를 배치한다.
 * 카메라/조명은 팀원2 TreasureChestScene 기준을 그대로 채용(모바일 최적화, shadow 미사용).
 * 상자 탭 감지·open 연출은 TreasureChest3D가 담당하고, AR은 onOpenStart/onOpenComplete만 받는다.
 */
export function ARCanvas({
  variant,
  result,
  disabled,
  resetNonce,
  onOpenStart,
  onOpenComplete,
}: ARCanvasProps) {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={[1, 1.8]}
      shadows={false}
      camera={{ position: [0, 0.5, 3.5], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <hemisphereLight args={[0xffffff, 0x444455, 0.9]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 2]} intensity={1.1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />

      <Suspense fallback={null}>
        <TreasureChest3D
          variant={variant}
          result={result}
          disabled={disabled}
          resetNonce={resetNonce}
          onOpenStart={onOpenStart}
          onOpenComplete={onOpenComplete}
        />
      </Suspense>
    </Canvas>
  );
}
