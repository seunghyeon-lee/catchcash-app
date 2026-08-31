"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { DialogOverlay } from "@/components/admin/dialog-overlay";
import type { AdminProductListItem, AdminProductStatus } from "@/lib/admin/mock-products";
import { loadAdminProductDetail, updateAdminProduct, type AdminProductUpdatePayload } from "@/lib/admin/product-service";

type ProductEditForm = {
  brandName: string;
  productName: string;
  price: string;
  providerProductId: string;
  status: AdminProductStatus;
};

type ProductEditErrors = Partial<Record<keyof ProductEditForm, string>>;

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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1 text-xs font-medium text-[#b91c1c]">{message}</p>;
}

function productToForm(product: AdminProductListItem): ProductEditForm {
  return {
    brandName: product.brandName,
    productName: product.name,
    price: String(product.price),
    // 목록/상세 표시는 provider_product_id가 null이면 "-"로 치환하므로 폼에서는 빈값으로 되돌린다.
    providerProductId: product.externalProductId === "-" ? "" : product.externalProductId,
    status: product.status,
  };
}

export default function AdminProductEditPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const productId = String(params.id ?? "");

  const [product, setProduct] = useState<AdminProductListItem | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<ProductEditForm | null>(null);
  const [errors, setErrors] = useState<ProductEditErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isFailureDialogOpen, setIsFailureDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 수정 폼은 실제 저장 대상과 동일한 원본으로 prefill해야 안전하다(mock값으로 실DB 덮어쓰기 방지).
  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await loadAdminProductDetail(productId);
      setProduct(result.product);
      setForm(result.product ? productToForm(result.product) : null);
    } catch (error) {
      console.warn("[admin] 상품 수정 prefill 로딩 실패:", error);
      setProduct(undefined);
      setForm(null);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  const initialForm = useMemo(() => (product ? productToForm(product) : null), [product]);

  const isDirty = useMemo(() => {
    if (!form || !initialForm) return false;
    return Object.entries(form).some(([key, value]) => initialForm[key as keyof ProductEditForm] !== value);
  }, [form, initialForm]);

  const updateField = (field: keyof ProductEditForm, value: string) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <p className="text-sm text-[#6b7280]">상품 정보를 불러오는 중입니다.</p>
        </div>
      </AdminShell>
    );
  }

  if (!product || !form) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <h1 className="text-xl font-bold text-[#111827]">상품을 찾을 수 없습니다.</h1>
          <p className="mt-2 text-sm text-[#6b7280]">수정할 상품이 없습니다. 목록에서 다시 선택해 주세요.</p>
          <Link href="/admin/products" className="mt-6 inline-flex rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            상품 목록으로
          </Link>
        </div>
      </AdminShell>
    );
  }

  const detailHref = `/admin/products/${product.id}`;

  const validate = () => {
    const nextErrors: ProductEditErrors = {};
    const priceValue = Number(form.price);

    if (!form.brandName.trim()) nextErrors.brandName = "브랜드명을 입력하세요.";
    if (!form.productName.trim()) nextErrors.productName = "상품명을 입력하세요.";
    if (form.price.trim() === "" || !Number.isInteger(priceValue) || priceValue < 0) nextErrors.price = "판매 가격을 올바르게 입력하세요.";
    if (!form.providerProductId.trim()) nextErrors.providerProductId = "기프티쇼비즈 상품 ID를 입력하세요.";
    if (form.status !== "active" && form.status !== "inactive") nextErrors.status = "상태를 선택하세요.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      setIsFailureDialogOpen(true);
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    const payload: AdminProductUpdatePayload = {
      brandName: form.brandName.trim(),
      productName: form.productName.trim(),
      price: Number(form.price),
      status: form.status,
      externalProductId: form.providerProductId.trim() || null,
    };

    const result = await updateAdminProduct(productId, payload);
    if (!result.ok) {
      setIsSaving(false);
      setSaveError(result.message ?? "상품 수정에 실패했습니다.");
      return;
    }

    router.push(detailHref);
  };

  const handleLeave = () => {
    if (isDirty) {
      setIsLeaveDialogOpen(true);
      return;
    }
    router.push(detailHref);
  };

  return (
    <AdminShell>
      <form onSubmit={handleSubmit} className="max-w-[1040px]">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">상품 수정</h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              {product.name} · 상품 정보를 수정합니다. 외부 API는 호출하지 않습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLeave}
            className="shrink-0 whitespace-nowrap rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
          >
            상세로 돌아가기
          </button>
        </div>

        {saveError ? (
          <div role="alert" className="mt-5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
            {saveError}
          </div>
        ) : null}

        <div className="mt-7 space-y-4">
          <FormSection title="기본 정보" description="사용자 앱 보상 카드와 보관함에 노출될 수 있는 상품 정보를 수정합니다.">
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-[#374151]">브랜드명</span>
                <input
                  value={form.brandName}
                  onChange={(event) => updateField("brandName", event.target.value.slice(0, 50))}
                  maxLength={50}
                  className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  placeholder="예: 스타벅스"
                />
                <FieldError message={errors.brandName} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#374151]">상품명</span>
                <input
                  value={form.productName}
                  onChange={(event) => updateField("productName", event.target.value.slice(0, 100))}
                  maxLength={100}
                  className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  placeholder="예: 아메리카노 Tall"
                />
                <FieldError message={errors.productName} />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-[#374151]">판매 가격(원)</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.price}
                  onChange={(event) => updateField("price", event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  placeholder="예: 4500"
                />
                <FieldError message={errors.price} />
              </label>
            </div>
          </FormSection>

          <FormSection title="상품 이미지" description="이미지 업로드(Storage)는 아직 연결되지 않아 현재 등록된 이미지를 유지합니다.">
            <div
              className="grid h-52 max-w-[240px] place-items-center rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] bg-cover bg-center text-sm text-[#9ca3af]"
              style={product.imageUrl ? { backgroundImage: `url('${product.imageUrl}')` } : undefined}
            >
              {!product.imageUrl ? "등록된 이미지 없음" : <span className="sr-only">{product.name} 이미지 미리보기</span>}
            </div>
          </FormSection>

          <FormSection title="외부 연동 정보" description="브라우저에서 기프티쇼비즈 API를 직접 호출하지 않고, 외부 상품 식별자만 저장 대상으로 입력합니다.">
            <label className="block max-w-md">
              <span className="text-sm font-medium text-[#374151]">기프티쇼비즈 상품 ID</span>
              <input
                value={form.providerProductId}
                onChange={(event) => updateField("providerProductId", event.target.value.slice(0, 100))}
                maxLength={100}
                className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                placeholder="예: GFT-10234"
              />
              <FieldError message={errors.providerProductId} />
            </label>
            <p className="mt-3 text-sm text-[#6b7280]">Client Secret 또는 API Key는 입력하지 않습니다.</p>
          </FormSection>

          <FormSection title="상태 설정" description="active 상품만 신규 매칭 대상으로 사용할 수 있습니다.">
            <label className="block max-w-xs">
              <span className="text-sm font-medium text-[#374151]">상태</span>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value as AdminProductStatus)}
                className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-[#111827]"
              >
                <option value="inactive">inactive</option>
                <option value="active">active</option>
              </select>
              <FieldError message={errors.status} />
            </label>
            {product.activeMappingCount > 0 ? (
              <p className="mt-4 rounded-md bg-[#fef3c7] p-3 text-sm leading-6 text-[#92400e]">
                이 상품에 연결된 active 보물이 {product.activeMappingCount}개 있습니다. inactive로 변경하면 해당 보물의 운영에 영향을 줄 수 있습니다.
              </p>
            ) : null}
          </FormSection>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleLeave}
            className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSaving}
            aria-busy={isSaving}
            className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
          >
            {isSaving ? "저장 중" : "수정 저장"}
          </button>
        </div>

      </form>

      <DialogOverlay open={isFailureDialogOpen} onClose={() => setIsFailureDialogOpen(false)} labelledBy="product-edit-failure-title" className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 id="product-edit-failure-title" className="text-lg font-bold">저장 실패</h2>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">필수 항목을 확인하거나 다시 시도해 주세요.</p>
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={() => setIsFailureDialogOpen(false)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            확인
          </button>
        </div>
      </DialogOverlay>

      <DialogOverlay open={isLeaveDialogOpen} onClose={() => setIsLeaveDialogOpen(false)} labelledBy="product-edit-leave-title" className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 id="product-edit-leave-title" className="text-lg font-bold">작성 중인 내용이 있습니다</h2>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">상세로 이동하면 변경 내용이 저장되지 않습니다.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => setIsLeaveDialogOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
            계속 수정
          </button>
          <button type="button" onClick={() => router.push(detailHref)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            상세로
          </button>
        </div>
      </DialogOverlay>
    </AdminShell>
  );
}
