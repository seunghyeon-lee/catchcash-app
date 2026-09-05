"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

import { TreasureChest3D } from "@/components/hunt/TreasureChest3D";
import type { ChestResult, ChestVariant } from "@/features/ar/types/ar.types";

type ARCanvasProps = {
  variant: ChestVariant;
  result?: ChestResult;
  disabled?: boolean;
  /** controlled 열림 승인 신호. 정상 claim(SUCCESS/EMPTY) 후 증가시켜 open을 시작한다. */
  openSignal?: number;
  /** 상자 탭 순간 호출(AR이 GPS/RPC를 실행하는 신호). */
  onTap?: () => void;
  onOpenComplete?: () => void;
};

/**
 * 투명 R3F Canvas (공식 명세 6·8장). 카메라 영상 위에 팀원2 TreasureChest3D를 배치한다.
 * controlled 모드: 탭은 onTap만 알리고 즉시 열지 않는다. 서버 claim 성공을 확인한 뒤
 * openSignal을 증가시켜야 열림 연출이 시작된다(운영/검증 실패 시 상자는 idle 유지).
 * 카메라/조명은 팀원2 TreasureChestScene 기준을 그대로 채용(모바일 최적화, shadow 미사용).
 */
export function ARCanvas({
  variant,
  result,
  disabled,
  openSignal,
  onTap,
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
          controlled
          openSignal={openSignal}
          onTap={onTap}
          onOpenComplete={onOpenComplete}
        />
      </Suspense>
    </Canvas>
  );
}
