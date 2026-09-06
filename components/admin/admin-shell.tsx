"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { resolveAdminSession, type AdminSessionResult } from "@/lib/admin/admin-session";
import type { AdminRole } from "@/lib/admin/mock-admin-accounts";

type NavItem = { label: string; href: string };

const navigation: NavItem[] = [
  { label: "대시보드", href: "/admin/dashboard" },
  { label: "보물상자", href: "/admin/treasures" },
  { label: "상품 관리", href: "/admin/products" },
  { label: "매핑 관리", href: "/admin/mappings" },
  { label: "보상 재처리", href: "/admin/reward-requests" },
  { label: "유저 관리", href: "/admin/users" },
  { label: "문의", href: "/admin/inquiries" },
  { label: "운영 로그", href: "/admin/operation-logs" },
  { label: "관리자 계정", href: "/admin/admins" },
  { label: "보안 로그", href: "/admin/security-logs" },
];

/**
 * route prefix별 허용 role. 명시되지 않은 route는 active 관리자면 접근 가능하다.
 * 세 정의서(기능 명세 §5, A24 §6.2, mock RESTRICTED_MENUS)가 모두 일치하는
 * 민감 route만 제한한다. reason은 A24 접근 제한 사유 코드와 맞춘다.
 */
const ROUTE_ROLE_RULES: { prefix: string; roles: readonly AdminRole[]; reason: string }[] = [
  { prefix: "/admin/security-logs", roles: ["super_admin"], reason: "sensitive_log_forbidden" },
  { prefix: "/admin/admins", roles: ["super_admin"], reason: "permission_denied" },
  { prefix: "/admin/operation-logs", roles: ["super_admin", "operator"], reason: "permission_denied" },
];

function routeRuleFor(pathname: string) {
  return ROUTE_ROLE_RULES.find((rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) ?? null;
}

function roleCanAccess(role: AdminRole | null, href: string): boolean {
  if (!role) return false;
  const rule = routeRuleFor(href);
  if (!rule) return true;
  return rule.roles.includes(role);
}

function toInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "관리";
  return trimmed.slice(0, 2);
}

type GuardStatus = "checking" | "authorized" | "redirecting";

/**
 * `guard`:
 * - "admin"(기본): active 관리자만 본문을 볼 수 있다. route별 role 제한도 적용한다.
 * - "session": 로그인만 되어 있으면 본문을 렌더한다. (예: /admin/access-denied)
 *   비로그인은 로그인 화면으로 보낸다.
 */
export function AdminShell({ children, guard = "admin" }: { children: ReactNode; guard?: "admin" | "session" }) {
  const pathname = usePathname();
  const router = useRouter();

  const [status, setStatus] = useState<GuardStatus>("checking");
  const [session, setSession] = useState<Extract<AdminSessionResult, { state: "authorized" }> | null>(null);

  useEffect(() => {
    let active = true;
    setStatus("checking");

    void resolveAdminSession().then((result) => {
      if (!active) return;

      if (result.state === "authorized") {
        // route별 role 제한(민감 route 직접 URL 접근 차단)
        if (guard === "admin") {
          const rule = routeRuleFor(pathname);
          if (rule && !rule.roles.includes(result.role)) {
            setStatus("redirecting");
            router.replace(`/admin/access-denied?reason=${rule.reason}`);
            return;
          }
        }
        setSession(result);
        setStatus("authorized");
        return;
      }

      // 로그인은 되었으나 active 관리자가 아님
      if (result.state === "forbidden") {
        if (guard === "session") {
          // access-denied 등 세션만 필요한 화면은 로그인 사용자에게 본문을 보여준다.
          setSession(null);
          setStatus("authorized");
          return;
        }
        setStatus("redirecting");
        router.replace("/admin/access-denied?reason=role_missing");
        return;
      }

      // unauthenticated / no-env / error → 접근을 확정할 수 없으므로 로그인 화면으로
      setStatus("redirecting");
      router.replace("/admin/login");
    });

    return () => {
      active = false;
    };
  }, [pathname, guard, router]);

  // 권한 확인 중/이동 중에는 관리자 본문(및 mock 데이터)을 먼저 노출하지 않는다.
  if (status !== "authorized") {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-[#f8fafc] text-[#111827]">
        <p className="text-sm text-[#6b7280]">관리자 권한을 확인하는 중…</p>
      </div>
    );
  }

  const role = session?.role ?? null;
  const roleLabel = role ?? "—";
  const initials = toInitials(session?.name ?? "");
  const visibleNav = navigation.filter((item) => (role ? roleCanAccess(role, item.href) : false));

  return (
    <div className="fixed inset-0 z-50 min-w-[980px] overflow-auto bg-[#f8fafc] text-[#111827]">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-8">
        <Link href="/admin/dashboard" className="text-lg font-bold tracking-tight">캐치캐쉬 CMS</Link>
        <div className="flex items-center gap-4">
          <input disabled aria-label="전역 검색 준비 중" placeholder="검색 기능 준비 중" className="h-9 w-52 rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-3 text-sm text-[#9ca3af]" />
          <span className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-xs font-semibold text-[#4b5563]">{roleLabel}</span>
          <span aria-label={session?.name ? `관리자 ${session.name}` : "관리자"} className="grid h-9 w-9 place-items-center rounded-full bg-[#111827] text-xs font-bold text-white">{initials}</span>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="w-56 shrink-0 border-r border-[#e5e7eb] bg-white px-3 py-6">
          <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">Menu</p>
          <nav aria-label="관리자 메뉴" className="space-y-1">
            {visibleNav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === "/admin/treasures" && pathname.startsWith("/admin/treasures")) ||
                (item.href === "/admin/inquiries" && pathname.startsWith("/admin/inquiries")) ||
                (item.href === "/admin/products" && pathname.startsWith("/admin/products")) ||
                (item.href === "/admin/mappings" && pathname.startsWith("/admin/mappings")) ||
                (item.href === "/admin/reward-requests" && pathname.startsWith("/admin/reward-requests")) ||
                (item.href === "/admin/users" && pathname.startsWith("/admin/users")) ||
                (item.href === "/admin/admins" && pathname.startsWith("/admin/admins")) ||
                (item.href === "/admin/security-logs" && pathname.startsWith("/admin/security-logs")) ||
                (item.href === "/admin/operation-logs" && pathname.startsWith("/admin/operation-logs"));
              return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`block rounded-md px-3 py-2.5 text-sm font-medium ${active ? "bg-[#111827] text-white" : "text-[#4b5563] hover:bg-[#f3f4f6]"}`}>{item.label}</Link>;
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
