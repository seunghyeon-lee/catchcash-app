"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { label: "대시보드", href: "/admin/dashboard" },
  { label: "보물상자" },
  { label: "상품 관리", href: "/admin/products" },
  { label: "매칭" },
  { label: "보상" },
  { label: "유저" },
  { label: "문의", href: "/admin/inquiries" },
  { label: "운영 로그" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-50 min-w-[980px] overflow-auto bg-[#f8fafc] text-[#111827]">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#e5e7eb] bg-white px-8">
        <Link href="/admin/dashboard" className="text-lg font-bold tracking-tight">캐치캐쉬 CMS</Link>
        <div className="flex items-center gap-4">
          <input disabled aria-label="전역 검색 준비 중" placeholder="검색 기능 준비 중" className="h-9 w-52 rounded-md border border-[#e5e7eb] bg-[#f9fafb] px-3 text-sm text-[#9ca3af]" />
          <span className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-xs font-semibold text-[#4b5563]">super_admin</span>
          <span aria-label="관리자 김운영" className="grid h-9 w-9 place-items-center rounded-full bg-[#111827] text-xs font-bold text-white">김운</span>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="w-56 shrink-0 border-r border-[#e5e7eb] bg-white px-3 py-6">
          <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">Menu</p>
          <nav aria-label="관리자 메뉴" className="space-y-1">
            {navigation.map((item) => {
              if (!item.href) return <span key={item.label} className="block rounded-md px-3 py-2.5 text-sm text-[#9ca3af]">{item.label}<small className="ml-2 text-[10px]">준비 중</small></span>;
              const active = pathname === item.href || (item.href === "/admin/inquiries" && pathname.startsWith("/admin/inquiries")) || (item.href === "/admin/products" && pathname.startsWith("/admin/products"));
              return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`block rounded-md px-3 py-2.5 text-sm font-medium ${active ? "bg-[#111827] text-white" : "text-[#4b5563] hover:bg-[#f3f4f6]"}`}>{item.label}</Link>;
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
