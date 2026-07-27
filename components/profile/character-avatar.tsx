/* eslint-disable @next/next/no-img-element */
import type { ProfileCharacter } from "@/lib/profile/mock-data";

/** 어두운 배경 위에서는 아이콘(#1B1B1B 계열)이 묻히므로 반전시킨다. */
export function isDarkColor(hex: string) {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

/** 원본 비율을 지키면서 지정한 높이에 맞춘 크기 */
export function fitIconHeight(width: number, height: number, target: number) {
  return { width: (width * target) / height, height: target };
}

/**
 * 캐릭터 그림 한 장.
 * - `portrait`(랭킹 아바타 초상) — 원을 가득 채우고 색 반전하지 않는다.
 * - `glyph`(단색 선화) — 비율을 지켜 여백을 두고, 어두운 배경에서는 반전한다.
 */
export function CharacterArt({
  character,
  size,
  onDark,
}: {
  character: ProfileCharacter;
  size: number;
  onDark: boolean;
}) {
  if (character.kind === "portrait") {
    // 원을 꽉 채운다(object-cover). avatarScale 로 개별 여백을 줄 수 있다.
    const diameter = size * (character.avatarScale ?? 1);
    return (
      <img
        src={character.icon}
        alt=""
        className="rounded-full object-cover"
        style={{ width: diameter, height: diameter }}
      />
    );
  }

  return (
    <img
      src={character.icon}
      alt=""
      style={fitIconHeight(character.iconWidth ?? size, character.iconHeight ?? size, size * (character.avatarScale ?? 0.5))}
      className={onDark ? "invert" : ""}
    />
  );
}

/**
 * 프로필 아바타 원.
 * 프로필 화면과 프로필 수정 미리보기가 같은 컴포넌트를 써서 항상 동일하게 보인다.
 */
export function CharacterAvatar({
  character,
  color,
  size,
}: {
  character: ProfileCharacter;
  color: string;
  size: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-black"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <CharacterArt character={character} size={size} onDark={isDarkColor(color)} />
    </div>
  );
}
