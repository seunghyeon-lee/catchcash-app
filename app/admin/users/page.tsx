"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  ADMIN_USER_PROVIDER_LABEL,
  ADMIN_USER_STATUS_LABEL,
  formatAdminUserDate,
  formatAdminUserDateTime,
  type AdminUserListItem,
  type AdminUserStatus,
} from "@/lib/admin/mock-users";
import { loadAdminUsers } from "@/lib/admin/user-service";
import type { AdminDataSource } from "@/lib/admin/admin-context";

type StatusFilter = "all" | AdminUserStatus;
type JoinedPeriodFilter = "all" | "today" | "last_7_days" | "last_30_days" | "custom";
type LastActiveFilter = "all" | "today" | "last_7_days" | "last_30_days" | "inactive_over_30_days";
type UserSortKey = "last_active_desc" | "joined_desc" | "joined_asc" | "treasure_count_desc" | "reward_count_desc" | "inquiry_count_desc";

const adminRole = "super_admin";
const defaultFilters = {
  query: "",
  status: "all" as StatusFilter,
  joinedPeriod: "all" as JoinedPeriodFilter,
  joinedFrom: "",
  joinedTo: "",
  lastActive: "all" as LastActiveFilter,
  sort: "last_active_desc" as UserSortKey,
  pageSize: 20,
};

const joinedPeriodOptions: Array<{ label: string; value: JoinedPeriodFilter }> = [
  { label: "가입일 전체", value: "all" },
  { label: "오늘 가입", value: "today" },
  { label: "최근 7일 가입", value: "last_7_days" },
  { label: "최근 30일 가입", value: "last_30_days" },
  { label: "직접 선택", value: "custom" },
];

const lastActiveOptions: Array<{ label: string; value: LastActiveFilter }> = [
  { label: "최근 활동 전체", value: "all" },
  { label: "오늘 활동", value: "today" },
  { label: "최근 7일 활동", value: "last_7_days" },
  { label: "최근 30일 활동", value: "last_30_days" },
  { label: "30일 이상 미활동", value: "inactive_over_30_days" },
];

const sortOptions: Array<{ label: string; value: UserSortKey }> = [
  { label: "최근 활동순", value: "last_active_desc" },
  { label: "최근 가입순", value: "joined_desc" },
  { label: "오래된 가입순", value: "joined_asc" },
  { label: "찾은 보물 많은 순", value: "treasure_count_desc" },
  { label: "보유 보상 많은 순", value: "reward_count_desc" },
  { label: "문의 많은 순", value: "inquiry_count_desc" },
];

function getStatusTone(status: AdminUserStatus) {
  if (status === "active") return "bg-[#dcfce7] text-[#166534]";
  if (status === "suspended") return "bg-[#fee2e2] text-[#991b1b]";
  return "bg-[#f3f4f6] text-[#4b5563]";
}

function UserStatusBadge({ status }: { status: AdminUserStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusTone(status)}`}>{ADMIN_USER_STATUS_LABEL[status]}</span>;
}

function isWithinDays(value: string | null, days: number) {
  if (!value) return false;
  const target = new Date(value).getTime();
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return target >= threshold;
}

function isToday(value: string | null) {
  if (!value) return false;
  const target = new Date(value);
  const now = new Date();
  return target.getFullYear() === now.getFullYear() && target.getMonth() === now.getMonth() && target.getDate() === now.getDate();
}

function matchesJoinedPeriod(user: AdminUserListItem, period: JoinedPeriodFilter, from: string, to: string) {
  const joinedDate = user.joinedAt.slice(0, 10);
  if (period === "today") return isToday(user.joinedAt);
  if (period === "last_7_days") return isWithinDays(user.joinedAt, 7);
  if (period === "last_30_days") return isWithinDays(user.joinedAt, 30);
  if (period === "custom") {
    const matchesFrom = !from || joinedDate >= from;
    const matchesTo = !to || joinedDate <= to;
    return matchesFrom && matchesTo;
  }
  return true;
}

function matchesLastActive(user: AdminUserListItem, filter: LastActiveFilter) {
  if (filter === "today") return isToday(user.lastActiveAt);
  if (filter === "last_7_days") return isWithinDays(user.lastActiveAt, 7);
  if (filter === "last_30_days") return isWithinDays(user.lastActiveAt, 30);
  if (filter === "inactive_over_30_days") return !user.lastActiveAt || !isWithinDays(user.lastActiveAt, 30);
  return true;
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState(defaultFilters.query);
  const [status, setStatus] = useState(defaultFilters.status);
  const [joinedPeriod, setJoinedPeriod] = useState(defaultFilters.joinedPeriod);
  const [joinedFrom, setJoinedFrom] = useState(defaultFilters.joinedFrom);
  const [joinedTo, setJoinedTo] = useState(defaultFilters.joinedTo);
  const [lastActive, setLastActive] = useState(defaultFilters.lastActive);
  const [sort, setSort] = useState(defaultFilters.sort);
  const [pageSize, setPageSize] = useState(defaultFilters.pageSize);
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);

  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [source, setSource] = useState<AdminDataSource | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await loadAdminUsers();
      setUsers(result.users);
      setSource(result.source);
      setMessage(result.message ?? null);
    } catch (error) {
      console.warn("[admin] 유저 목록 로딩 실패:", error);
      setUsers([]);
      setSource(null);
      setMessage("유저 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const canExportCsv = adminRole === "super_admin" || adminRole === "operator";
  const joinedRangeError = Boolean(joinedPeriod === "custom" && joinedFrom && joinedTo && joinedFrom > joinedTo);

  const resetPage = () => setPage(1);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (joinedRangeError) return [];

    return [...users]
      .filter((user) => {
        const matchesQuery = [user.nickname, user.publicId, user.id, user.provider]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesStatus = status === "all" || user.status === status;

        return matchesQuery && matchesStatus && matchesJoinedPeriod(user, joinedPeriod, joinedFrom, joinedTo) && matchesLastActive(user, lastActive);
      })
      .sort((a, b) => {
        if (sort === "joined_desc") return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        if (sort === "joined_asc") return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        if (sort === "treasure_count_desc") return b.treasureFoundCount - a.treasureFoundCount;
        if (sort === "reward_count_desc") return b.rewardCount - a.rewardCount;
        if (sort === "inquiry_count_desc") return b.inquiryCount - a.inquiryCount;
        return new Date(b.lastActiveAt ?? 0).getTime() - new Date(a.lastActiveAt ?? 0).getTime();
      });
  }, [joinedFrom, joinedPeriod, joinedRangeError, joinedTo, lastActive, query, sort, status, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredUsers.slice((safePage - 1) * pageSize, safePage * pageSize);
  const startItemNumber = filteredUsers.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItemNumber = Math.min(safePage * pageSize, filteredUsers.length);
  const selectedUser = selectedUserId ? users.find((user) => user.id === selectedUserId) ?? null : null;

  const resetFilters = () => {
    setQuery(defaultFilters.query);
    setStatus(defaultFilters.status);
    setJoinedPeriod(defaultFilters.joinedPeriod);
    setJoinedFrom(defaultFilters.joinedFrom);
    setJoinedTo(defaultFilters.joinedTo);
    setLastActive(defaultFilters.lastActive);
    setSort(defaultFilters.sort);
    setPageSize(defaultFilters.pageSize);
    setSelectedUserId(null);
    setPage(1);
  };

  return (
    <AdminShell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">유저 목록</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            캐치캐쉬 사용자 상태와 활동 정보를 {source === "supabase" ? "Supabase 실데이터" : "mock data"} 기준으로 확인합니다.
          </p>
        </div>
        {canExportCsv ? (
          <button
            type="button"
            onClick={() => setIsCsvDialogOpen(true)}
            className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
          >
            CSV 내보내기
          </button>
        ) : null}
      </div>

      {source && source !== "supabase" ? (
        <div
          role="status"
          className={`mt-5 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
            source === "mock" ? "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]" : "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]"
          }`}
        >
          <span>{message ?? "예시 데이터를 표시하고 있습니다."}</span>
          <button type="button" onClick={() => void load()} className="shrink-0 font-medium underline">
            다시 시도
          </button>
        </div>
      ) : null}

      <section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="grid grid-cols-[minmax(240px,1fr)_140px_170px_170px_170px_150px] gap-3">
          <input
            aria-label="유저 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="닉네임 · 유저 ID · 로그인 제공자 검색"
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          />
          <select
            aria-label="유저 상태"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">상태 전체</option>
            {Object.entries(ADMIN_USER_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            aria-label="가입 기간"
            value={joinedPeriod}
            onChange={(event) => {
              setJoinedPeriod(event.target.value as JoinedPeriodFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            {joinedPeriodOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            aria-label="최근 활동"
            value={lastActive}
            onChange={(event) => {
              setLastActive(event.target.value as LastActiveFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            {lastActiveOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            aria-label="정렬"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as UserSortKey);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            aria-label="페이지 크기"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value={20}>20개씩</option>
            <option value={50}>50개씩</option>
            <option value={100}>100개씩</option>
          </select>
        </div>

        {joinedPeriod === "custom" ? (
          <div className="mt-3 grid grid-cols-[145px_145px_auto] items-center gap-3">
            <input
              aria-label="가입 시작일"
              type="date"
              value={joinedFrom}
              onChange={(event) => {
                setJoinedFrom(event.target.value);
                resetPage();
              }}
              className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm"
            />
            <input
              aria-label="가입 종료일"
              type="date"
              value={joinedTo}
              onChange={(event) => {
                setJoinedTo(event.target.value);
                resetPage();
              }}
              className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm"
            />
            <button type="button" onClick={resetFilters} className="h-10 w-fit rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
              초기화
            </button>
          </div>
        ) : (
          <div className="mt-3 flex justify-between">
            <button type="button" onClick={resetFilters} className="h-9 rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
              초기화
            </button>
            <span className="text-xs leading-9 text-[#6b7280]">pageSize는 20 / 50 / 100개를 지원합니다.</span>
          </div>
        )}
        {joinedRangeError ? <p className="mt-3 text-sm text-[#b91c1c]">가입 시작일은 종료일보다 늦을 수 없습니다.</p> : null}
      </section>

      <div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
        <span>{startItemNumber}-{endItemNumber} / {filteredUsers.length}건{source === "mock" ? " · mock data" : ""}</span>
        <span>사용자 이메일, 전화번호, 소셜 provider 식별자, 쿠폰 번호와 바코드는 표시하지 않습니다.</span>
      </div>

      <section aria-busy={isLoading} className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
            <tr>
              <th className="px-5 py-3 font-medium">닉네임</th>
              <th className="px-5 py-3 font-medium">유저 ID</th>
              <th className="px-5 py-3 font-medium">로그인 제공자</th>
              <th className="px-5 py-3 font-medium">상태</th>
              <th className="px-5 py-3 font-medium">가입일</th>
              <th className="px-5 py-3 font-medium">최근 활동일</th>
              <th className="px-5 py-3 font-medium">찾은 보물 수</th>
              <th className="px-5 py-3 font-medium">보유 보상 수</th>
              <th className="px-5 py-3 font-medium">문의 수</th>
              <th className="px-5 py-3 font-medium">상세</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((user) => (
              <tr
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`cursor-pointer border-t border-[#f3f4f6] hover:bg-[#f9fafb] ${selectedUserId === user.id ? "bg-[#f9fafb]" : ""}`}
              >
                <td className="px-5 py-4">
                  <Link href={`/admin/users/${user.id}`} onClick={(event) => event.stopPropagation()} className="font-medium text-[#111827] underline underline-offset-2">
                    {user.nickname}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <p className="font-mono text-xs text-[#111827]">{user.publicId}</p>
                  <p className="mt-1 font-mono text-[11px] text-[#9ca3af]">{user.id}</p>
                </td>
                <td className="px-5 py-4">{ADMIN_USER_PROVIDER_LABEL[user.provider]}</td>
                <td className="px-5 py-4"><UserStatusBadge status={user.status} /></td>
                <td className="px-5 py-4 text-[#6b7280]">{formatAdminUserDate(user.joinedAt)}</td>
                <td className="px-5 py-4 text-[#6b7280]">{formatAdminUserDateTime(user.lastActiveAt)}</td>
                <td className="px-5 py-4">{user.treasureFoundCount}개</td>
                <td className="px-5 py-4">{user.rewardCount}개</td>
                <td className="px-5 py-4">{user.inquiryCount}건</td>
                <td className="px-5 py-4">
                  <Link href={`/admin/users/${user.id}`} onClick={(event) => event.stopPropagation()} className="font-medium underline underline-offset-2">
                    상세
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[#6b7280]">유저 목록을 불러오는 중입니다.</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-[#111827]">검색 결과 없음</p>
            <p className="mt-2 text-sm text-[#6b7280]">입력한 조건과 일치하는 유저가 없습니다. 필터를 조정해 주세요.</p>
            <button type="button" onClick={resetFilters} className="mt-5 rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
              필터 초기화
            </button>
          </div>
        ) : null}
      </section>

      <div className="mt-4 flex items-center justify-between gap-4 text-sm">
        <Link
          href={selectedUser ? `/admin/users/${selectedUser.id}` : "#"}
          aria-disabled={!selectedUser}
          onClick={(event) => {
            if (!selectedUser) event.preventDefault();
          }}
          className={`rounded-md px-4 py-2 font-medium ${selectedUser ? "bg-[#111827] text-white hover:bg-black" : "cursor-not-allowed bg-[#9ca3af] text-white"}`}
        >
          유저 상세
        </Link>
        <nav aria-label="유저 목록 페이지네이션" className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage <= 1}
            className="h-8 rounded-md border border-[#d1d5db] bg-white px-3 disabled:cursor-not-allowed disabled:text-[#9ca3af]"
          >
            이전
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              aria-current={safePage === pageNumber ? "page" : undefined}
              className={`h-8 min-w-8 rounded-md px-2 ${safePage === pageNumber ? "bg-[#111827] text-white" : "border border-[#d1d5db] bg-white text-[#374151]"}`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={safePage >= totalPages}
            className="h-8 rounded-md border border-[#d1d5db] bg-white px-3 disabled:cursor-not-allowed disabled:text-[#9ca3af]"
          >
            다음
          </button>
        </nav>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#6b7280]">
        유저 목록에서는 정지/해제 같은 위험 액션을 제공하지 않습니다. 자세한 정보는 각 유저의 상세 화면에서 확인할 수 있습니다.
      </p>

      {isCsvDialogOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="user-csv-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id="user-csv-title" className="text-lg font-bold">CSV 내보내기</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              현재 검색·필터 조건의 유저 목록을 CSV로 내보냅니다. 사용자 이메일, 전화번호, 소셜 provider 식별자, 쿠폰 번호, 바코드, API Secret은 포함하지 않습니다.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsCsvDialogOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
                취소
              </button>
              <button type="button" onClick={() => setIsCsvDialogOpen(false)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
                내보내기
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
