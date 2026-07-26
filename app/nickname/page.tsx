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
  { id: "privacy", label: "개인정보 수집 동의", required: true },
  { id: "marketing", label: "마케팅 수신 동의", required: false },
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
    () => nickname.trim().length > 0 && checked.terms && checked.privacy,
    [checked.privacy, checked.terms, nickname],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (canComplete) {
      router.push("/home");
    }
  };

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-[#F7F5EF] px-7 pb-8 pt-8 text-[#171717]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30">
        <span className="absolute left-[9%] top-[22%] text-xl">✦</span>
        <span className="absolute right-[10%] top-[13%] h-3 w-3 rotate-45 border-2 border-[#171717]" />
        <span className="absolute bottom-[18%] left-[12%] h-2 w-2 rounded-full border-2 border-[#171717]" />
        <span className="absolute bottom-[9%] right-[16%] h-2 w-2 rounded-full bg-[#171717]" />
      </div>

      <button
        type="button"
        onClick={() => router.push("/login")}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#171717] text-xl font-black transition-transform active:translate-x-0.5 active:translate-y-0.5"
        aria-label="로그인 화면으로 돌아가기"
      >
        ←
      </button>

      <form onSubmit={handleSubmit} className="relative mx-auto flex min-h-[calc(100dvh-72px)] max-w-[360px] flex-col pt-9">
        <div>
          <div aria-hidden="true" className="mb-6 flex items-center gap-2">
            <span className="h-9 w-9 -rotate-6 rounded-[0.7rem] border-[3px] border-[#171717]" />
            <span className="h-5 w-5 rotate-12 rounded-full border-[3px] border-[#171717]" />
            <span className="h-2 w-8 -rotate-6 rounded-full bg-[#171717]" />
          </div>
          <h1 className="text-[2rem] font-black tracking-[-0.08em]">널 뭐라 부르냐?</h1>
          <p className="mt-3 text-sm font-medium text-[#171717]/65">별명 하나는 있어야지.</p>
        </div>

        <div className="mt-10">
          <label htmlFor="nickname" className="text-sm font-bold">
            닉네임
          </label>
          <div className="mt-3 rounded-2xl border-2 border-[#171717] bg-[#F7F5EF] p-1 shadow-[4px_4px_0_#171717]">
            <input
              id="nickname"
              name="nickname"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="예: 보물사냥꾼"
              maxLength={20}
              className="h-12 w-full rounded-xl bg-transparent px-4 text-base font-bold outline-none placeholder:text-[#171717]/35"
              autoComplete="nickname"
            />
          </div>
          <p className="mt-3 text-xs font-medium text-[#171717]/50">나중에 프로필에서 바꿀 수 있어.</p>
        </div>

        <fieldset className="mt-9 border-0 p-0">
          <legend className="text-sm font-bold">약속부터 확인하자</legend>
          <div className="mt-3 space-y-2.5">
            {agreements.map((agreement) => (
              <label
                key={agreement.id}
                className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 border-[#171717] bg-[#F7F5EF] px-4"
              >
                <input
                  type="checkbox"
                  checked={checked[agreement.id]}
                  onChange={(event) =>
                    setChecked((current) => ({ ...current, [agreement.id]: event.target.checked }))
                  }
                  className="h-5 w-5 accent-[#171717]"
                />
                <span className="text-sm font-bold">{agreement.label}</span>
                <span className="ml-auto text-xs font-bold text-[#171717]/50">
                  {agreement.required ? "필수" : "선택"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={!canComplete}
          className="mt-auto h-14 w-full rounded-2xl border-2 border-[#171717] bg-[#171717] text-base font-black text-[#F7F5EF] shadow-[4px_4px_0_#171717] transition-transform active:translate-x-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:border-[#171717]/20 disabled:bg-[#171717]/15 disabled:text-[#171717]/35 disabled:shadow-none"
        >
          준비 완료!
        </button>
      </form>
    </section>
  );
}
