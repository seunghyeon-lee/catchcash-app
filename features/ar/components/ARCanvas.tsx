"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import type { Mesh } from "three";

import type { ChestResult, ChestVariant } from "@/features/ar/types/ar.types";

type ChestProps = {
  variant: ChestVariant;
  result?: ChestResult;
  disabled?: boolean;
  onTap?: () => void;
  onOpenStart?: () => void;
  onOpenComplete?: () => void;
};

const VARIANT_COLOR: Record<ChestVariant, string> = {
  basic: "#c9a06a",
  gold: "#f5b400",
  mystery: "#7c5cff",
};

/**
 * ⚠️ 임시 fallback 상자.
 * 팀원2 `components/hunt/TreasureChest3D.tsx` 병합 전까지만 사용한다.
 * 병합 후 이 mesh를 <TreasureChest3D .../>로 교체하면 되고, 부모(ARCanvas/page) 계약은 동일하다.
 * 여기에 GLB 로딩/복잡한 Open 로직을 넣지 않는다(팀원2 소유 영역).
 *
 * 계약(04 문서): variant / result / disabled / onOpenStart / onOpenComplete + onTap.
 * result가 세팅되면 Open 연출(짧은 shake → 확대) 후 onOpenComplete를 1회 호출한다.
 */
function FallbackChest({ variant, result, disabled, onTap, onOpenStart, onOpenComplete }: ChestProps) {
  const meshRef = useRef<Mesh>(null);
  const [opening, setOpening] = useState(false);
  const openStartRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (result && !opening) {
      setOpening(true);
      onOpenStart?.();
    }
  }, [result, opening, onOpenStart]);

  useFrame((frame, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (!opening) {
      // Idle floating + 느린 회전.
      mesh.position.y = Math.sin(frame.clock.elapsedTime * 1.5) * 0.15;
      mesh.rotation.y += delta * 0.5;
      return;
    }

    if (openStartRef.current === null) openStartRef.current = frame.clock.elapsedTime;
    const t = frame.clock.elapsedTime - openStartRef.current;

    if (t < 0.5) {
      mesh.rotation.z = Math.sin(t * 40) * 0.15; // shake
    } else {
      mesh.rotation.z = 0;
      mesh.scale.setScalar(1 + (t - 0.5) * 1.2); // 확대
    }

    if (t >= 1.4 && !firedRef.current) {
      firedRef.current = true;
      onOpenComplete?.();
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerDown={(event) => {
        event.stopPropagation();
        if (disabled || opening) return;
        onTap?.();
      }}
    >
      <boxGeometry args={[1.2, 1, 1]} />
      <meshStandardMaterial color={VARIANT_COLOR[variant]} />
    </mesh>
  );
}

/**
 * 투명 R3F Canvas (공식 명세 6·8장). 카메라 영상 위에 3D 상자를 중앙 배치한다.
 * gl.alpha=true로 배경을 투명하게 유지해 카메라가 비치게 한다.
 */
export function ARCanvas(props: ChestProps) {
  return (
    <Canvas
      className="absolute inset-0"
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 4], fov: 50 }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 2]} intensity={1.1} />
      <Suspense fallback={null}>
        {/* 병합 후 교체 지점: <TreasureChest3D {...props} /> */}
        <FallbackChest {...props} />
      </Suspense>
    </Canvas>
  );
}
