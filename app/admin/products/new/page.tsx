"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { DialogOverlay } from "@/components/admin/dialog-overlay";
import type { AdminProductStatus } from "@/lib/admin/mock-products";

type ProductCreateForm = {
  brandName: string;
  productName: string;
  description: string;
  price: string;
  providerProductId: string;
  status: AdminProductStatus;
};

type ProductCreateErrors = Partial<Record<keyof ProductCreateForm | "image", string>>;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const initialForm: ProductCreateForm = {
  brandName: "",
  productName: "",
  description: "",
  price: "",
  providerProductId: "",
  status: "inactive",
};

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

export default function AdminProductCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductCreateForm>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<ProductCreateErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isFailureDialogOpen, setIsFailureDialogOpen] = useState(false);

  const descriptionLength = form.description.length;
  const isDirty = useMemo(
    () => Object.entries(form).some(([key, value]) => initialForm[key as keyof ProductCreateForm] !== value) || imageFile !== null,
    [form, imageFile],
  );

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const updateField = (field: keyof ProductCreateForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: ProductCreateErrors = {};
    const priceValue = Number(form.price);

    if (!form.brandName.trim()) nextErrors.brandName = "브랜드명을 입력하세요.";
    if (!form.productName.trim()) nextErrors.productName = "상품명을 입력하세요.";
    if (form.description.length > 500) nextErrors.description = "상품 설명은 500자 이하로 입력하세요.";
    if (form.price.trim() === "" || !Number.isInteger(priceValue) || priceValue < 0) nextErrors.price = "판매 가격을 올바르게 입력하세요.";
    if (!form.providerProductId.trim()) nextErrors.providerProductId = "기프티쇼비즈 상품 ID를 입력하세요.";
    if (form.status !== "active" && form.status !== "inactive") nextErrors.status = "상태를 선택하세요.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setErrors((current) => ({ ...current, image: undefined }));

    if (!file) {
      setImageFile(null);
      setImagePreviewUrl(null);
      return;
    }

    if (!allowedImageTypes.includes(file.type)) {
      event.target.value = "";
      setErrors((current) => ({ ...current, image: "JPG, PNG, WebP 파일만 업로드할 수 있습니다." }));
      setImageFile(null);
      setImagePreviewUrl(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      event.target.value = "";
      setErrors((current) => ({ ...current, image: "5MB 이하 파일만 업로드할 수 있습니다." }));
      setImageFile(null);
      setImagePreviewUrl(null);
      return;
    }

    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      setIsFailureDialogOpen(true);
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    router.push("/admin/products");
  };

  return (
    <AdminShell>
      <form onSubmit={handleSubmit} className="max-w-[1040px]">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">상품 등록</h1>
            <p className="mt-2 text-sm text-[#6b7280]">상품 정보만 등록합니다. 보물-상품 연결과 쿠폰 발급은 이 화면에서 처리하지 않습니다.</p>
          </div>
          <Link href="/admin/products" className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            상품 목록으로
          </Link>
        </div>

        <div className="mt-7 space-y-4">
          <FormSection title="기본 정보" description="사용자 앱 보상 카드와 보관함에 노출될 수 있는 상품 정보를 입력합니다.">
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
              <label className="col-span-2 block">
                <span className="text-sm font-medium text-[#374151]">상품 설명</span>
                <textarea
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  maxLength={500}
                  className="mt-1 min-h-28 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#111827]"
                  placeholder="상품 운영 메모 또는 사용자에게 보여줄 설명을 입력하세요."
                />
                <div className="mt-1 flex justify-between text-xs text-[#6b7280]">
                  <FieldError message={errors.description} />
                  <span className="ml-auto">{descriptionLength}/500</span>
                </div>
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

          <FormSection title="상품 이미지" description="JPG, PNG, WebP 파일을 5MB 이하로 선택합니다. MVP shell에서는 브라우저 미리보기만 제공합니다.">
            <div className="grid grid-cols-[240px_1fr] gap-5">
              <div
                className="grid h-52 place-items-center rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] text-sm text-[#9ca3af]"
                style={imagePreviewUrl ? { backgroundImage: `url('${imagePreviewUrl}')`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
              >
                {!imagePreviewUrl ? "이미지 미리보기" : <span className="sr-only">선택한 상품 이미지 미리보기</span>}
              </div>
              <div className="flex flex-col justify-center">
                <label className="inline-flex h-10 w-fit cursor-pointer items-center rounded-md border border-[#d1d5db] bg-white px-4 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
                  이미지 선택
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="sr-only" />
                </label>
                <p className="mt-3 text-sm text-[#6b7280]">{imageFile ? imageFile.name : "이미지를 선택하지 않으면 fallback 이미지 박스가 사용됩니다."}</p>
                <FieldError message={errors.image} />
              </div>
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
            <p className="mt-3 text-sm text-[#6b7280]">active 상태로 저장하려면 필수 입력 항목입니다. Client Secret 또는 API Key는 입력하지 않습니다.</p>
          </FormSection>

          <FormSection title="상태 설정" description="active 상품만 신규 매칭 대상으로 사용할 수 있습니다. 기본값은 inactive입니다.">
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
            <div className="mt-4 rounded-md bg-[#f9fafb] p-4 text-sm leading-6 text-[#6b7280]">
              상품 타입, 지급 방식, 재고, 쿠폰 번호, 바코드는 이 화면에서 관리하지 않습니다. 상품 매칭과 지급 정책은 별도 화면에서 다룹니다.
            </div>
          </FormSection>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
          >
            {isSaving ? "저장 중" : "저장"}
          </button>
        </div>

        {isDirty ? <p className="mt-3 text-right text-xs text-[#6b7280]">입력값은 mock 상태로만 처리되며 실제 DB에 저장되지 않습니다.</p> : null}
      </form>

      <DialogOverlay open={isFailureDialogOpen} onClose={() => setIsFailureDialogOpen(false)} labelledBy="product-save-failure-title" className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 id="product-save-failure-title" className="text-lg font-bold">저장 실패</h2>
        <p className="mt-2 text-sm leading-6 text-[#6b7280]">필수 항목을 확인하거나 다시 시도해 주세요.</p>
        <div className="mt-6 flex justify-end">
          <button type="button" onClick={() => setIsFailureDialogOpen(false)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            확인
          </button>
        </div>
      </DialogOverlay>
    </AdminShell>
  );
}
