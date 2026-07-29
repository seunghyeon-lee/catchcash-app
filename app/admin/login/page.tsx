"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("올바른 이메일 형식을 입력하세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력하세요.");
      return;
    }

    setSubmitting(true);
    // TODO(auth): 관리자 Supabase Auth 및 admin_users role/status 검증 연결.
    window.setTimeout(() => router.push("/admin/dashboard"), 350);
  };

  return (
    <main className="fixed inset-0 z-50 grid place-items-center bg-[#f8fafc] p-6 text-[#111827]">
      <section className="w-full max-w-[400px] rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-xl font-bold tracking-tight">캐치캐쉬</p>
          <h1 className="mt-1 text-2xl font-bold">관리자 CMS</h1>
          <p className="mt-2 text-sm text-[#6b7280]">신뢰 가능한 운영 콘솔</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-sm font-medium">이메일</label>
            <input id="admin-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@catchcash.co.kr" className="h-11 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]" />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-2 block text-sm font-medium">비밀번호</label>
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]" />
          </div>
          {error ? <p role="alert" className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">{error}</p> : null}
          <button type="submit" disabled={submitting} className="h-11 w-full rounded-md bg-[#111827] text-sm font-semibold text-white disabled:opacity-60">{submitting ? "로그인 중..." : "로그인"}</button>
        </form>
        <p className="mt-5 text-xs leading-5 text-[#6b7280]">현재는 mock 관리자 상태로 대시보드로 이동합니다.</p>
      </section>
    </main>
  );
}
