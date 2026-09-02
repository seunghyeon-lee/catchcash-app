"use client";

/**
 * TreasureChestCoins — 상자가 열릴 때 코인이 위로 퍼져 솟았다가 떨어지며 사라지는 연출(burst).
 *
 * - 상자 GLB의 금화는 메시에 고정되어 분리 불가 → 코인은 코드로 생성.
 * - 성능: InstancedMesh 1개로 전체 코인을 그린다(드로우콜 1회) — 모바일 부담 최소.
 * - WIN/LOSE에 따라 개수·세기 차등.
 */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { CHEST_COINS, type CoinMode, type ChestResult } from "@/lib/hunt/treasure-chest-config";

type Props = {
  mode: CoinMode;
  result: ChestResult;
  /** 연출 시작 시각(초). null이면 아직 시작 전 */
  startedAt: number | null;
};

type CoinSeed = {
  vx: number;
  vy: number;
  vz: number;
  delay: number;
  spinAxis: THREE.Vector3;
  spinSpeed: number;
  tilt: number;
};

const dummy = new THREE.Object3D();

export function TreasureChestCoins({ mode, result, startedAt }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const cfg = CHEST_COINS.burst[result];
  const count = mode === "none" ? 0 : cfg.count;

  // 코인별 랜덤 시드 (마운트 시 1회 — 매 프레임 랜덤 금지)
  const seeds = useMemo<CoinSeed[]>(() => {
    const list: CoinSeed[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / Math.max(count, 1)) * Math.PI * 2 + Math.random() * 0.5;
      const horiz = Math.random() * cfg.spread;
      // 수직 속도 배율은 1.1배로 제한 → 최고 높이가 화면 밖으로 안 나가게
      const vyMul = 0.8 + Math.random() * 0.3;
      list.push({
        vx: Math.cos(angle) * horiz,
        vy: cfg.speed * vyMul,
        vz: Math.sin(angle) * horiz,
        delay: Math.random() * 0.12,
        spinAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        spinSpeed: cfg.spin * (0.6 + Math.random() * 0.8),
        tilt: Math.random() * Math.PI,
      });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, result]);

  const geometry = useMemo(
    () => new THREE.CylinderGeometry(CHEST_COINS.radius, CHEST_COINS.radius, CHEST_COINS.thickness, 14),
    [],
  );
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CHEST_COINS.color,
        emissive: CHEST_COINS.emissive,
        emissiveIntensity: 0.35,
        metalness: 0.9,
        roughness: 0.28,
        transparent: true,
      }),
    [],
  );

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;

    // 아직 시작 전이면 전부 숨김
    if (startedAt === null) {
      for (let i = 0; i < count; i++) {
        dummy.position.set(0, -999, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      return;
    }

    const elapsedAll = state.clock.elapsedTime - startedAt;

    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      const t = elapsedAll - s.delay;

      if (t <= 0) {
        dummy.position.set(0, -999, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      // 포물선 운동: p = v*t - 0.5*g*t^2
      const x = s.vx * t;
      const y = CHEST_COINS.originY + s.vy * t - 0.5 * cfg.gravity * t * t;
      const z = s.vz * t;
      const life = t / cfg.lifeSec;
      // 수명 끝나면 숨김, 끝물엔 작아지며 사라짐
      const scale = life >= 1 ? 0 : life > 0.7 ? 1 - (life - 0.7) / 0.3 : 1;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(scale);
      // 회전(코인이 뒤집히며 반짝이도록)
      dummy.rotation.set(0, 0, 0);
      dummy.rotateOnAxis(s.spinAxis, s.tilt + t * s.spinSpeed);
      dummy.rotateX(Math.PI / 2); // 실린더를 세워 동전처럼

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />;
}
