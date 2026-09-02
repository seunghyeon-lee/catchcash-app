"use client";

/**
 * TreasureChest3D — 보물상자 3D 오브젝트 (Canvas 내부에서 사용)
 *
 * 동작: 둥실둥실(idle) → 클릭 → 흔들림(shake) → 열림(Open 애니메이션) → 빛/반짝임 → onOpenComplete()
 * - 당첨 판정은 하지 않음. result("win"|"lose")를 외부에서 받아 효과 강도만 다르게 함.
 * - 애니메이션 클립이 없어도 crash하지 않고 완료 콜백으로 넘어감(에셋 교체 안전).
 * - 어떤 크기의 GLB든 자동 정규화(중앙 정렬 + 동일 크기)하여 에셋 교체에 강함.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF, useAnimations, Sparkles } from "@react-three/drei";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

import {
  CHEST_GLB_URL,
  CHEST_MODEL,
  CHEST_CLIP_CANDIDATES,
  CHEST_IDLE,
  CHEST_SHAKE,
  CHEST_EFFECT,
  CHEST_EFFECT_START_DELAY_SEC,
  CHEST_VARIANT_STYLES,
  type ChestVariant,
  type ChestResult,
  type CoinMode,
} from "@/lib/hunt/treasure-chest-config";
import { TreasureChestCoins } from "./TreasureChestCoins";

type Phase = "idle" | "opening" | "opened";

export type TreasureChest3DProps = {
  variant: ChestVariant;
  result?: ChestResult;
  disabled?: boolean;
  /** 값이 바뀌면 닫힘·idle 상태로 리셋(Canvas remount 없이). 초기값은 무시 */
  resetNonce?: number;
  /** 코인 연출 모드 (기본 burst) */
  coinMode?: CoinMode;
  onOpenStart?: () => void;
  onOpenComplete?: () => void;
};

/** GLB 클립 이름 후보를 대소문자 무시 부분일치로 찾는다 */
function resolveClipName(names: string[], candidates: readonly string[]): string | null {
  for (const c of candidates) {
    const hit = names.find((n) => n.toLowerCase().includes(c.toLowerCase()));
    if (hit) return hit;
  }
  return null;
}

export function TreasureChest3D({
  variant,
  result = "win",
  disabled = false,
  resetNonce = 0,
  coinMode = "burst",
  onOpenStart,
  onOpenComplete,
}: TreasureChest3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(CHEST_GLB_URL);

  // 씬 복제(스킨/본 안전) + material 복제(원본 mutate 금지) + 크기 정규화
  const { root, styleTargets } = useMemo(() => {
    const r = cloneSkeleton(scene);

    const targets: {
      mat: THREE.MeshStandardMaterial;
      baseColor: THREE.Color;
      baseMetal: number;
      baseRough: number;
    }[] = [];

    r.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const cloned = mats.map((m) => (m as THREE.Material).clone());
      mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0];
      cloned.forEach((cm) => {
        const std = cm as THREE.MeshStandardMaterial;
        if (std && std.color) {
          targets.push({
            mat: std,
            baseColor: std.color.clone(),
            baseMetal: std.metalness ?? 0,
            baseRough: std.roughness ?? 1,
          });
        }
      });
    });

    // 스케일/위치는 설정값으로 (스킨 모델 bounding box 자동 정규화는 부정확 → 설정값 방식)
    r.scale.setScalar(CHEST_MODEL.scale);
    r.position.set(...CHEST_MODEL.position);

    return { root: r, styleTargets: targets };
  }, [scene]);

  // mixer는 복제된 씬(root)에 직접 바인딩해야 내부 노드(Chest_Top 등)를 찾는다
  const { actions, mixer } = useAnimations(animations, root);
  const clipNames = useMemo(() => animations.map((a) => a.name), [animations]);
  const openClip = useMemo(
    () => resolveClipName(clipNames, CHEST_CLIP_CANDIDATES.open),
    [clipNames],
  );

  // 화면 렌더는 effectStartedAt으로 결정되므로 phase는 ref만 유지(불필요한 리렌더 방지)
  const phaseRef = useRef<Phase>("idle");
  const shakeStartRef = useRef<number | null>(null);
  const openStartedRef = useRef(false);
  const completedRef = useRef(false);
  const lightRef = useRef<THREE.PointLight>(null);

  /**
   * 효과(코인·반짝임·빛·통통튐) 타이밍 — 넷이 "같은 순간"에 시작해야 한다.
   * - scheduled: 터질 예정 시각(뚜껑 열림 시작 + 지연)
   * - startedAt: 실제로 터진 시각. 이 값이 생기는 순간 넷이 동시에 시작한다.
   */
  const effectScheduledRef = useRef<number | null>(null);
  const effectStartedRef = useRef<number | null>(null);
  const [effectStartedAt, setEffectStartedAt] = useState<number | null>(null);

  const style = CHEST_VARIANT_STYLES[variant];
  const effect = CHEST_EFFECT[result];

  const setPhaseBoth = useCallback((p: Phase) => {
    phaseRef.current = p;
  }, []);

  // 열림 완료 처리(중복 방지). finished 이벤트/안전장치 타이머가 공용으로 호출
  const completeOpen = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    // 연출은 이미 열리는 순간에 시작됨. 여기서는 완료 신호(결과 팝업용)만 보낸다.
    setPhaseBoth("opened");
    onOpenComplete?.();
  }, [onOpenComplete, setPhaseBoth]);

  // variant별 재질 스타일 적용 (원본 색 기준으로 매번 재계산)
  useEffect(() => {
    styleTargets.forEach(({ mat, baseColor, baseMetal, baseRough }) => {
      mat.color.copy(baseColor);
      if (style.colorMix) {
        mat.color.lerp(new THREE.Color(style.colorMix.color), style.colorMix.amount);
      }
      if (mat.emissive) {
        mat.emissive.setHex(style.emissive);
        mat.emissiveIntensity = style.emissiveIntensity;
      }
      mat.metalness = style.metalness ?? baseMetal;
      mat.roughness = style.roughness ?? baseRough;
      mat.needsUpdate = true;
    });
  }, [style, styleTargets]);

  // 열림 애니메이션 완료 감지 → onOpenComplete 1회
  useEffect(() => {
    if (!mixer) return;
    const onFinished = () => completeOpen();
    mixer.addEventListener("finished", onFinished);
    return () => mixer.removeEventListener("finished", onFinished);
  }, [mixer, completeOpen]);

  // resetNonce 변경 시 닫힘·idle로 리셋 (Canvas remount 없이). 초기값은 무시
  const firstResetRef = useRef(true);
  useEffect(() => {
    if (firstResetRef.current) {
      firstResetRef.current = false;
      return;
    }
    openStartedRef.current = false;
    completedRef.current = false;
    shakeStartRef.current = null;
    effectScheduledRef.current = null;
    effectStartedRef.current = null;
    setEffectStartedAt(null);
    // 열림 클립을 프레임0(닫힘)에 고정
    if (openClip && actions[openClip]) {
      const a = actions[openClip]!;
      a.paused = false;
      a.reset();
      a.play();
      a.paused = true;
    }
    const g = groupRef.current;
    if (g) {
      g.rotation.z = 0;
      g.scale.setScalar(1);
    }
    setPhaseBoth("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetNonce]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (disabled) return;
      if (phaseRef.current !== "idle") return; // 중복 클릭 방지
      setPhaseBoth("opening");
      shakeStartRef.current = null; // 다음 프레임에서 현재 시각으로 초기화됨
      onOpenStart?.();
    },
    [disabled, onOpenStart, setPhaseBoth],
  );

  const handlePointerOver = useCallback(() => {
    if (!disabled && phaseRef.current === "idle") document.body.style.cursor = "pointer";
  }, [disabled]);
  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = "auto";
  }, []);

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;

    // idle: 둥실둥실 + 아주 약한 회전
    if (phaseRef.current === "idle") {
      g.position.y = Math.sin(t * CHEST_IDLE.floatSpeed) * CHEST_IDLE.floatAmplitude;
      g.rotation.y += delta * CHEST_IDLE.rotationSpeed;
      g.rotation.z = 0;
      g.scale.setScalar(1);
      return;
    }

    // opening: shake 후 open 클립 재생 (return 하지 않고 아래 효과 로직으로 이어짐)
    if (phaseRef.current === "opening") {
      // 흔들림 시작 시각을 첫 프레임에 기록 (null이면 지금이 첫 프레임)
      if (shakeStartRef.current === null) shakeStartRef.current = t;
      const elapsed = t - shakeStartRef.current;
      if (elapsed < CHEST_SHAKE.durationSec) {
        // 흔들리는 동안엔 효과 없음
        const decay = 1 - elapsed / CHEST_SHAKE.durationSec;
        g.position.y = 0;
        g.rotation.z = Math.sin(elapsed * CHEST_SHAKE.frequency) * CHEST_SHAKE.angleRad * decay;
        return;
      }
      g.rotation.z = 0;
      if (!openStartedRef.current) {
        openStartedRef.current = true;
        // 효과가 "다 같이" 터질 시각을 예약 (코인·반짝임·빛·통통튐 공통)
        effectScheduledRef.current = t + CHEST_EFFECT_START_DELAY_SEC;
        if (openClip && actions[openClip]) {
          const action = actions[openClip]!;
          action.paused = false;
          action.reset();
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
          action.play();
          // 안전장치: finished 이벤트를 놓쳐도 재생시간 후 완료 처리
          const dur = action.getClip().duration || 1;
          window.setTimeout(() => completeOpen(), (dur + 0.3) * 1000);
        } else {
          // 열림 클립이 없는 에셋 → crash 금지, 짧게 대기 후 완료 처리
          window.setTimeout(() => completeOpen(), 250);
        }
      }
    }

    // ── 효과 시작 판정: 예약 시각이 되면 넷(코인·반짝임·빛·통통튐)을 동시에 켠다
    const scheduled = effectScheduledRef.current;
    if (scheduled !== null && effectStartedRef.current === null && t >= scheduled) {
      effectStartedRef.current = scheduled;
      setEffectStartedAt(scheduled); // 반짝임·빛 마운트 + 코인에 시작 시각 전달
    }

    // ── 효과 진행: 통통튐 + 포인트라이트 페이드아웃 (코인/반짝임과 같은 기준 시각 사용)
    const fx = effectStartedRef.current;
    if (fx === null) return;
    const bt = t - fx;
    const bounceDur = 0.4;
    let s = 1;
    if (bt < bounceDur) {
      s = 1 + (effect.bounceScale - 1) * Math.sin((bt / bounceDur) * Math.PI);
    }
    g.scale.setScalar(s);
    if (lightRef.current) {
      lightRef.current.intensity =
        bt < effect.lightDurationSec ? effect.lightIntensity * (1 - bt / effect.lightDurationSec) : 0;
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive object={root} />

      {/* 코인·반짝임·빛 — 모두 effectStartedAt(같은 순간)에 시작 */}
      <TreasureChestCoins mode={coinMode} result={result} startedAt={effectStartedAt} />

      {effectStartedAt !== null && (
        <>
          <pointLight
            ref={lightRef}
            position={[0, 1.4, 0.6]}
            color={style.accentColor}
            intensity={0}
            distance={7}
            decay={2}
          />
          <Sparkles
            count={effect.sparkleCount}
            scale={[1.8, 1.4, 1.8]}
            position={[0, 0.9, 0]}
            size={4}
            speed={0.5}
            noise={1}
            color={style.sparkleColor}
          />
        </>
      )}
    </group>
  );
}

// 앱 진입 시 미리 로드(클라이언트 전용 — 이 컴포넌트는 ssr:false로 로드됨)
useGLTF.preload(CHEST_GLB_URL);
