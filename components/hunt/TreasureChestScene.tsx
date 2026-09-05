"use client";

/**
 * TreasureChestScene — TreasureChest3D를 감싸는 R3F Canvas.
 * 모바일 최적화: DPR 상한, shadow 미사용, 조명 최소(외부 HDR 미사용 → 오프라인/Capacitor 안전).
 * AR 화면에서 재사용 시 이 Scene 대신 AR용 Canvas에 TreasureChest3D만 넣으면 됨.
 */

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import { TreasureChest3D, type TreasureChest3DProps } from "./TreasureChest3D";

export type TreasureChestSceneProps = TreasureChest3DProps & {
  /** 개발/테스트용 카메라 조작(드래그 회전). 실제 앱/AR에서는 false */
  enableControls?: boolean;
  className?: string;
};

export function TreasureChestScene({
  enableControls = false,
  className,
  ...chestProps
}: TreasureChestSceneProps) {
  return (
    <Canvas
      className={className}
      dpr={[1, 1.8]} // 모바일에서 과도한 DPR 방지
      shadows={false}
      camera={{ position: [0, 0.5, 3.5], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <hemisphereLight args={[0xffffff, 0x444455, 0.9]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 2]} intensity={1.1} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />

      <Suspense fallback={null}>
        <TreasureChest3D {...chestProps} />
      </Suspense>

      {enableControls && (
        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={6}
          target={[0, 0.2, 0]}
        />
      )}
    </Canvas>
  );
}
