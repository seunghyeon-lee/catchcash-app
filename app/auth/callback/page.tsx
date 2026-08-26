"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClientOrNull } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("로그인 세션을 저장하는 중이야.");

  useEffect(() => {
    let isMounted = true;

    const completeGoogleLogin = async () => {
      const client = getSupabaseBrowserClientOrNull();
      if (!client) {
        router.replace("/nickname");
        return;
      }

      const { data: sessionData } = await client.auth.getSession();
      if (sessionData.session) {
        router.replace("/nickname");
        return;
      }

      const code = new URL(window.location.href).searchParams.get("code");
      if (!code) {
        router.replace("/nickname");
        return;
      }

      const exchangeKey = `catchcash-oauth-code:${code}`;
      if (window.sessionStorage.getItem(exchangeKey)) {
        window.setTimeout(() => router.replace("/nickname"), 500);
        return;
      }
      window.sessionStorage.setItem(exchangeKey, "pending");

      const { error } = await client.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[CatchCash] google session exchange failed", error);
        if (isMounted) setMessage("세션 저장에 실패했어. 예시 흐름으로 계속 진행할게.");
        window.setTimeout(() => router.replace("/nickname"), 700);
        return;
      }

      router.replace("/nickname");
    };

    void completeGoogleLogin();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <section className="flex min-h-[100dvh] items-center justify-center bg-[#F7F5EF] px-5 text-center text-black">
      <p className="text-[15px] font-medium leading-6 text-[#4C4546]">{message}</p>
    </section>
  );
}
