"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AdminShell } from "@/components/admin/admin-shell";

const ACCESS_DENIED_REASONS = [
  "permission_denied",
  "role_missing",
  "sensitive_log_forbidden",
  "direct_url_forbidden",
  "invalid_admin_profile",
  "unknown",
] as const;

type AccessDeniedReason = (typeof ACCESS_DENIED_REASONS)[number];

const REASON_COPY: Record<AccessDeniedReason, { title: string; description: string }> = {
  permission_denied: {
    title: "접근 차단 사유",
    description: "귀하의 역할에는 이 기능의 접근 권한이 없습니다.",
  },
  role_missing: {
    title: "관리자 권한 없음",
    description: "관리자 역할 정보가 확인되지 않았습니다.",
  },
  sensitive_log_forbidden: {
    title: "민감 로그 접근 제한",
    description: "보안 로그는 super_admin만 조회할 수 있습니다.",
  },
  direct_url_forbidden: {
    title: "직접 URL 접근 제한",
    description: "허용되지 않은 경로로 직접 접근하여 차단되었습니다.",
  },
  invalid_admin_profile: {
    title: "관리자 프로필 오류",
    description: "관리자 프로필 데이터가 불완전하여 접근할 수 없습니다.",
  },
  unknown: {
    title: "알 수 없는 접근 제한 사유",
    description: "접근은 제한되었지만 요청된 사유를 확인할 수 없습니다. 관리자에게 문의하세요.",
  },
};

function resolveReason(value: string | null): AccessDeniedReason {
  if (!value) return "permission_denied";
  if ((ACCESS_DENIED_REASONS as readonly string[]).includes(value)) {
    return value as AccessDeniedReason;
  }
  return "unknown";
}

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const requestedReason = searchParams.get("reason");
  const reason = resolveReason(requestedReason);
  const copy = REASON_COPY[reason];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-[#111827]">접근 권한 부족</h1>
      <p className="mt-2 text-sm text-[#6b7280]">현재 계정으로는 이 페이지에 접근할 수 없습니다.</p>

      <section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white p-6">
        <h2 className="text-base font-semibold text-[#111827]">{copy.title}</h2>
        <p className="mt-3 text-sm leading-6 text-[#4b5563]">{copy.description}</p>
        {process.env.NODE_ENV === "development" ? (
          <p className="mt-3 text-xs text-[#9ca3af]">
            reason: {requestedReason ?? "(none)"} → {reason}
          </p>
        ) : null}
      </section>

      <section className="mt-4 rounded-lg border border-[#e5e7eb] bg-white p-6">
        <h2 className="text-base font-semibold text-[#111827]">다음 행동</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#4b5563]">
          <li>대시보드로 돌아가 조회 권한이 있는 페이지를 확인하세요.</li>
          <li>필요한 권한이 없다면 super_admin에게 권한 부여를 요청하세요.</li>
          <li>문의 버튼이나 내부 정책·오류 상세는 제공하지 않습니다.</li>
        </ul>
      </section>

      <div className="mt-6">
        <Link href="/admin/dashboard" className="inline-flex rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black">
          대시보드로
        </Link>
      </div>
    </div>
  );
}

export default function AdminAccessDeniedPage() {
  return (
    <AdminShell>
      <Suspense fallback={<p className="text-sm text-[#6b7280]">접근 안내를 불러오는 중...</p>}>
        <AccessDeniedContent />
      </Suspense>
    </AdminShell>
  );
}
