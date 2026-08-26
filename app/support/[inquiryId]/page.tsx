"use client";

/* eslint-disable @next/next/no-img-element */
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { RoughMaskFrame } from "@/components/profile/rough-mask-frame";
import { SupportStatusStamp } from "@/components/profile/support-status-stamp";
import { ProfileTopAppBar } from "@/components/profile/top-app-bar";
import { PROFILE_ASSETS } from "@/lib/profile/assets";
import { formatAnswerLabel, resolveAnswerWaitingText, type SupportInquiry } from "@/lib/profile/support-mock";
import { getSupportInquiry } from "@/lib/profile/support-service";

const { icons, masks, images } = PROFILE_ASSETS;

const SCREEN_BG = "min-h-screen bg-[#f7f5ef] bg-[length:523px_384px] bg-repeat";
const SCREEN_BG_STYLE = { backgroundImage: `url("${images.supportPaperGrain}")` };

/**
 * 문의 상세 — `15_2_Support_Inquiry_Detail_Screen` (`/support/[inquiryId]`)
 * Figma: `15_2_Support_Inquiry_Detail_Screen` (`36:93`)
 *
 * 상태 도장 · 문의/답변 카드 · 하단 CTA는 전부 Figma "Mask Group" 노드다.
 * 배경/테두리는 CSS로 그리고 rough 마스크 SVG로 잘라내 삐뚤어진 실루엣을 만든다.
 *
 * 데이터는 Supabase `support_inquiries` + `support_replies` 에서 읽는다.
 * 세션이 없으면(로그인 연동 전) mock 문의를 그대로 보여준다.
 */
export default function SupportDetailPage() {
  const router = useRouter();
  const params = useParams<{ inquiryId: string }>();
  const searchParams = useSearchParams();
  /** 알림함에서 넘어왔는지 — `NotificationFeed` 가 문의 상세 링크에만 붙여 준다 */
  const fromNotification = searchParams.get("from") === "notification";
  const answerSectionRef = useRef<HTMLDivElement>(null);
  const [inquiry, setInquiry] = useState<SupportInquiry | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMockFallback, setIsMockFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadInquiry = async () => {
      const result = await getSupportInquiry(params.inquiryId);

      if (!isMounted) return;

      setInquiry(result.inquiry);
      setIsMockFallback(result.source === "mock");
      setLoadError(result.errorMessage ?? null);
      setIsLoading(false);
    };

    void loadInquiry();

    return () => {
      isMounted = false;
    };
  }, [params.inquiryId]);

  /**
   * 알림(문의 답변 도착)을 눌러 들어온 경우엔 답변부터 눈에 걸리게 한다.
   * 상세는 도장 → 내가 쓴 문의 → 답변 순서라, 답변이 첫 화면 아래로 밀려서
   * "답변 도착" 알림을 누르고도 스크롤을 내려야 답을 볼 수 있다.
   * 목록에서 직접 들어온 경우에는 시안대로 위에서부터 읽게 그냥 둔다.
   */
  useEffect(() => {
    if (!fromNotification || isLoading) return;
    if (!inquiry || inquiry.answers.length === 0) return;

    answerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [fromNotification, isLoading, inquiry]);

  const goList = () => router.push("/support");

  if (isLoading) {
    return (
      <>
        <section className={`${SCREEN_BG} pb-28`} style={SCREEN_BG_STYLE}>
          <ProfileTopAppBar backHref="/support" title="뭐라카노 답변" />
          <p className="px-5 pt-16 text-center text-base text-[#5d5f5f]">문의 내용을 불러오는 중이야.</p>
        </section>
        <BottomNav />
      </>
    );
  }

  if (!inquiry) {
    return (
      <>
        <section className={`${SCREEN_BG} pb-28`} style={SCREEN_BG_STYLE}>
          <ProfileTopAppBar backHref="/support" title="뭐라카노 답변" />
          <div className="px-5 pt-16 text-center">
            <p className="text-2xl leading-[30px] text-[#1b1b1b]">그런 문의는 없다.</p>
            <p className="mt-2 text-base text-[#5d5f5f]">목록에서 다시 골라봐.</p>
            {loadError ? <p className="mt-3 text-sm leading-5 text-[#b42318]">{loadError}</p> : null}
            <button
              type="button"
              onClick={goList}
              className="mt-8 w-full transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <RoughMaskFrame
                src={masks.supportDetailBackButton}
                className="flex items-center justify-center bg-black py-6 text-2xl leading-[31.2px] text-white"
              >
                목록으로
              </RoughMaskFrame>
            </button>
          </div>
        </section>
        <BottomNav />
      </>
    );
  }

  const hasAnswer = inquiry.answers.length > 0;

  return (
    <>
      {/*
        시안(`36:93`)은 고정 높이 프레임이라 본문이 화면을 딱 채우지만, 실제로는 답변 유무에 따라
        본문 길이가 크게 달라진다. **상태 도장 ~ CTA 를 한 묶음**으로 두고 묶음 안쪽 간격은 고정한 뒤,
        남는 세로 공간만 위아래 스페이서가 `1 : 2` 로 나눠 갖는다 → 묶음이 화면 가운데보다 위에 온다.
        `pb-20` 은 고정 탭바(80px) 자리.
      */}
      <section className={`${SCREEN_BG} flex flex-col pb-20`} style={SCREEN_BG_STYLE}>
        <ProfileTopAppBar backHref="/support" title="뭐라카노 답변" />

        {/*
          fallback/에러 안내는 본문 레이아웃을 건드리지 않고 위에 한 줄만 얹는다.
          목록 화면과 같은 규칙 — 에러로 mock 이 내려온 경우엔 빨간 줄이 이유를 말하므로
          "로그인 연결 전" 안내를 겹치지 않는다.
        */}
        {isMockFallback && !loadError ? (
          <p className="px-5 pt-4 text-xs leading-5 text-[#5d5f5f]">로그인 연결 전이라 예시 문의를 보여주고 있어.</p>
        ) : null}
        {loadError ? <p className="px-5 pt-4 text-sm leading-5 text-[#b42318]">{loadError}</p> : null}

        <div className="flex flex-1 flex-col px-5 pt-4">
          {/* 남는 공간 1 — 아래 스페이서보다 작아서 묶음이 위로 붙는다 */}
          <div className="flex-1" />

          {/*
            도장 · 카드 2장 · CTA 를 한 컨테이너에 넣어 사이 간격을 전부 96px 로 통일한다.
            (시안은 카드 사이 80 / 카드→버튼 30 이지만, 간격을 맞춰 달라는 요청)
            버튼만 따로 두면 값이 어긋나므로 같은 `gap` 을 공유하게 둔다.
          */}
          <div className="flex flex-col gap-24 pb-8">
            {/* 상태 도장 */}
            <SupportStatusStamp status={inquiry.status} />

            {/*
              사용자 문의 카드.

              이 마스크만 좌상단이 (3.5, 1.675) 에서 시작하게 export 돼서(관리자 답변 마스크는 (0,0)),
              기본 정렬로 씌우면 2px 검은 테두리가 통째로 잘려 흰 박스처럼 보인다.
              마스크를 그 오프셋만큼 키워서 바깥으로 밀어, 관리자 카드처럼 테두리가 살아남게 한다.
              (SVG 는 export 원본 그대로 두고 CSS 정렬만 보정)
            */}
            <RoughMaskFrame
              src={masks.supportUserQuestionCard}
              maskSize="calc(100% + 7px) calc(100% + 3.5px)"
              maskPosition="-3.5px -1.75px"
              className="flex flex-col gap-[23px] border-2 border-black bg-white p-[26px]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="border-b-2 border-black pb-0.5 text-sm font-bold uppercase leading-[19.6px] tracking-[0.7px] text-[#1b1b1b]">
                  내가 쓴 거 ({inquiry.date})
                </h2>
                <img src={icons.supportUserPerson} alt="" className="size-4 shrink-0" />
              </div>
              <p className="whitespace-pre-wrap text-lg leading-[22.5px] text-black">{inquiry.question}</p>
            </RoughMaskFrame>

            {/*
              관리자 답변 카드.
              답변이 실제로 도착한 카드만 시안대로 8px 하드 섀도로 무겁게 세운다.
              아직 `읽는 중`이면 같은 무게로 세울 내용이 없어(대기 문구 한 줄) 섀도를 빼고
              라벨/본문을 흐리게 내려, 위 문의 카드가 화면의 주인공으로 남게 한다.

              답변이 여러 건이면 카드를 그만큼 세운다 — 한 문의에 `support_replies` 가
              여러 행 붙을 수 있어서 첫 건만 보여주면 뒤에 온 답변이 통째로 묻힌다.
              바깥 컨테이너와 같은 `gap-24` 를 써서 카드 사이 간격 규칙을 그대로 잇는다.
            */}
            <div ref={answerSectionRef} className="flex scroll-mt-24 flex-col gap-24">
              {hasAnswer ? (
                inquiry.answers.map((answer, index) => (
                  <RoughMaskFrame
                    key={`${answer.date}-${index}`}
                    src={masks.supportAdminReplyCard}
                    dropShadow="8px 8px 0 #000"
                    className="flex flex-col gap-[23.25px] border-[3px] border-black bg-white p-[27px]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="bg-black px-2 py-0.5 text-sm uppercase leading-[19.6px] tracking-[0.7px] text-white">
                        {formatAnswerLabel(index, inquiry.answers.length)}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        {/* 작성자는 담당자 실명 대신 고정 라벨. 작성일만 덧붙인다. */}
                        <span className="text-sm leading-[19.6px] tracking-[0.7px] text-[#5d5f5f]">
                          {answer.date}
                        </span>
                        <img src={icons.supportAdminHeadset} alt="" className="h-[18px] w-5 shrink-0" />
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-lg leading-[22.5px] text-black">{answer.content}</p>
                  </RoughMaskFrame>
                ))
              ) : (
                <RoughMaskFrame
                  src={masks.supportAdminReplyCard}
                  className="flex flex-col gap-[23.25px] border-[3px] border-black bg-white/70 p-[27px]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="bg-[#e8e8e8] px-2 py-0.5 text-sm uppercase leading-[19.6px] tracking-[0.7px] text-[#5d5f5f]">
                      관리자의 대답
                    </span>
                    <img src={icons.supportAdminHeadset} alt="" className="h-[18px] w-5 shrink-0 opacity-50" />
                  </div>
                  <p className="whitespace-pre-wrap text-lg leading-[22.5px] text-[#5d5f5f]">
                    {resolveAnswerWaitingText(inquiry.status)}
                  </p>
                </RoughMaskFrame>
              )}
            </div>

            {/* 하단 CTA — 위 카드와의 간격은 컨테이너 `gap-24` 가 그대로 잡아 준다 */}
            <button
              type="button"
              onClick={goList}
              className="w-full transition-transform active:translate-x-0.5 active:translate-y-0.5"
            >
              <RoughMaskFrame
                src={masks.supportDetailBackButton}
                className="flex items-center justify-center gap-2 bg-black py-6"
              >
                <span className="text-2xl leading-[31.2px] text-white">알았다 (뒤로가기)</span>
                <img src={icons.supportBackExit} alt="" className="size-[18px] shrink-0" />
              </RoughMaskFrame>
            </button>
          </div>

          {/* 남는 공간 2 — 위 스페이서의 2배를 가져간다 */}
          <div className="flex-[2]" />
        </div>
      </section>

      <BottomNav />
    </>
  );
}
