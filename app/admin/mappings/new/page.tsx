"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { DialogOverlay } from "@/components/admin/dialog-overlay";
import {
  MOCK_ADMIN_MAPPING_TREASURES,
  findActiveAdminMapping,
  formatAdminMappingDateTime,
  type AdminMappingListItem,
  type AdminMappingTreasureOption,
} from "@/lib/admin/mock-mappings";
import { MOCK_ADMIN_PRODUCTS, type AdminProductListItem } from "@/lib/admin/mock-products";

const adminRole = "super_admin";

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
        {description ? <p className="mt-1 text-sm text-[#6b7280]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ value }: { value: string }) {
  const tone = value === "active" ? "bg-[#dcfce7] text-[#166534]" : value === "inactive" ? "bg-[#f3f4f6] text-[#4b5563]" : "bg-[#fef3c7] text-[#92400e]";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{value}</span>;
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-t border-[#f3f4f6] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-sm text-[#6b7280]">{label}</dt>
      <dd className="max-w-[70%] text-right text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

export default function AdminMappingCreateReplacePage() {
  const router = useRouter();
  const [treasureQuery, setTreasureQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [treasureId, setTreasureId] = useState("");
  const [productId, setProductId] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [replaceReason, setReplaceReason] = useState("");
  const [replaceError, setReplaceError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canManageMappings = adminRole === "super_admin" || adminRole === "operator";

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialTreasureId = searchParams.get("treasureId");
    const initialProductId = searchParams.get("productId");
    if (initialTreasureId && MOCK_ADMIN_MAPPING_TREASURES.some((treasure) => treasure.treasureId === initialTreasureId && !treasure.deletedAt)) {
      setTreasureId(initialTreasureId);
    }
    if (initialProductId && MOCK_ADMIN_PRODUCTS.some((product) => product.id === initialProductId && product.status === "active")) {
      setProductId(initialProductId);
    }
  }, []);

  const treasureOptions = useMemo(() => {
    const normalizedQuery = treasureQuery.trim().toLowerCase();
    return MOCK_ADMIN_MAPPING_TREASURES
      .filter((treasure) => !treasure.deletedAt)
      .filter((treasure) =>
        [treasure.treasureId, treasure.title, treasure.locationLabel].join(" ").toLowerCase().includes(normalizedQuery),
      );
  }, [treasureQuery]);

  const productOptions = useMemo(() => {
    const normalizedQuery = productQuery.trim().toLowerCase();
    return MOCK_ADMIN_PRODUCTS
      .filter((product) => product.status === "active")
      .filter((product) =>
        [product.id, product.name, product.brandName, product.externalProductId].join(" ").toLowerCase().includes(normalizedQuery),
      );
  }, [productQuery]);

  const selectedTreasure = useMemo(
    () => MOCK_ADMIN_MAPPING_TREASURES.find((treasure) => treasure.treasureId === treasureId && !treasure.deletedAt) ?? null,
    [treasureId],
  );
  const selectedProduct = useMemo(
    () => MOCK_ADMIN_PRODUCTS.find((product) => product.id === productId && product.status === "active") ?? null,
    [productId],
  );
  const activeMapping = useMemo(() => (selectedTreasure ? findActiveAdminMapping(selectedTreasure.treasureId) ?? null : null), [selectedTreasure]);
  const isSameProduct = Boolean(activeMapping && selectedProduct && activeMapping.productId === selectedProduct.id);
  const canSubmit = canManageMappings && Boolean(selectedTreasure && selectedProduct) && !isSameProduct && !isSaving;

  const saveMockMapping = async () => {
    setIsSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    router.push("/admin/mappings");
  };

  const handleSave = async () => {
    setFieldError("");
    if (!selectedTreasure || !selectedProduct) {
      setFieldError("대상 보물과 연결할 active 상품을 모두 선택하세요.");
      return;
    }
    if (isSameProduct) {
      setFieldError("이미 같은 상품이 활성 매칭으로 연결되어 있습니다. 다른 상품을 선택하세요.");
      return;
    }
    if (activeMapping) {
      setIsConfirmOpen(true);
      return;
    }
    await saveMockMapping();
  };

  const confirmReplace = async () => {
    const reason = replaceReason.trim();
    if (reason.length < 5 || reason.length > 300) {
      setReplaceError("처리 사유는 5자 이상 300자 이하로 입력하세요.");
      return;
    }
    await saveMockMapping();
  };

  return (
    <AdminShell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">매칭 등록·교체</h1>
          <p className="mt-2 text-sm text-[#6b7280]">보물상자 하나에 하나의 active 상품만 연결합니다. 실제 DB 저장 없이 mock shell로 처리합니다.</p>
        </div>
        <Link href="/admin/mappings" className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
          매칭 목록으로
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-[minmax(0,1fr)_380px] gap-4">
        <div className="space-y-4">
          <FormSection title="대상 보물" description="삭제되지 않은 보물만 선택할 수 있습니다. 보물명, ID, 위치 문구로 검색합니다.">
            <div className="grid grid-cols-[1fr_1fr] gap-3">
              <input
                aria-label="보물 검색"
                value={treasureQuery}
                onChange={(event) => setTreasureQuery(event.target.value)}
                placeholder="보물명 또는 ID 검색"
                className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
              />
              <select
                aria-label="보물 선택"
                value={treasureId}
                onChange={(event) => {
                  setTreasureId(event.target.value);
                  setFieldError("");
                }}
                className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
              >
                <option value="">보물 선택</option>
                {treasureOptions.map((treasure) => (
                  <option key={treasure.treasureId} value={treasure.treasureId}>
                    {treasure.title}
                  </option>
                ))}
              </select>
            </div>
            {treasureOptions.length === 0 ? <p className="mt-3 text-sm text-[#b91c1c]">조건에 맞는 보물이 없습니다. 검색어를 바꾸거나 필터를 확인하세요.</p> : null}
            {selectedTreasure ? <TreasureSummary treasure={selectedTreasure} /> : <p className="mt-4 rounded-md bg-[#f9fafb] p-4 text-sm text-[#6b7280]">대상 보물을 선택하면 현재 상태와 획득 수량을 확인할 수 있습니다.</p>}
          </FormSection>

          <FormSection title="연결할 활성 상품" description="active 상태인 상품만 연결 대상으로 선택할 수 있습니다. 상품명, ID, 브랜드, 외부 상품 ID로 검색합니다.">
            <div className="grid grid-cols-[1fr_1fr] gap-3">
              <input
                aria-label="상품 검색"
                value={productQuery}
                onChange={(event) => setProductQuery(event.target.value)}
                placeholder="상품명 또는 ID 검색"
                className="h-10 rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
              />
              <select
                aria-label="상품 선택"
                value={productId}
                onChange={(event) => {
                  setProductId(event.target.value);
                  setFieldError("");
                }}
                className="h-10 rounded-md border border-[#d1d5db] bg-white px-3 text-sm"
              >
                <option value="">상품 선택</option>
                {productOptions.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.brandName} · {product.name}
                  </option>
                ))}
              </select>
            </div>
            {productOptions.length === 0 ? <p className="mt-3 text-sm text-[#b91c1c]">연결할 수 있는 active 상품이 없습니다. 상품을 먼저 등록하거나 상태를 active로 변경하세요.</p> : null}
            {selectedProduct ? <ProductSummary product={selectedProduct} /> : <p className="mt-4 rounded-md bg-[#f9fafb] p-4 text-sm text-[#6b7280]">연결할 active 상품을 선택하세요. inactive 상품은 선택 목록에 표시되지 않습니다.</p>}
          </FormSection>
        </div>

        <div className="space-y-4">
          <FormSection title="기존 활성 매칭 안내">
            {selectedTreasure ? (
              activeMapping ? (
                <ActiveMappingSummary mapping={activeMapping} />
              ) : (
                <div className="rounded-md bg-[#eff6ff] p-4 text-sm leading-6 text-[#1d4ed8]">
                  현재 이 보물에는 활성 매칭이 없습니다. 저장 시 선택한 상품으로 신규 활성 매칭이 생성됩니다.
                </div>
              )
            ) : (
              <p className="text-sm text-[#6b7280]">보물을 선택하면 기존 active 매칭 여부를 확인합니다.</p>
            )}
          </FormSection>

          <FormSection title="저장 정책">
            <div className="space-y-3 text-sm leading-6 text-[#6b7280]">
              <p>보물당 active 매칭은 최대 1개만 유지합니다.</p>
              <p>기존 active 매칭이 있으면 저장 전 교체 확인 팝업에서 처리 사유를 입력해야 합니다.</p>
              <p>쿠폰 번호, 바코드, 외부 API Secret, 사용자 개인정보는 이 화면에 표시하지 않습니다.</p>
            </div>
          </FormSection>
        </div>
      </div>

      {fieldError ? <p role="alert" className="mt-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">{fieldError}</p> : null}

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/admin/mappings")}
          className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
        >
          취소
        </button>
        {canManageMappings ? (
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void handleSave()}
            className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
          >
            {isSaving ? "저장 중" : activeMapping ? "교체 저장" : "저장"}
          </button>
        ) : null}
      </div>

      {isConfirmOpen && selectedTreasure && selectedProduct && activeMapping ? (
        <DialogOverlay open onClose={() => setIsConfirmOpen(false)} labelledBy="mapping-replace-title" className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <h2 id="mapping-replace-title" className="text-lg font-bold">매칭 교체 확인</h2>
          <dl className="mt-4 rounded-md bg-[#f9fafb] p-4">
            <SummaryRow label="대상 보물" value={`${selectedTreasure.title} (${selectedTreasure.treasureId})`} />
            <SummaryRow label="신규 연결 상품" value={`${selectedProduct.brandName} · ${selectedProduct.name}`} />
            <SummaryRow label="기존 매칭 처리" value={`${activeMapping.mappingId} → 비활성 전환`} />
          </dl>
          <p className="mt-4 text-sm leading-6 text-[#6b7280]">위 내용으로 매칭을 교체하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-[#374151]">처리 사유 (필수)</span>
            <textarea
              value={replaceReason}
              onChange={(event) => {
                setReplaceReason(event.target.value);
                setReplaceError("");
              }}
              maxLength={300}
              className="mt-1 min-h-24 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#111827]"
              placeholder="교체 사유를 입력하세요."
            />
          </label>
          {replaceError ? <p role="alert" className="mt-1 text-xs font-medium text-[#b91c1c]">{replaceError}</p> : null}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setIsConfirmOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
              취소
            </button>
            <button type="button" disabled={isSaving} onClick={() => void confirmReplace()} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#9ca3af]">
              {isSaving ? "저장 중" : "저장"}
            </button>
          </div>
        </DialogOverlay>
      ) : null}
    </AdminShell>
  );
}

function TreasureSummary({ treasure }: { treasure: AdminMappingTreasureOption }) {
  return (
    <dl className="mt-4 rounded-md bg-[#f9fafb] p-4">
      <SummaryRow label="선택된 보물" value={`${treasure.title} — ${treasure.locationLabel}`} />
      <SummaryRow label="현재 상태" value={<StatusBadge value={treasure.status} />} />
      <SummaryRow label="현재 획득 수 / 최대 수량" value={`${treasure.currentClaimCount} / ${treasure.maxClaimCount}`} />
    </dl>
  );
}

function ProductSummary({ product }: { product: AdminProductListItem }) {
  return (
    <dl className="mt-4 rounded-md bg-[#f9fafb] p-4">
      <SummaryRow label="선택된 상품" value={`${product.brandName} · ${product.name}`} />
      <SummaryRow label="상품 상태" value={<StatusBadge value={product.status} />} />
      <SummaryRow label="기프티쇼비즈 상품 ID" value={<span className="font-mono text-xs">{product.externalProductId}</span>} />
    </dl>
  );
}

function ActiveMappingSummary({ mapping }: { mapping: AdminMappingListItem }) {
  return (
    <div>
      <p className="rounded-md bg-[#fef3c7] p-4 text-sm leading-6 text-[#92400e]">
        현재 이 보물에는 활성 매칭이 1건 존재합니다. 저장 시 기존 매칭은 비활성으로 전환되고, 선택한 상품으로 신규 활성 매칭이 생성됩니다.
      </p>
      <dl className="mt-4 rounded-md bg-[#f9fafb] p-4">
        <SummaryRow label="기존 매칭 ID" value={mapping.mappingId} />
        <SummaryRow label="기존 연결 상품" value={`${mapping.productBrand} · ${mapping.productName}`} />
        <SummaryRow label="기존 매칭 등록일" value={formatAdminMappingDateTime(mapping.createdAt)} />
      </dl>
      <p className="mt-3 text-xs text-[#6b7280]">이 작업은 실제 구현 시 단일 트랜잭션으로 처리되어야 합니다. 현재 화면은 mock shell입니다.</p>
    </div>
  );
}
