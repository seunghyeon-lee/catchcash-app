"use client";

/* eslint-disable @next/next/no-img-element */
import { RoughImageFrame } from "@/components/profile/rough-image-frame";
import { PROFILE_ASSETS } from "@/lib/profile/assets";

const { icons, frames } = PROFILE_ASSETS;

/**
 * 로그아웃 확인 팝업 (Mock: 확인 시 로그인 화면으로 이동).
 * Figma: 14_Logout_Confirm_Popup (1:2786)
 */
export function LogoutConfirmPopup({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[480px] items-center justify-center px-5">
      <button type="button" aria-label="닫기" onClick={onCancel} className="absolute inset-0 bg-black/60" />

      <RoughImageFrame
        src={frames.logoutPopupSheet}
        className="w-full max-w-[348px]"
        style={{ filter: "drop-shadow(0 8px 0 rgba(0,0,0,0.08))" }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="로그아웃 확인"
          className="flex flex-col items-center px-6 pb-12 pt-9"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={onCancel}
            className="absolute right-3 top-1 flex h-8 w-[33px] items-center justify-center rounded-full border-2 border-black bg-white p-0.5 transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <img src={icons.closeCircle} alt="" className="size-[11.667px]" />
          </button>

          <img src={icons.logoutWarning} alt="" className="mt-12 size-32" />

          <h2 className="mt-9 -rotate-[0.5deg] text-2xl leading-[31.2px] text-black">진짜 나가게?</h2>
          <p className="mt-1.5 -rotate-[0.5deg] text-sm leading-[19.6px] tracking-[0.7px] text-[#5d5f5f]">
            다시 들어오려면 로그인해야 한다.
          </p>

          <button
            type="button"
            onClick={onConfirm}
            className="mt-8 block w-full transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <RoughImageFrame src={frames.logoutPopupButtonRed} className="w-full">
              <span className="block px-4 py-5 text-center text-base uppercase leading-6 text-black">로그아웃</span>
            </RoughImageFrame>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="mt-2 block w-full transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <RoughImageFrame src={frames.logoutPopupButtonWhite} className="w-full">
              <span className="block px-4 py-5 text-center text-base uppercase leading-6 text-black">닫기</span>
            </RoughImageFrame>
          </button>
        </div>
      </RoughImageFrame>
    </div>
  );
}
