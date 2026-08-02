"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type AgreementKey = "terms" | "privacy" | "marketing";

const agreements: Array<{
  id: AgreementKey;
  label: string;
  required: boolean;
}> = [
  { id: "terms", label: "이용약관 동의", required: true },
  { id: "privacy", label: "개인정보 수집 및 이용 동의", required: true },
  { id: "marketing", label: "새로운 사냥 알림 받기", required: false },
];

export default function NicknamePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [checked, setChecked] = useState<Record<AgreementKey, boolean>>({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const canComplete = useMemo(
    () => nickname.trim().length >= 2 && checked.terms && checked.privacy,
    [checked.privacy, checked.terms, nickname],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (canComplete) {
      router.push("/home");
    }
  };

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-[#F7F5EF] text-black">
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="absolute left-4 top-8 z-10 h-10 w-10 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/images/nickname/icon_nickname_back_rough.svg')" }}
        aria-label="로그인 화면으로 돌아가기"
      />

      <form onSubmit={handleSubmit} className="relative mx-auto flex min-h-[100dvh] max-w-[390px] flex-col px-4 pb-8 pt-[104px]">
        <div className="w-full">
          <h1 className="relative inline-block text-2xl font-medium leading-[38.4px] text-black">
            널 뭐라 부르냐?
            <span aria-hidden="true" className="absolute -bottom-1.5 left-0 h-1 w-full bg-black" />
          </h1>
          <p className="mt-3 text-[15px] font-medium leading-[25.6px] text-[#777777]">별명 하나는 있어야지.</p>
        </div>

        <div className="mt-[47px]">
          <label htmlFor="nickname" className="text-[15px] font-medium uppercase leading-[19.6px] tracking-[0.7px]">
            별명
          </label>
          <div
            className="relative mt-3 h-[75px] bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/assets/images/nickname/img_nickname_input_frame.svg')",
              backgroundSize: "100% 75px",
            }}
          >
            <input
              id="nickname"
              name="nickname"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              minLength={2}
              maxLength={12}
              className="absolute inset-x-[8px] top-[4px] h-[62px] w-[calc(100%-16px)] bg-transparent px-4 text-[18px] font-medium outline-none placeholder:text-black/30"
              autoComplete="nickname"
            />
          </div>
          <p className="mt-4 text-[15px] font-medium leading-[16.8px] tracking-[0.6px] text-[#777777]">
            2~12자. 이상한 건 알아서 걸러낸다.
          </p>
        </div>

        <fieldset className="mt-[50px] border-0 p-0">
          <legend className="text-[15px] font-medium uppercase leading-[16.8px] tracking-[1.2px]">
            CATCHCASH RULES
          </legend>
          <div className="mt-4 space-y-4">
            {agreements.map((agreement) => (
              <label
                key={agreement.id}
                className="flex h-[42px] cursor-pointer items-center justify-between rounded text-black"
              >
                <span className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={checked[agreement.id]}
                    onChange={(event) =>
                      setChecked((current) => ({ ...current, [agreement.id]: event.target.checked }))
                    }
                    className="peer sr-only"
                  />
                  <span className="h-5 w-5 shrink-0 border-2 border-black bg-transparent peer-checked:bg-black" />
                  <span className="text-[15px] font-medium leading-[25.6px]">
                    [{agreement.required ? "필수" : "선택"}] {agreement.label}
                  </span>
                </span>
                <span aria-hidden="true" className="mr-1 h-[13px] w-[13px] rotate-45 border-r-[3px] border-t-[3px] border-black" />
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-auto pt-8">
          <button
            type="submit"
            disabled={!canComplete}
            className="relative flex h-[69px] w-full items-center justify-center bg-center bg-no-repeat text-[15px] font-medium leading-[31.2px] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-25"
            style={{
              backgroundImage: "url('/assets/images/nickname/img_nickname_button_frame.svg')",
              backgroundSize: "100% 69px",
            }}
          >
            <span>사냥 합류하기</span>
            <span aria-hidden="true" className="absolute right-[76px] text-[34px] leading-none">
              →
            </span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mx-auto mt-7 block text-[15px] font-medium leading-[19.6px] tracking-[0.7px] text-[#777777] underline decoration-wavy underline-offset-2"
          >
            관둬
          </button>
        </div>
      </form>
    </section>
  );
}
