"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useState } from "react";

import { NotificationInbox } from "@/components/notification/inbox";
import { PROFILE_ASSETS } from "@/lib/profile/assets";

const { icons } = PROFILE_ASSETS;

/**
 * 프로필/문의 화면 상단 GNB.
 * Figma: 10_My_Profile_Screen > "Header - TopAppBar" (1:2444)
 *
 * 우측 3개 아이콘 동작은 홈(`components/top-bar`)과 동일하게 맞춘다.
 * - 알림 → 알림함 팝업 (`04_1_Notification_Inbox_Screen`)
 * - 도움말 → `/guide` (`04_2_CatchCash_Guide_Screen`)
 * - 설정 → `/profile`
 *
 * 알림함 상태를 화면이 아니라 이 컴포넌트가 들고 있어서, 이 GNB를 붙인 화면은
 * 별도 배선 없이 알림 아이콘이 바로 동작한다.
 */
export function ProfileTopAppBar({
  backHref,
  title = "catch cash",
}: {
  backHref?: string;
  /** 화면별 타이틀. 기본은 서비스명이고, 15_2 문의 상세는 `뭐라카노 답변`을 쓴다. */
  title?: string;
}) {
  const router = useRouter();
  const [inboxOpen, setInboxOpen] = useState(false);

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center border-b-2 border-black bg-[#f7f5ef] px-5">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={handleBack}
          className="mr-4 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-black transition-transform active:translate-x-0.5 active:translate-y-0.5"
        >
          <img src={icons.backCircle} alt="" className="size-[17.7px]" />
        </button>

        <h1 className="flex-1 truncate text-xl font-bold lowercase leading-[31.2px] tracking-tight text-black">
          {title}
        </h1>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="알림"
            onClick={() => setInboxOpen(true)}
            className="flex items-center justify-center"
          >
            <img src={icons.gnbNotification} alt="" className="h-5 w-4" />
          </button>
          <button
            type="button"
            aria-label="도움말"
            onClick={() => router.push("/guide")}
            className="flex items-center justify-center"
          >
            <img src={icons.gnbHelp} alt="" className="size-5" />
          </button>
          <button
            type="button"
            aria-label="설정"
            onClick={() => router.push("/profile")}
            className="flex items-center justify-center"
          >
            <img src={icons.gnbSetting} alt="" className="h-5 w-[20.1px]" />
          </button>
        </div>
      </header>

      <NotificationInbox open={inboxOpen} onClose={() => setInboxOpen(false)} />
    </>
  );
}
