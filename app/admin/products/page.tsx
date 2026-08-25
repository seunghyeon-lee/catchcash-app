"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { DialogOverlay } from "@/components/admin/dialog-overlay";
import {
  ADMIN_PRODUCT_STATUS_LABEL,
  formatAdminProductDate,
  formatAdminProductPrice,
  type AdminProductListItem,
  type AdminProductStatus,
} from "@/lib/admin/mock-products";
import { loadAdminProducts } from "@/lib/admin/product-service";
import type { AdminDataSource } from "@/lib/admin/admin-context";

type ProductStatusFilter = "all" | AdminProductStatus;
type ProductSortKey = "created_desc" | "created_asc" | "price_desc" | "price_asc" | "mapping_count_desc";

const PAGE_SIZE = 20;
const adminRole = "super_admin";

const sortOptions: Array<{ label: string; value: ProductSortKey }> = [
  { label: "최신 등록순", value: "created_desc" },
  { label: "오래된 등록순", value: "created_asc" },
  { label: "가격 높은순", value: "price_desc" },
  { label: "가격 낮은순", value: "price_asc" },
  { label: "연결 보물 많은순", value: "mapping_count_desc" },
];

function ProductImageFallback({ product }: { product: AdminProductListItem }) {
  if (product.imageUrl) {
    return (
      <span
        aria-label={`${product.name} 이미지`}
        className="block h-12 w-12 rounded-md border border-[#e5e7eb] bg-cover bg-center"
        style={{ backgroundImage: `url('${product.imageUrl}')` }}
      />
    );
  }

  return (
    <span className="grid h-12 w-12 place-items-center rounded-md border border-[#e5e7eb] bg-[#f3f4f6] text-xs font-bold text-[#6b7280]">
      {product.brandName.slice(0, 2)}
    </span>
  );
}

function ProductStatusBadge({ status }: { status: AdminProductStatus }) {
  const tone = status === "active" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f3f4f6] text-[#4b5563]";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{ADMIN_PRODUCT_STATUS_LABEL[status]}</span>;
}

export default function AdminProductsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProductStatusFilter>("all");
  const [brand, setBrand] = useState("all");
  const [sort, setSort] = useState<ProductSortKey>("created_desc");
  const [page, setPage] = useState(1);
  const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);

  const [products, setProducts] = useState<AdminProductListItem[]>([]);
  const [source, setSource] = useState<AdminDataSource | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await loadAdminProducts();
      setProducts(result.products);
      setSource(result.source);
      setMessage(result.message ?? null);
    } catch (error) {
      console.warn("[admin] 상품 목록 로딩 실패:", error);
      setProducts([]);
      setSource(null);
      setMessage("상품 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const canManageProducts = adminRole === "super_admin" || adminRole === "operator";

  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brandName))).sort((a, b) => a.localeCompare(b, "ko")),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...products]
      .filter((product) => {
        const matchesQuery = [product.name, product.brandName, product.externalProductId]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
        const matchesStatus = status === "all" || product.status === status;
        const matchesBrand = brand === "all" || product.brandName === brand;

        return matchesQuery && matchesStatus && matchesBrand;
      })
      .sort((a, b) => {
        if (sort === "created_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sort === "price_desc") return b.price - a.price;
        if (sort === "price_asc") return a.price - b.price;
        if (sort === "mapping_count_desc") return b.activeMappingCount - a.activeMappingCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [brand, products, query, sort, status]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pageItems = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = () => setPage(1);

  return (
    <AdminShell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">상품 목록</h1>
          <p className="mt-2 text-sm text-[#6b7280]">보물상자에 연결 가능한 상품을 {source === "supabase" ? "Supabase 실데이터" : "mock data"} 기준으로 조회합니다.</p>
        </div>
        {canManageProducts ? (
          <Link href="/admin/products/new" className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black">
            상품 등록
          </Link>
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
        <div className="grid grid-cols-[minmax(240px,1fr)_150px_180px_180px_auto] gap-3">
          <input
            aria-label="상품 검색"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              resetPage();
            }}
            placeholder="상품명, 브랜드, 외부 상품 ID 검색"
            className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
          />
          <label className="sr-only" htmlFor="product-status-filter">상태</label>
          <select
            id="product-status-filter"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ProductStatusFilter);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">상태 전체</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
          <label className="sr-only" htmlFor="product-brand-filter">브랜드</label>
          <select
            id="product-brand-filter"
            value={brand}
            onChange={(event) => {
              setBrand(event.target.value);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            <option value="all">브랜드 전체</option>
            {brands.map((brandName) => (
              <option key={brandName} value={brandName}>{brandName}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor="product-sort-filter">정렬</label>
          <select
            id="product-sort-filter"
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as ProductSortKey);
              resetPage();
            }}
            className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          {canManageProducts ? (
            <button
              type="button"
              onClick={() => setIsCsvDialogOpen(true)}
              className="h-10 rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
            >
              CSV 내보내기
            </button>
          ) : null}
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
            <tr>
              <th className="px-5 py-3 font-medium">이미지</th>
              <th className="px-5 py-3 font-medium">상품명 / 브랜드</th>
              <th className="px-5 py-3 font-medium">외부 상품 ID</th>
              <th className="px-5 py-3 font-medium">가격</th>
              <th className="px-5 py-3 font-medium">상태</th>
              <th className="px-5 py-3 font-medium">연결 보물 수</th>
              <th className="px-5 py-3 font-medium">등록일</th>
              <th className="px-5 py-3 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((product) => (
              <tr key={product.id} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                <td className="px-5 py-4"><ProductImageFallback product={product} /></td>
                <td className="px-5 py-4">
                  <p className="font-medium text-[#111827]">{product.name}</p>
                  <p className="mt-1 text-xs text-[#6b7280]">{product.brandName}</p>
                </td>
                <td className="px-5 py-4 font-mono text-xs text-[#4b5563]">{product.externalProductId}</td>
                <td className="px-5 py-4">{formatAdminProductPrice(product.price)}</td>
                <td className="px-5 py-4"><ProductStatusBadge status={product.status} /></td>
                <td className="px-5 py-4">{product.activeMappingCount}개</td>
                <td className="px-5 py-4 text-[#6b7280]">{formatAdminProductDate(product.createdAt)}</td>
                <td className="px-5 py-4">
                  <Link href={`/admin/products/${product.id}`} className="text-sm font-medium text-[#111827] underline underline-offset-2">
                    상세
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-[#6b7280]">상품 목록을 불러오는 중입니다.</p>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-[#111827]">검색 결과 없음</p>
            <p className="mt-2 text-sm text-[#6b7280]">입력한 조건과 일치하는 상품이 없습니다. 검색어 또는 필터를 변경해 다시 시도해주세요.</p>
          </div>
        ) : null}
      </section>

      <div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
        <span>총 {filteredProducts.length}건{source === "mock" ? " · mock data" : ""}</span>
        <nav aria-label="상품 목록 페이지네이션" className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              aria-current={page === pageNumber ? "page" : undefined}
              className={`h-8 min-w-8 rounded-md px-2 text-sm ${page === pageNumber ? "bg-[#111827] text-white" : "border border-[#d1d5db] bg-white text-[#374151]"}`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
            className="h-8 rounded-md border border-[#d1d5db] bg-white px-3 text-sm disabled:cursor-not-allowed disabled:text-[#9ca3af]"
          >
            다음
          </button>
        </nav>
      </div>

      <DialogOverlay open={isCsvDialogOpen} onClose={() => setIsCsvDialogOpen(false)} labelledBy="product-csv-title">
        <h2 id="product-csv-title" className="text-lg font-bold">CSV 내보내기</h2>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">
          현재 검색·필터 조건의 상품 목록을 CSV로 내보냅니다. 쿠폰번호·바코드·사용자 개인정보는 포함하지 않습니다.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => setIsCsvDialogOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
            취소
          </button>
          <button type="button" onClick={() => setIsCsvDialogOpen(false)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            내보내기
          </button>
        </div>
      </DialogOverlay>
    </AdminShell>
  );
}
