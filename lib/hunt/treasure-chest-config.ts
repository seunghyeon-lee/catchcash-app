/**
 * 보물상자 3D 설정 (팀원2 — TreasureChest3D)
 *
 * ⚠️ 에셋 교체 지점: 리더가 최종 GLB를 확정하면 아래 두 가지만 바꾸면 됩니다.
 *   1) public/assets/3d/treasure/chest.glb 파일 교체
 *   2) CHEST_CLIP_CANDIDATES 의 "열림/닫힘 애니메이션 이름"을 새 모델 기준으로 수정
 *
 * 현재 값은 개발용 임시 에셋(Quaternius Chest, CC0) 기준입니다. 최종 에셋 아님.
 */

export type ChestVariant = "basic" | "gold" | "mystery";
export type ChestResult = "win" | "lose";

/** GLB 경로 (public 기준 절대경로) */
export const CHEST_GLB_URL = "/assets/3d/treasure/chest.glb";

/**
 * 모델 배치(스케일/위치). 에셋마다 원본 크기·피벗이 달라서 설정값으로 맞춘다.
 * (스킨 모델은 bounding box 자동 정규화가 부정확해 설정값 방식이 안전)
 * ⚠️ 에셋 교체 시 이 두 값만 눈으로 맞추면 됨.
 */
export const CHEST_MODEL = {
  scale: 0.85, // 현재 임시 에셋(Quaternius, 뼈대 scale 100 → 실제 약 2단위) 기준
  position: [0, -0.45, 0] as [number, number, number], // 살짝 아래로 내려 화면 중앙 정렬
} as const;

/**
 * 열림/닫힘 애니메이션 클립 후보 이름.
 * GLB마다 클립 이름이 달라서, 대소문자 무시 부분일치로 매칭한다.
 * 새 에셋에서 이름이 다르면 후보만 추가하면 됨(코드 수정 불필요).
 */
export const CHEST_CLIP_CANDIDATES = {
  open: ["Chest_Open", "Open", "Lid_Open", "ChestOpen", "open"],
  close: ["Chest_Close", "Close", "Lid_Close", "ChestClose", "close"],
} as const;

/** idle(둥실둥실) 동작 파라미터 */
export const CHEST_IDLE = {
  floatAmplitude: 0.08, // 위아래 부유 폭(월드 단위)
  floatSpeed: 1.6, // 부유 속도
  rotationSpeed: 0.25, // 아주 약한 Y축 회전(라디안/초)
} as const;

/** 클릭 직후 흔들림(shake) — 코드 기반. 에셋 애니메이션과 무관 */
export const CHEST_SHAKE = {
  durationSec: 0.22, // 흔들림 지속 시간
  angleRad: 0.12, // 최대 좌우 회전각
  frequency: 34, // 흔들림 빈도
} as const;

/**
 * 뚜껑이 열리기 시작한 뒤, 효과(코인·반짝임·빛·통통튐)가 "다 같이" 터지기까지의 지연.
 * 뚜껑이 살짝 벌어진 뒤 터지도록 하는 값. 0이면 열리는 즉시.
 */
export const CHEST_EFFECT_START_DELAY_SEC = 0.18;

/** 열림 효과 (코인·반짝임·빛·통통튐 공통 — 모두 같은 순간에 시작) */
export const CHEST_EFFECT = {
  win: {
    sparkleCount: 26,
    lightIntensity: 6,
    lightDurationSec: 0.9,
    bounceScale: 1.12, // 살짝 커졌다 돌아오는 bounce 최대 배율
  },
  lose: {
    sparkleCount: 8,
    lightIntensity: 2,
    lightDurationSec: 0.5,
    bounceScale: 1.04,
  },
} as const;

/**
 * 코인 연출 모드.
 * - "burst": 상자가 열리는 순간 코인이 위로 퍼져 솟았다가 중력으로 떨어지며 사라짐(당첨 느낌)
 * - "none": 코인 연출 없음
 */
export type CoinMode = "burst" | "none";

/**
 * 코인 연출 파라미터 (상자 안 금화와 같은 금색 계열).
 * ⚠️ 솟는 최고 높이 ≈ originY + speed²/(2·gravity). 뷰어 상단(약 1.2단위) 밖으로
 * 넘지 않도록 speed를 조절함. 개체별 최대 속도 배율은 코인 컴포넌트에서 1.1배로 제한.
 */
export const CHEST_COINS = {
  /** 코인 크기(반지름) 및 두께 */
  radius: 0.11,
  thickness: 0.028,
  /** 코인 색 — GLB의 Gold 재질과 맞춘 값 */
  color: 0xd9a441,
  emissive: 0x2a1a00,
  /** 분출 시작 위치(상자 입구 부근) */
  originY: 0.5,
  burst: {
    // speed 낮춰 화면 안에서 터지게(잘림 방지), spread 늘려 풍성함 유지
    win: { count: 20, speed: 2.2, spread: 1.9, gravity: 5.2, lifeSec: 1.9, spin: 7 },
    lose: { count: 6, speed: 1.5, spread: 1.1, gravity: 5.2, lifeSec: 1.3, spin: 5 },
  },
} as const;

/**
 * variant별 재질 스타일.
 * 특정 material 이름에 의존하지 않고 "모든 재질"에 균일하게 적용하므로,
 * 최종 에셋이 바뀌어도 3종 구분이 유지된다. (색감 미세조정은 에셋 확정 후)
 */
export type ChestVariantStyle = {
  label: string;
  /** 기존 색을 이 색으로 amount(0~1)만큼 섞음. null이면 원본 색 유지 */
  colorMix: { color: number; amount: number } | null;
  emissive: number; // 발광색 (0x000000이면 발광 없음)
  emissiveIntensity: number;
  /** null이면 원본 metalness/roughness 유지 */
  metalness: number | null;
  roughness: number | null;
  /** 효과용 포인트라이트/스파클 색 */
  accentColor: number;
  sparkleColor: number;
};

export const CHEST_VARIANT_STYLES: Record<ChestVariant, ChestVariantStyle> = {
  basic: {
    label: "Basic",
    colorMix: null, // 원본 나무+금속 그대로
    emissive: 0x000000,
    emissiveIntensity: 0,
    metalness: null,
    roughness: null,
    accentColor: 0xffe6a8,
    sparkleColor: 0xffd76a,
  },
  gold: {
    label: "Gold",
    colorMix: { color: 0xffc23c, amount: 0.5 }, // 금색 포인트
    emissive: 0x3a2600,
    emissiveIntensity: 0.22,
    metalness: 0.85,
    roughness: 0.25,
    accentColor: 0xffcf4d,
    sparkleColor: 0xffe08a,
  },
  mystery: {
    label: "Mystery",
    colorMix: { color: 0x6a3cff, amount: 0.55 }, // 보라 계열
    emissive: 0x3a0a8c, // 은은한 발광
    emissiveIntensity: 0.5,
    metalness: 0.6,
    roughness: 0.4,
    accentColor: 0x8b5cff,
    sparkleColor: 0x00e5ff, // 청록 포인트
  },
};
