"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { getAdminContext } from "@/lib/admin/admin-context";
import { getSupabaseBrowserClientOrNull } from "@/lib/supabase";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("이메일을 입력하세요.");
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("올바른 이메일 형식이 아닙니다.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력하세요.");
      return;
    }

    setSubmitting(true);

    try {
      const client = getSupabaseBrowserClientOrNull();
      if (!client) {
        setError("관리자 권한을 확인할 수 없습니다.");
        return;
      }

      const { error: signInError } = await client.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        setError("이메일 또는 비밀번호를 확인해주세요.");
        return;
      }

      const adminContext = await getAdminContext();
      if (!adminContext) {
        await client.auth.signOut();
        router.replace("/admin/access-denied?reason=role_missing");
        return;
      }

      router.replace("/admin/dashboard");
    } catch {
      setError("관리자 권한을 확인할 수 없습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="fixed inset-0 z-50 grid place-items-center bg-[#f8fafc] p-6 text-[#111827]">
      <section className="w-full max-w-[400px] rounded-xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-xl font-bold tracking-tight">캐치캐쉬</p>
          <h1 className="mt-1 text-2xl font-bold">관리자 CMS</h1>
          <p className="mt-2 text-sm text-[#6b7280]">운영 관리자 전용 콘솔</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <h2 className="text-lg font-semibold text-[#111827]">로그인</h2>

          <div>
            <label htmlFor="admin-email" className="mb-2 block text-sm font-medium">
              이메일
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              aria-required="true"
              autoComplete="email"
              value={email}
              disabled={submitting}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              placeholder="admin@catchcash.co.kr"
              className="h-11 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] disabled:bg-[#f9fafb]"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="mb-2 block text-sm font-medium">
              비밀번호
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              aria-required="true"
              autoComplete="current-password"
              value={password}
              disabled={submitting}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              className="h-11 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] disabled:bg-[#f9fafb]"
            />
          </div>

          {error ? (
            <p role="alert" className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-md bg-[#111827] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-5 text-xs leading-5 text-[#6b7280]">관리자 계정으로 로그인하세요.</p>
      </section>
    </main>
  );
}
