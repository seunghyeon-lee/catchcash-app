"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { RoughImageFrame } from "@/components/profile/rough-image-frame";
import { RoughMaskFrame } from "@/components/profile/rough-mask-frame";
import { SubHeader } from "@/components/profile/sub-header";
import { Toast } from "@/components/profile/toast";
import { useToast } from "@/components/profile/use-toast";
import { PROFILE_ASSETS } from "@/lib/profile/assets";
import { SUPPORT_CATEGORIES } from "@/lib/profile/mock-data";
import { getAuthenticatedSupportSession } from "@/lib/profile/support-service";

const { icons, frames, masks, images } = PROFILE_ASSETS;

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-bold uppercase leading-[18px] tracking-[1.2px] text-black">
      {children}
    </label>
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

  const canSubmit = title.trim().length > 0 && content.trim().length >= 10 && !submitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const session = await getAuthenticatedSupportSession();

    if (!session) {
      // TODO(auth): 인증 전에는 fake user_id를 insert하지 않고 기존 mock 플로우만 유지한다.
      console.log("[CatchCash] mock support submit", { category, title: title.trim(), content: content.trim() });
      show("로그인 연결 전이라 예시 접수로 처리했어.");
      window.setTimeout(() => router.push("/support"), 1200);
      return;
    }

    const { data, error } = await session.client
      .from("support_inquiries")
      .insert({
        user_id: session.userId,
        category,
        title: title.trim(),
        content: content.trim(),
      })
      .select("id")
      .single();

    if (error) {
      setSubmitting(false);
      show("문의 접수에 실패했어. 잠시 후 다시 시도해줘.");
      return;
    }

    show("접수됐어. 확인하면 답 줄게.");
    window.setTimeout(() => router.push(`/support/${data.id}`), 1200);
  };

  return (
    // 배경 종이 질감은 리스트(15_1)·상세(15_2)와 같은 타일을 쓴다 — 문의 3화면 배경을 통일한다.
    <section
      className="min-h-screen bg-[#f7f5ef] bg-[length:523px_384px] bg-repeat pb-12"
      style={{ backgroundImage: `url("${images.supportPaperGrain}")` }}
    >
      <SubHeader title="뭐가 문젠데?" backHref="/support" />

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
                <img src={icons.supportChevronDown} alt="" aria-hidden="true" className="pointer-events-none ml-2 h-[7.4px] w-3 shrink-0" />
              </div>
            </RoughImageFrame>
          </div>

          {/*
            정의서 5.4 가 지정한 제목 입력 전용 프레임은 Figma에 없다.
            회색 1px 테두리는 이 화면에서 유일하게 흑백 rough 톤을 벗어나 있어서,
            바로 위 카테고리 필드와 같은 rough 프레임을 씌워 한 쌍으로 보이게 맞춘다.
          */}
          <div>
            <FieldLabel htmlFor="title">한 줄 요약</FieldLabel>
            <RoughImageFrame src={frames.supportCategorySelect} className="mt-3 w-full">
              <input
                id="title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="한 줄로 요약해"
                maxLength={60}
                autoComplete="off"
                className="w-full bg-transparent px-8 py-5 text-base leading-6 text-black outline-none placeholder:text-soft"
              />
            </RoughImageFrame>
          </div>

          {/*
            textarea 는 세로로 길어서 카테고리 프레임(350x66)을 늘리면 선 굵기가 뭉개진다.
            대신 상세 화면 답변 카드와 같은 사각 마스크를 씌운다 — 마스크는 꼭짓점 4개짜리라
            어떤 높이로 늘려도 손그림 실루엣이 유지된다.
          */}
          <div>
            <FieldLabel htmlFor="content">핵심 요약</FieldLabel>
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
                maxLength={500}
                rows={7}
                className="block w-full resize-none bg-transparent text-base leading-6 text-black outline-none placeholder:text-soft"
              />
            </RoughMaskFrame>
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

          <button type="submit" disabled={!canSubmit} className="block w-full transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40">
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
  );
}
