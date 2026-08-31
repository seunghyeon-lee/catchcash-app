"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { DialogOverlay } from "@/components/admin/dialog-overlay";
import {
  ADMIN_MAPPING_STATUS_LABEL,
  ADMIN_TREASURE_CALCULATED_STATUS_LABEL,
  ADMIN_TREASURE_STATUS_LABEL,
  formatAdminMappingDateTime,
  type AdminMappingListItem,
  type AdminMappingProductStatus,
  type AdminMappingStatus,
  type AdminTreasureCalculatedStatus,
  type AdminTreasureStatus,
} from "@/lib/admin/mock-mappings";
import { endAdminMapping, loadAdminMappings } from "@/lib/admin/mapping-service";
import type { AdminDataSource } from "@/lib/admin/admin-context";

type StatusFilter<T extends string> = "all" | T;
type MappingSortKey = "created_at_desc" | "updated_at_desc" | "treasure_title_asc" | "product_name_asc" | "active_first";

const adminRole = "super_admin";
const defaultFilters = {
  keyword: "",
  mappingStatus: "all" as StatusFilter<AdminMappingStatus>,
  treasureStatus: "all" as StatusFilter<AdminTreasureStatus>,
  productStatus: "all" as StatusFilter<AdminMappingProductStatus>,
  createdFrom: "",
  createdTo: "",
  sort: "created_at_desc" as MappingSortKey,
  pageSize: 20,
};

const sortOptions: Array<{ label: string; value: MappingSortKey }> = [
  { label: "최근 등록순", value: "created_at_desc" },
  { label: "최근 변경순", value: "updated_at_desc" },
  { label: "보물명순", value: "treasure_title_asc" },
  { label: "상품명순", value: "product_name_asc" },
  { label: "active 우선", value: "active_first" },
];

function getTone(status: string) {
  if (status === "active" || status === "visible") return "bg-[#dcfce7] text-[#166534]";
  if (status === "scheduled") return "bg-[#dbeafe] text-[#1d4ed8]";
  if (status === "sold_out" || status === "expired") return "bg-[#fef3c7] text-[#92400e]";
  if (status === "deleted" || status === "invalid") return "bg-[#fee2e2] text-[#991b1b]";
  return "bg-[#f3f4f6] text-[#4b5563]";
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getTone(status)}`}>{label}</span>;
}

export default function AdminMappingsPage() {
  const [items, setItems] = useState<AdminMappingListItem[]>([]);
  const [source, setSource] = useState<AdminDataSource | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState(defaultFilters.keyword);
  const [mappingStatus, setMappingStatus] = useState(defaultFilters.mappingStatus);
  const [treasureStatus, setTreasureStatus] = useState(defaultFilters.treasureStatus);
  const [productStatus, setProductStatus] = useState(defaultFilters.productStatus);
  const [createdFrom, setCreatedFrom] = useState(defaultFilters.createdFrom);
  const [createdTo, setCreatedTo] = useState(defaultFilters.createdTo);
  const [sort, setSort] = useState(defaultFilters.sort);
  const [pageSize, setPageSize] = useState(defaultFilters.pageSize);
  const [page, setPage] = useState(1);
  const [selectedMapping, setSelectedMapping] = useState<AdminMappingListItem | null>(null);
  const [endReason, setEndReason] = useState("");
  const [endError, setEndError] = useState("");
  const [isEnding, setIsEnding] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await loadAdminMappings();
      setItems(result.mappings);
      setSource(result.source);
      setMessage(result.message ?? null);
    } catch (error) {
      console.warn("[admin] 매칭 목록 로딩 실패:", error);
      setItems([]);
      setSource(null);
      setMessage("매칭 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const canManageMappings = adminRole === "super_admin" || adminRole === "operator";

  const resetPage = () => setPage(1);

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return [...items]
      .filter((item) => {
        const matchesKeyword = [item.treasureId, item.treasureTitle, item.productId, item.productName]
          .join(" ")
          .toLowerCase()
          .includes(normalizedKeyword);
        const matchesMapping = mappingStatus === "all" || item.mappingStatus === mappingStatus;
        const matchesTreasure = treasureStatus === "all" || item.treasureStatus === treasureStatus;
        const matchesProduct = productStatus === "all" || item.productStatus === productStatus;
        const createdDate = item.createdAt.slice(0, 10);
        const matchesFrom = !createdFrom || createdDate >= createdFrom;
        const matchesTo = !createdTo || createdDate <= createdTo;

        return matchesKeyword && matchesMapping && matchesTreasure && matchesProduct && matchesFrom && matchesTo;
      })
      .sort((a, b) => {
        if (sort === "updated_at_desc") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (sort === "treasure_title_asc") return a.treasureTitle.localeCompare(b.treasureTitle, "ko");
        if (sort === "product_name_asc") return a.productName.localeCompare(b.productName, "ko");
        if (sort === "active_first") return Number(b.mappingStatus === "active") - Number(a.mappingStatus === "active");
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [createdFrom, createdTo, items, keyword, mappingStatus, productStatus, sort, treasureStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pageItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const resetFilters = () => {
    setKeyword(defaultFilters.keyword);
    setMappingStatus(defaultFilters.mappingStatus);
    setTreasureStatus(defaultFilters.treasureStatus);
    setProductStatus(defaultFilters.productStatus);
    setCreatedFrom(defaultFilters.createdFrom);
    setCreatedTo(defaultFilters.createdTo);
    setSort(defaultFilters.sort);
    setPageSize(defaultFilters.pageSize);
    setPage(1);
  };

  const openEndDialog = (item: AdminMappingListItem) => {
    setSelectedMapping(item);
    setEndReason("");
    setEndError("");
  };

  const endSelectedMapping = async () => {
    const reason = endReason.trim();
    if (reason.length < 2 || reason.length > 300) {
      setEndError("종료 사유는 2자 이상 300자 이하로 입력하세요.");
      return;
    }
    if (!selectedMapping || isEnding) return;

    setIsEnding(true);
    try {
      const result = await endAdminMapping({ mappingId: selectedMapping.mappingId, reason });
      if (!result.ok) {
        setEndError(result.message ?? "매핑 종료에 실패했습니다.");
        return;
      }

      if (result.source === "supabase") {
        // 실제 DB update 완료 → 목록을 다시 불러 F5 이후와 동일한 상태를 보여준다.
        setToast("매칭이 종료되었습니다.");
        setSelectedMapping(null);
        setEndReason("");
        setEndError("");
        await load();
        return;
      }

      // 관리자 세션 없음(mock): 실제 저장 없이 화면 상태만 갱신한다.
      setItems((current) =>
        current.map((item) =>
          item.mappingId === selectedMapping.mappingId
            ? { ...item, mappingStatus: "inactive", inactiveReason: reason, updatedAt: new Date().toISOString() }
            : item,
        ),
      );
      setToast(`${selectedMapping.mappingId} 매칭이 mock 상태에서 종료 처리되었습니다.`);
      setSelectedMapping(null);
      setEndReason("");
      setEndError("");
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <AdminShell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">매칭 목록</h1>
          <p className="mt-2 text-sm text-[#6b7280]">보물상자와 상품의 연결 상태를 {source === "supabase" ? "Supabase 실데이터" : "mock data"} 기준으로 확인합니다.</p>
        </div>
        {canManageMappings ? (
          <Link href="/admin/mappings/new" className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black">
            매칭 등록·교체
          </Link>
        ) : null}
      </div>

      <section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white p-4">
        <div className="grid grid-cols-[minmax(240px,1fr)_140px_150px_150px_145px_145px] gap-3">
          <input
            aria-label="매칭 검색"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              resetPage();
            }}
            placeholder="보물명 또는 상품명 검색"
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          />
          <select
            aria-label="매칭 상태"
            value={mappingStatus}
            onChange={(event) => {
              setMappingStatus(event.target.value as StatusFilter<AdminMappingStatus>);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">매칭 전체</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
          <select
            aria-label="보물 상태"
            value={treasureStatus}
            onChange={(event) => {
              setTreasureStatus(event.target.value as StatusFilter<AdminTreasureStatus>);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">보물 전체</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="deleted">deleted</option>
          </select>
          <select
            aria-label="상품 상태"
            value={productStatus}
            onChange={(event) => {
              setProductStatus(event.target.value as StatusFilter<AdminMappingProductStatus>);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">상품 전체</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
          <input
            aria-label="등록 시작일"
            type="date"
            value={createdFrom}
            onChange={(event) => {
              setCreatedFrom(event.target.value);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm"
          />
          <input
            aria-label="등록 종료일"
            type="date"
            value={createdTo}
            onChange={(event) => {
              setCreatedTo(event.target.value);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm"
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={resetFilters} className="h-9 rounded-md border border-[#d1d5db] bg-white px-3 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            초기화
          </button>
          <div className="flex items-center gap-3">
            <select
              aria-label="정렬"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as MappingSortKey);
                resetPage();
              }}
              className="h-9 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
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
              className="h-9 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
            >
              <option value={20}>20개씩</option>
              <option value={50}>50개씩</option>
              <option value={100}>100개씩</option>
            </select>
          </div>
        </div>
      </section>

      {toast ? <div role="status" className="mt-4 rounded-lg border border-[#bfdbfe] bg-[#eff6ff] px-4 py-3 text-sm text-[#1d4ed8]">{toast}</div> : null}

      {source && source !== "supabase" ? (
        <div
          role="status"
          className={`mt-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
            source === "mock" ? "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]" : "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]"
          }`}
        >
          <span>{message ?? "예시 데이터를 표시하고 있습니다."}</span>
          <button type="button" onClick={() => void load()} className="shrink-0 font-medium underline">
            다시 시도
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
        <span>총 {filteredItems.length}건{source === "mock" ? " · mock data" : ""}</span>
        <span>보물당 active 매칭은 최대 1개만 허용됩니다.</span>
      </div>

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
            <tr>
              <th className="px-5 py-3 font-medium">매칭 ID</th>
              <th className="px-5 py-3 font-medium">보물명</th>
              <th className="px-5 py-3 font-medium">보물 상태</th>
              <th className="px-5 py-3 font-medium">상품명</th>
              <th className="px-5 py-3 font-medium">상품 상태</th>
              <th className="px-5 py-3 font-medium">매칭 상태</th>
              <th className="px-5 py-3 font-medium">등록일</th>
              <th className="px-5 py-3 font-medium">변경일</th>
              <th className="px-5 py-3 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr key={item.mappingId} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                <td className="px-5 py-4 font-mono text-xs">{item.mappingId}</td>
                <td className="px-5 py-4">
                  <Link href={`/admin/treasures/${item.treasureId}`} prefetch={false} className="font-medium text-[#111827] underline underline-offset-2">{item.treasureTitle}</Link>
                  <p className="mt-1 font-mono text-xs text-[#6b7280]">{item.treasureId}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <StatusBadge label={ADMIN_TREASURE_STATUS_LABEL[item.treasureStatus]} status={item.treasureStatus} />
                    <StatusBadge label={ADMIN_TREASURE_CALCULATED_STATUS_LABEL[item.treasureCalculatedStatus]} status={item.treasureCalculatedStatus} />
                  </div>
                </td>
                <td className="px-5 py-4">
                  <Link href={`/admin/products/${item.productId}`} className="font-medium text-[#111827] underline underline-offset-2">{item.productName}</Link>
                  <p className="mt-1 text-xs text-[#6b7280]">{item.productBrand} · {item.productId}</p>
                </td>
                <td className="px-5 py-4"><StatusBadge label={item.productStatus} status={item.productStatus} /></td>
                <td className="px-5 py-4"><StatusBadge label={ADMIN_MAPPING_STATUS_LABEL[item.mappingStatus]} status={item.mappingStatus} /></td>
                <td className="px-5 py-4 text-[#6b7280]">{formatAdminMappingDateTime(item.createdAt)}</td>
                <td className="px-5 py-4 text-[#6b7280]">{formatAdminMappingDateTime(item.updatedAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex gap-2">
                      <Link href={`/admin/treasures/${item.treasureId}`} prefetch={false} className="font-medium underline underline-offset-2">보물</Link>
                      <Link href={`/admin/products/${item.productId}`} className="font-medium underline underline-offset-2">상품</Link>
                    </div>
                    {canManageMappings && item.mappingStatus === "active" ? (
                      <div className="flex gap-2">
                        <Link href={`/admin/mappings/new?treasureId=${item.treasureId}`} className="text-[#1d4ed8] underline underline-offset-2">교체</Link>
                        <button type="button" onClick={() => openEndDialog(item)} className="text-[#b91c1c] underline underline-offset-2">
                          종료
                        </button>
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[#6b7280]">매칭 목록을 불러오는 중입니다.</p>
          </div>
        ) : null}
        {!isLoading && items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-[#111827]">아직 등록된 매칭이 없습니다.</p>
            <p className="mt-2 text-sm text-[#6b7280]">보물과 상품을 연결해 운영을 시작하세요.</p>
          </div>
        ) : null}
        {!isLoading && items.length > 0 && pageItems.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-[#111827]">검색 결과 없음</p>
            <p className="mt-2 text-sm text-[#6b7280]">입력한 조건과 일치하는 매칭이 없습니다. 검색어 또는 필터를 변경한 뒤 다시 시도해 주세요.</p>
          </div>
        ) : null}
      </section>

      <div className="mt-4 flex items-center justify-end gap-2 text-sm">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => setPage(pageNumber)}
            aria-current={page === pageNumber ? "page" : undefined}
            className={`h-8 min-w-8 rounded-md px-2 ${page === pageNumber ? "bg-[#111827] text-white" : "border border-[#d1d5db] bg-white text-[#374151]"}`}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page >= totalPages}
          className="h-8 rounded-md border border-[#d1d5db] bg-white px-3 disabled:cursor-not-allowed disabled:text-[#9ca3af]"
        >
          다음
        </button>
      </div>

      <p className="mt-4 text-xs text-[#6b7280]">이 화면에는 쿠폰 번호, 바코드, 외부 API Secret, 사용자 개인정보를 표시하지 않습니다.</p>

      <DialogOverlay open={!!selectedMapping} onClose={() => setSelectedMapping(null)} labelledBy="mapping-end-title">
            <h2 id="mapping-end-title" className="text-lg font-bold">이 매핑을 종료하시겠습니까?</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              종료된 매핑은 과거 이력으로 남고 다시 활성화할 수 없습니다. 새 상품을 연결하려면 매칭 등록·교체를 사용하세요.
            </p>
            <p className="mt-2 rounded-md bg-[#fef3c7] p-3 text-sm text-[#92400e]">
              이 매칭을 종료하면 해당 보물은 활성 상품이 없어 사용자 앱 지도에 노출되지 않을 수 있습니다.
            </p>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-[#374151]">종료 사유</span>
              <textarea
                value={endReason}
                onChange={(event) => {
                  setEndReason(event.target.value);
                  setEndError("");
                }}
                maxLength={300}
                className="mt-1 min-h-24 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#111827]"
                placeholder="종료 사유를 입력하세요."
              />
            </label>
            {endError ? <p className="mt-1 text-xs font-medium text-[#b91c1c]">{endError}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedMapping(null)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
                취소
              </button>
              <button
                type="button"
                onClick={() => void endSelectedMapping()}
                disabled={isEnding}
                aria-busy={isEnding}
                className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
              >
                {isEnding ? "종료 중" : "종료"}
              </button>
            </div>
      </DialogOverlay>
    </AdminShell>
  );
}
