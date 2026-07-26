"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { BottomTab } from "@/components/bottom-tab";
import { CharacterArt, CharacterAvatar, isDarkColor } from "@/components/profile/character-avatar";
import { RoughImageFrame } from "@/components/profile/rough-image-frame";
import { Toast } from "@/components/profile/toast";
import { ProfileTopAppBar } from "@/components/profile/top-app-bar";
import { useHorizontalWheel } from "@/components/profile/use-horizontal-wheel";
import { useToast } from "@/components/profile/use-toast";
import { PROFILE_ASSETS } from "@/lib/profile/assets";
import {
  findCharacter,
  findColor,
  MOCK_PROFILE,
  NICKNAME_MAX_LENGTH,
  PROFILE_CHARACTERS,
  PROFILE_COLOR_OPTIONS,
  validateNickname,
  type ProfileCharacter,
} from "@/lib/profile/mock-data";

const { icons, frames, images } = PROFILE_ASSETS;

/**
 * 선택 표시 체크. 아이콘이 "원 테두리 + 체크"(속이 빈 링)라
 * 뒤에 배경 원을 깔지 않고 카드 배경 밝기에 따라 색만 바꾼다.
 */
function SelectedCheck({ onDark }: { onDark: boolean }) {
  return (
    <img
      src={onDark ? icons.editCheckWhite : icons.editCheckDark}
      alt=""
      className="absolute right-1 top-1 h-[15.667px] w-[11.667px]"
    />
  );
}

/** 캐릭터 선택 카드 (Figma: "Character Card", 112x112 — 선택 시 검정 배경 + 흰 체크) */
function CharacterCard({
  character,
  selected,
  onClick,
}: {
  character: ProfileCharacter;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`relative flex size-28 shrink-0 flex-col items-center justify-center gap-1 rounded p-1 transition-transform active:translate-y-0.5 ${
        selected ? "border-4 border-black bg-black" : "border-2 border-black bg-white"
      }`}
    >
      <span className="flex size-12 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-white">
        <CharacterArt character={character} size={44} onDark={false} />
      </span>
      <span className={`text-xs tracking-[0.6px] ${selected ? "text-white" : "text-[#1b1b1b]"}`}>
        {character.label}
      </span>
      {selected ? <SelectedCheck onDark /> : null}
    </button>
  );
}

/**
 * 색상 선택 카드. 고른 색이 가려지지 않도록 배경은 항상 해당 색으로 두고,
 * 선택 표시는 굵은 테두리 + 체크로 처리한다.
 */
function ColorCard({
  label,
  value,
  selected,
  onClick,
}: {
  label: string;
  value: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`${label} 색상`}
      aria-pressed={selected}
      onClick={onClick}
      style={{ backgroundColor: value }}
      className={`relative size-28 shrink-0 rounded transition-transform active:translate-y-0.5 ${
        selected ? "border-4 border-black" : "border-2 border-black"
      }`}
    >
      {selected ? <SelectedCheck onDark={isDarkColor(value)} /> : null}
    </button>
  );
}

export default function ProfileEditPage() {
  const router = useRouter();
  const { message, show } = useToast();
  // 수정 화면은 현재 프로필에서 시작한다 — 프로필 화면과 같은 소스.
  const [nickname, setNickname] = useState<string>(MOCK_PROFILE.nickname);
  const [characterKey, setCharacterKey] = useState<string>(MOCK_PROFILE.characterKey);
  const [colorKey, setColorKey] = useState<string>(MOCK_PROFILE.colorKey);
  const [saving, setSaving] = useState(false);

  // 데스크톱에서 마우스 휠로 캐릭터/색상 스트립을 넘길 수 있게 한다.
  const characterStripRef = useHorizontalWheel<HTMLDivElement>();
  const colorStripRef = useHorizontalWheel<HTMLDivElement>();

  const trimmedNickname = nickname.trim();
  const nicknameError = validateNickname(nickname);
  // 비어 있는 상태부터 빨갛게 띄우지는 않는다.
  const showNicknameError = trimmedNickname.length > 0 && nicknameError !== null;
  const canSave = nicknameError === null && !saving;

  // 미리보기는 선택한 캐릭터의 아이콘·소개 문구 + 선택한 색상을 그대로 반영한다.
  const selectedCharacter = findCharacter(characterKey);
  const selectedColor = findColor(colorKey);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    setSaving(true);
    // Mock: 실제 저장 없이 UI 상태만 처리 (다음 단계에서 Supabase update로 교체)
    console.log("[CatchCash] mock profile save", { nickname: trimmedNickname, characterKey, colorKey });
    show("저장했다");
    window.setTimeout(() => router.push("/profile"), 900);
  };

  return (
    <>
      <section
        className="min-h-screen bg-[#f7f5ef] pb-28"
        style={{ backgroundImage: `url("${images.editBgPattern}")`, backgroundSize: "8px 8px" }}
      >
        <ProfileTopAppBar backHref="/profile" onGnbClick={() => show("곧 만들어 준다")} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 px-5 pt-6">
          {/* 미리보기 카드 */}
          <RoughImageFrame src={frames.editPreviewCard} className="w-full">
            <div className="flex flex-col items-center px-6 pb-9 pt-5">
              <CharacterAvatar character={selectedCharacter} color={selectedColor.value} size={128} />
              <p className="mt-4 text-2xl leading-[31.2px] text-[#1b1b1b]">{trimmedNickname || "이름 없음"}</p>
              <p className="mt-1 text-sm leading-[19.6px] tracking-[0.7px] text-[#5d5f5f]">
                {selectedCharacter.tagline}
              </p>
            </div>
          </RoughImageFrame>

          {/*
            캐릭터/색상 선택.
            fieldset은 UA 스타일 min-inline-size:min-content 때문에 가로 스크롤이 막히므로
            div + role="group" 으로 쓴다. 카드가 화면보다 넓으면 가로 스크롤된다.
          */}
          <div role="group" aria-labelledby="character-label" className="min-w-0">
            <p id="character-label" className="text-sm leading-[19.6px] tracking-[0.7px] text-[#1b1b1b]">
              캐릭터 선택
            </p>
            <div ref={characterStripRef} className="-mx-5 mt-3 flex gap-4 overflow-x-auto px-5 pb-2">
              {PROFILE_CHARACTERS.map((character) => (
                <CharacterCard
                  key={character.key}
                  character={character}
                  selected={characterKey === character.key}
                  onClick={() => setCharacterKey(character.key)}
                />
              ))}
            </div>
          </div>

          <div role="group" aria-labelledby="color-label" className="min-w-0">
            <p id="color-label" className="text-sm leading-[19.6px] tracking-[0.7px] text-[#1b1b1b]">
              색상 선택
            </p>
            <div ref={colorStripRef} className="-mx-5 mt-3 flex gap-4 overflow-x-auto px-5 pb-2">
              {PROFILE_COLOR_OPTIONS.map((color) => (
                <ColorCard
                  key={color.key}
                  label={color.label}
                  value={color.value}
                  selected={colorKey === color.key}
                  onClick={() => setColorKey(color.key)}
                />
              ))}
            </div>
          </div>

          {/* 닉네임 */}
          <div>
            <div className="flex items-end justify-between">
              <label htmlFor="nickname" className="text-sm leading-[19.6px] tracking-[0.7px] text-[#1b1b1b]">
                닉네임
              </label>
              <span className="text-xs tracking-[0.6px] text-[#5d5f5f]">
                {trimmedNickname.length} / {NICKNAME_MAX_LENGTH}자
              </span>
            </div>
            <div
              className={`mt-3 rounded border-2 bg-white p-2.5 ${
                showNicknameError ? "border-[#dc2626]" : "border-black"
              }`}
            >
              <input
                id="nickname"
                name="nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={NICKNAME_MAX_LENGTH}
                autoComplete="off"
                placeholder="이름 정해라"
                aria-invalid={showNicknameError}
                aria-describedby={showNicknameError ? "nickname-error" : undefined}
                className="w-full bg-transparent px-2 py-1 text-lg leading-[28.8px] text-[#1b1b1b] outline-none placeholder:text-[#9ca3af]"
              />
            </div>
            {showNicknameError ? (
              <p id="nickname-error" className="mt-2 text-xs leading-[18px] text-[#dc2626]">
                {nicknameError}
              </p>
            ) : null}
          </div>

          {/* 안내 카드 */}
          <div className="flex items-start gap-3 rounded border-2 border-black bg-[#e8e8e8] px-3.5 pb-3.5 pt-4">
            <img src={icons.editInfo} alt="" className="mt-0.5 h-6 w-5 shrink-0" />
            <p className="text-sm leading-[22.75px] tracking-[0.7px] text-[#4c4546]">
              캐릭터와 닉네임은 랭킹과 보관함에 표시된다. 신중하게 선택해라.
            </p>
          </div>

          {/* 저장 */}
          <button
            type="submit"
            disabled={!canSave}
            className="block w-full transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40"
          >
            <RoughImageFrame src={frames.saveButtonBlack} className="w-full">
              <span className="block px-4 py-5 text-center text-base uppercase leading-6 text-white">
                {saving ? "저장 중..." : "저장한다"}
              </span>
            </RoughImageFrame>
          </button>
        </form>
      </section>

      <BottomTab />

      {message ? <Toast message={message} /> : null}
    </>
  );
}
