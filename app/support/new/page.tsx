"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { RoughImageFrame } from "@/components/profile/rough-image-frame";
import { RoughMaskFrame } from "@/components/profile/rough-mask-frame";
import { Toast } from "@/components/profile/toast";
import { ProfileTopAppBar } from "@/components/profile/top-app-bar";
import { useToast } from "@/components/profile/use-toast";
import { PROFILE_ASSETS } from "@/lib/profile/assets";
import { SUPPORT_CATEGORIES } from "@/lib/profile/mock-data";
import { createSupportInquiry } from "@/lib/profile/support-service";

const { icons, frames, masks, images } = PROFILE_ASSETS;

/**
 * 입력 제한 — 15_3 정의서 5.4 / 5.5.
 * DB(`support_inquiries.title` 1~120, `content` 1~5000)보다 좁아서 저장이 막힐 일은 없다.
 */
const TITLE_MIN_LENGTH = 2;
const TITLE_MAX_LENGTH = 50;
const CONTENT_MIN_LENGTH = 10;
const CONTENT_MAX_LENGTH = 1000;

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-bold uppercase leading-[18px] tracking-[1.2px] text-black">
      {children}
    </label>
  );
}

/** 입력 길이 표시 — 프로필 수정 화면과 같은 톤으로 맞춘다 */
function FieldCounter({ current, max }: { current: number; max: number }) {
  return (
    <span className="text-xs tracking-[0.6px] text-[#5d5f5f]">
      {current} / {max}자
    </span>
  );
}

/** 문의 작성 화면 — `15_3_Support_Inquiry_Write_Screen` (`/support/new`) */
export default function SupportNewPage() {
  const router = useRouter();
  const { message, show } = useToast();
  const [category, setCategory] = useState<string>(SUPPORT_CATEGORIES[0].key);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const titleTooShort = trimmedTitle.length < TITLE_MIN_LENGTH;
  const contentTooShort = trimmedContent.length < CONTENT_MIN_LENGTH;
  // 빈 칸부터 빨갛게 띄우지는 않는다 — 뭐라도 쓰기 시작한 뒤에만 알려준다.
  const showTitleError = trimmedTitle.length > 0 && titleTooShort;
  const showContentError = trimmedContent.length > 0 && contentTooShort;
  const canSubmit = !titleTooShort && !contentTooShort && !submitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const result = await createSupportInquiry({
      category,
      title: trimmedTitle,
      content: trimmedContent,
    });

    if (!result.ok) {
      setSubmitting(false);
      show(result.errorMessage ?? "문의 접수에 실패했어. 잠시 후 다시 시도해줘.");
      return;
    }

    if (result.source === "mock") {
      // TODO(auth): 인증 전에는 fake user_id를 insert하지 않고 기존 mock 플로우만 유지한다.
      console.log("[CatchCash] mock support submit", { category, title: trimmedTitle, content: trimmedContent });
      show("로그인 연결 전이라 예시 접수로 처리했어.");
      window.setTimeout(() => router.push("/support"), 1200);
      return;
    }

    show("접수됐어. 확인하면 답 줄게.");
    window.setTimeout(() => router.push(`/support/${result.inquiryId}`), 1200);
  };

  return (
    <>
      {/* 배경 종이 질감은 리스트(15_1)·상세(15_2)와 같은 타일을 쓴다 — 문의 3화면 배경을 통일한다. */}
      <section
        className="min-h-screen bg-[#f7f5ef] bg-[length:523px_384px] bg-repeat pb-28"
        style={{ backgroundImage: `url("${images.supportPaperGrain}")` }}
      >
        {/*
          헤더도 리스트·상세와 같은 공통 GNB 를 쓴다.
          15_3 정의서 5.1 은 "우측 없음"이지만, 공통 GNB 문서(00_Common_Top_Navigation_GNB 6-2)가
          `/support/new` 를 Type B(뒤로가기 + 타이틀 + 알림/도움말/설정)로 지정했고
          같은 플로우 안에서 이 화면만 헤더가 달라 보이던 문제도 함께 없어진다.
        */}
        <ProfileTopAppBar backHref="/support" title="뭐가 문젠데?" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 px-5 pt-8">
          <div>
            <h2 className="text-base font-bold leading-5 text-black">무슨 일이야?</h2>
            <p className="mt-2 text-base font-bold leading-6 text-black opacity-90">일단 써봐. 바쁘니까 짧게.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <FieldLabel htmlFor="category">대충 골라봐</FieldLabel>
              <RoughImageFrame src={frames.supportCategorySelect} className="mt-3 w-full">
                <div className="flex items-center px-8 py-5">
                  <select
                    id="category"
                    name="category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full appearance-none bg-transparent text-base leading-6 text-black outline-none"
                  >
                    {SUPPORT_CATEGORIES.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <img
                    src={icons.supportChevronDown}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none ml-2 h-[7.4px] w-3 shrink-0"
                  />
                </div>
              </RoughImageFrame>
            </div>

            {/*
              정의서 5.4 가 지정한 제목 입력 전용 프레임은 Figma에 없다.
              회색 1px 테두리는 이 화면에서 유일하게 흑백 rough 톤을 벗어나 있어서,
              바로 위 카테고리 필드와 같은 rough 프레임을 씌워 한 쌍으로 보이게 맞춘다.
            */}
            <div>
              <div className="flex items-end justify-between">
                <FieldLabel htmlFor="title">한 줄 요약</FieldLabel>
                <FieldCounter current={trimmedTitle.length} max={TITLE_MAX_LENGTH} />
              </div>
              <RoughImageFrame src={frames.supportCategorySelect} className="mt-3 w-full">
                <input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="한 줄로 요약해"
                  maxLength={TITLE_MAX_LENGTH}
                  autoComplete="off"
                  aria-invalid={showTitleError}
                  aria-describedby={showTitleError ? "title-error" : undefined}
                  className="w-full bg-transparent px-8 py-5 text-base leading-6 text-black outline-none placeholder:text-soft"
                />
              </RoughImageFrame>
              {showTitleError ? (
                <p id="title-error" className="mt-2 text-xs leading-[18px] text-[#dc2626]">
                  {TITLE_MIN_LENGTH}자 이상 써라.
                </p>
              ) : null}
            </div>

            {/*
              textarea 는 세로로 길어서 카테고리 프레임(350x66)을 늘리면 선 굵기가 뭉개진다.
              대신 상세 화면 답변 카드와 같은 사각 마스크를 씌운다 — 마스크는 꼭짓점 4개짜리라
              어떤 높이로 늘려도 손그림 실루엣이 유지된다.
            */}
            <div>
              <div className="flex items-end justify-between">
                <FieldLabel htmlFor="content">핵심 요약</FieldLabel>
                <FieldCounter current={trimmedContent.length} max={CONTENT_MAX_LENGTH} />
              </div>
              <RoughMaskFrame
                src={masks.supportAdminReplyCard}
                className="mt-3 border-[3px] border-black bg-white p-4"
              >
                <textarea
                  id="content"
                  name="content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="길게 쓰면 안 읽는다. 핵심만 써."
                  maxLength={CONTENT_MAX_LENGTH}
                  rows={7}
                  aria-invalid={showContentError}
                  aria-describedby={showContentError ? "content-error" : undefined}
                  className="block w-full resize-none bg-transparent text-base leading-6 text-black outline-none placeholder:text-soft"
                />
              </RoughMaskFrame>
              {showContentError ? (
                <p id="content-error" className="mt-2 text-xs leading-[18px] text-[#dc2626]">
                  {CONTENT_MIN_LENGTH}자는 채워야 뭘 확인할 수 있다.
                </p>
              ) : null}
            </div>

            {/* 점선 rough 에셋은 없어 CSS 유지. 반경만 걷어내 다른 카드들과 각을 맞춘다. */}
            <div className="border-2 border-dashed border-black bg-white/60 p-5">
              <div className="flex items-center gap-2">
                <img src={icons.supportWarning} alt="" className="h-[11.083px] w-[12.833px] shrink-0" />
                <span className="text-base leading-6 text-black">똑바로 읽어</span>
              </div>
              <p className="mt-1.5 text-[13px] leading-[21.13px] text-black">
                쿠폰 안 들어왔으면 언제 뭐 샀는지 똑바로 써라. 그래야 빨리 확인한다.
              </p>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="block w-full transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40"
            >
              <RoughImageFrame src={frames.supportSubmitButton} className="w-full">
                <span className="block px-4 py-5 text-center text-base uppercase leading-6 text-white">
                  {submitting ? "던지는 중..." : "던져놓기"}
                </span>
              </RoughImageFrame>
            </button>
          </div>
        </form>

        {message ? <Toast message={message} /> : null}
      </section>

      {/* BNB 문서 5-1: `/support/new` 도 내정보 탭 active — 리스트·상세와 같은 탭바를 붙인다 */}
      <BottomNav />
    </>
  );
}
