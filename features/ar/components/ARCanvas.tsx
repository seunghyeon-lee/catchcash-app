"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

import { TreasureChest3D } from "@/components/hunt/TreasureChest3D";
import type { ChestResult, ChestVariant } from "@/features/ar/types/ar.types";

type ARCanvasProps = {
  visible: boolean;
  xOffset: number;
  distanceMeters: number;
  variant: ChestVariant;
  result?: ChestResult;
  disabled?: boolean;
  /** controlled 열림 승인 신호. 정상 claim(SUCCESS/EMPTY) 후 증가시켜 open을 시작한다. */
  openSignal?: number;
  /** 상자 탭 순간 호출(AR이 GPS/RPC를 실행하는 신호). */
  onTap?: () => void;
  onOpenComplete?: () => void;
};

const CHEST_X_RANGE = 1.3;
const MIN_SCALE = 0.2;
const MAX_SCALE = 1.0;
const MAX_VISUAL_DISTANCE_METERS = 100;
const MAX_DEPTH_OFFSET_Z = -0.45;
const DISTANCE_SCALE_STOPS = [
  { distanceMeters: 0, scale: 1.0 },
  { distanceMeters: 10, scale: 1.0 },
  { distanceMeters: 30, scale: 0.8 },
  { distanceMeters: 50, scale: 0.55 },
  { distanceMeters: 75, scale: 0.35 },
  { distanceMeters: 100, scale: 0.2 },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampXOffset(value: number) {
  return clamp(value, -1, 1);
}

function clampVisualDistance(distanceMeters: number) {
  if (!Number.isFinite(distanceMeters)) return MAX_VISUAL_DISTANCE_METERS;
  return clamp(distanceMeters, 0, MAX_VISUAL_DISTANCE_METERS);
}

function calculateChestScale(distanceMeters: number) {
  const distance = clampVisualDistance(distanceMeters);

  for (let index = 1; index < DISTANCE_SCALE_STOPS.length; index += 1) {
    const previous = DISTANCE_SCALE_STOPS[index - 1];
    const next = DISTANCE_SCALE_STOPS[index];
    if (distance > next.distanceMeters) continue;

    const segmentLength = next.distanceMeters - previous.distanceMeters;
    const progress = segmentLength === 0 ? 0 : (distance - previous.distanceMeters) / segmentLength;
    const scale = previous.scale + (next.scale - previous.scale) * progress;
    return clamp(scale, MIN_SCALE, MAX_SCALE);
  }

  return MIN_SCALE;
}

function calculateChestDepthOffsetZ(distanceMeters: number) {
  const distance = clampVisualDistance(distanceMeters);
  return (distance / MAX_VISUAL_DISTANCE_METERS) * MAX_DEPTH_OFFSET_Z;
}

/**
 * 투명 R3F Canvas (공식 명세 6·8장). 카메라 영상 위에 팀원2 TreasureChest3D를 배치한다.
 * controlled 모드: 탭은 onTap만 알리고 즉시 열지 않는다. 서버 claim 성공을 확인한 뒤
 * openSignal을 증가시켜야 열림 연출이 시작된다(운영/검증 실패 시 상자는 idle 유지).
 * 카메라/조명은 팀원2 TreasureChestScene 기준을 그대로 채용(모바일 최적화, shadow 미사용).
 */
export function ARCanvas({
  visible,
  xOffset,
  distanceMeters,
  variant,
  result,
  disabled,
  openSignal,
  onTap,
  onOpenComplete,
}: ARCanvasProps) {
  if (!visible) return null;

  const chestWorldX = clampXOffset(xOffset) * CHEST_X_RANGE;
  const chestScale = calculateChestScale(distanceMeters);
  const chestWorldZ = calculateChestDepthOffsetZ(distanceMeters);

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
        <group position={[chestWorldX, 0, chestWorldZ]} scale={[chestScale, chestScale, chestScale]}>
          <TreasureChest3D
            variant={variant}
            result={result}
            disabled={disabled}
            controlled
            openSignal={openSignal}
            onTap={onTap}
            onOpenComplete={onOpenComplete}
          />
        </group>
      </Suspense>
    </Canvas>
  );
}
