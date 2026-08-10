"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  ADMIN_ROLE_LABEL,
  ADMIN_STATUS_LABEL,
  MOCK_ADMIN_ACCOUNTS,
  formatAdminAccountDate,
  formatAdminAccountDateTime,
  type AdminAccountListItem,
  type AdminRole,
  type AdminStatus,
} from "@/lib/admin/mock-admin-accounts";

type RoleFilter = "all" | AdminRole;
type StatusFilter = "all" | AdminStatus;

const PAGE_SIZE = 20;

function RoleBadge({ role }: { role: AdminRole }) {
  const tone =
    role === "super_admin"
      ? "bg-[#dbeafe] text-[#1d4ed8]"
      : role === "operator"
        ? "bg-[#fef3c7] text-[#92400e]"
        : "bg-[#f3f4f6] text-[#4b5563]";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{ADMIN_ROLE_LABEL[role]}</span>;
}

function StatusBadge({ status }: { status: AdminStatus }) {
  const tone =
    status === "active"
      ? "bg-[#dcfce7] text-[#166534]"
      : status === "locked"
        ? "bg-[#fee2e2] text-[#991b1b]"
        : "bg-[#f3f4f6] text-[#4b5563]";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{ADMIN_STATUS_LABEL[status]}</span>;
}

export default function AdminAccountsPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("created") === "1") {
      setToast("관리자 계정 등록을 mock으로 완료했습니다. 실제 계정은 생성되지 않습니다.");
      window.history.replaceState(null, "", "/admin/admins");
    }
  }, []);

  const filteredAccounts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...MOCK_ADMIN_ACCOUNTS]
      .filter((account) => {
        const matchesQuery = [account.name, account.email].join(" ").toLowerCase().includes(normalizedQuery);
        const matchesRole = role === "all" || account.role === role;
        const matchesStatus = status === "all" || account.status === status;
        return matchesQuery && matchesRole && matchesStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [query, role, status]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredAccounts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  const resetFilters = () => {
    setQuery("");
    setRole("all");
    setStatus("all");
    setPage(1);
  };

  return (
    <AdminShell>
      {toast ? (
        <div role="status" className="mb-4 flex items-center justify-between rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="ml-4 text-[#166534] hover:text-[#14532d]" aria-label="알림 닫기">✕</button>
        </div>
      ) : null}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">관리자 계정</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            CMS 관리자 계정 목록을 mock data 기준으로 조회합니다. 실제 계정 생성·수정은 이번 shell 범위가 아닙니다.
          </p>
        </div>
        <Link href="/admin/admins/new" className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black">
          관리자 계정 등록
        </Link>
      </div>

      <section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="grid grid-cols-[minmax(240px,1fr)_160px_160px_auto] gap-3">
          <input
            aria-label="관리자 계정 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="이메일 또는 이름 검색"
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          />
          <select
            aria-label="역할 필터"
            value={role}
            onChange={(event) => {
              setRole(event.target.value as RoleFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          >
            <option value="all">역할 전체</option>
            <option value="super_admin">super_admin</option>
            <option value="operator">operator</option>
            <option value="viewer">viewer</option>
          </select>
          <select
            aria-label="상태 필터"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          >
            <option value="all">상태 전체</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="locked">locked</option>
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
          >
            필터 초기화
          </button>
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
        <span>
          총 {filteredAccounts.length}명 · mock data
        </span>
        <span>관리자 계정 이메일은 가상 주소만 표시합니다.</span>
      </div>

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        {pageItems.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-base font-semibold text-[#111827]">검색 결과 없음</p>
            <p className="mt-2 text-sm text-[#6b7280]">조건과 일치하는 관리자 계정이 없습니다.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
              <tr>
                <th className="px-5 py-3 font-medium">이름</th>
                <th className="px-5 py-3 font-medium">이메일</th>
                <th className="px-5 py-3 font-medium">역할</th>
                <th className="px-5 py-3 font-medium">상태</th>
                <th className="px-5 py-3 font-medium">최근 로그인</th>
                <th className="px-5 py-3 font-medium">등록일</th>
                <th className="px-5 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((account: AdminAccountListItem) => (
                <tr key={account.id} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                  <td className="px-5 py-4 font-medium text-[#111827]">{account.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-[#374151]">{account.email}</td>
                  <td className="px-5 py-4">
                    <RoleBadge role={account.role} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={account.status} />
                  </td>
                  <td className="px-5 py-4 text-[#4b5563]">{formatAdminAccountDateTime(account.lastLoginAt)}</td>
                  <td className="px-5 py-4 text-[#4b5563]">{formatAdminAccountDate(account.createdAt)}</td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/admins/${account.id}`} className="text-sm font-medium text-[#111827] underline underline-offset-2 hover:text-black">
                      상세
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {filteredAccounts.length > 0 ? (
        <nav aria-label="관리자 계정 페이지네이션" className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            이전
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              aria-current={pageNumber === safePage ? "page" : undefined}
              onClick={() => setPage(pageNumber)}
              className={`min-w-9 rounded-md px-3 py-1.5 text-sm ${
                pageNumber === safePage ? "bg-[#111827] text-white" : "border border-[#d1d5db] bg-white text-[#374151]"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
          </button>
        </nav>
      ) : null}
    </AdminShell>
  );
}
