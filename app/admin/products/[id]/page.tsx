"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MouseEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { DialogOverlay } from "@/components/admin/dialog-overlay";
import {
  ADMIN_PRODUCT_STATUS_LABEL,
  findAdminProduct,
  formatAdminProductDateTime,
  formatAdminProductPrice,
  getAdminProductMappings,
  type AdminProductStatus,
} from "@/lib/admin/mock-products";

const adminRole = "super_admin";

function ProductStatusBadge({ status }: { status: AdminProductStatus }) {
  const tone = status === "active" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f3f4f6] text-[#4b5563]";

  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{ADMIN_PRODUCT_STATUS_LABEL[status]}</span>;
}

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#e5e7eb] bg-white p-6">
      <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-t border-[#f3f4f6] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-sm text-[#6b7280]">{label}</dt>
      <dd className="max-w-[70%] text-right text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}

export default function AdminProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const productId = String(params.id ?? "");
  const product = findAdminProduct(productId);
  const [isWarningOpen, setIsWarningOpen] = useState(false);

  const canEditProduct = adminRole === "super_admin" || adminRole === "operator";
  const mappings = useMemo(() => getAdminProductMappings(productId), [productId]);
  const activeMappingCount = product?.activeMappingCount ?? 0;
  const totalMappingCount = Math.max(mappings.length, activeMappingCount);
  const storagePath = product?.imageUrl ? `storage/products/${product.externalProductId.toLowerCase()}.jpg` : null;

  const handleEditClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (product?.status === "active" && activeMappingCount > 0) {
      event.preventDefault();
      setIsWarningOpen(true);
    }
  };

  if (!product) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <h1 className="text-xl font-bold text-[#111827]">상품을 찾을 수 없음</h1>
          <p className="mt-2 text-sm text-[#6b7280]">요청한 상품 ID와 일치하는 mock 상품이 없습니다.</p>
          <Link href="/admin/products" className="mt-6 inline-flex rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            상품 목록으로
          </Link>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">상품 상세</h1>
          <p className="mt-2 text-sm text-[#6b7280]">상품 정보와 보물 연결 영향을 mock data 기준으로 확인합니다.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products" className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            목록으로
          </Link>
          {canEditProduct ? (
            <Link
              href={`/admin/products/${product.id}/edit`}
              prefetch={false}
              onClick={handleEditClick}
              className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black"
            >
              상품 수정
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-[minmax(0,1fr)_360px] gap-4">
        <div className="space-y-4">
          <DetailCard title="기본 정보">
            <div className="flex gap-5">
              <div
                className="grid h-28 w-28 shrink-0 place-items-center rounded-lg border border-[#e5e7eb] bg-[#f3f4f6] bg-cover bg-center text-sm font-bold text-[#6b7280]"
                style={product.imageUrl ? { backgroundImage: `url('${product.imageUrl}')` } : undefined}
              >
                {!product.imageUrl ? product.brandName.slice(0, 2) : <span className="sr-only">{product.name} 이미지</span>}
              </div>
              <dl className="min-w-0 flex-1">
                <DetailRow label="상품명" value={product.name} />
                <DetailRow label="브랜드" value={product.brandName} />
                <DetailRow label="상태" value={<ProductStatusBadge status={product.status} />} />
                <DetailRow label="등록일" value={formatAdminProductDateTime(product.createdAt)} />
                <DetailRow label="최종 수정일" value={formatAdminProductDateTime(product.updatedAt)} />
              </dl>
            </div>
          </DetailCard>

          <DetailCard title="가격 및 상태">
            <dl>
              <DetailRow label="판매 가격" value={formatAdminProductPrice(product.price)} />
              <DetailRow label="상태" value={<ProductStatusBadge status={product.status} />} />
              <DetailRow label="외부 상품 ID" value={<span className="font-mono text-xs">{product.externalProductId}</span>} />
              <DetailRow label="상품 타입" value="모바일 교환권" />
              <DetailRow label="재고 관리" value="이 화면에서 관리하지 않음" />
            </dl>
          </DetailCard>
        </div>

        <div className="space-y-4">
          <DetailCard title="운영 상태 요약">
            <dl>
              <DetailRow label="현재 활성 수" value={`${activeMappingCount}개`} />
              <DetailRow label="연결된 active 보물" value={`${activeMappingCount}개`} />
              <DetailRow label="전체 연결 이력" value={`${totalMappingCount}개`} />
            </dl>
            <p className="mt-4 rounded-md bg-[#fef3c7] p-3 text-sm leading-6 text-[#92400e]">
              이 상품을 inactive로 변경하면 연결된 active 보물의 운영 상태에 영향을 줄 수 있습니다.
            </p>
          </DetailCard>

          <DetailCard title="이미지 미리보기">
            <div
              className="grid h-52 place-items-center rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] bg-cover bg-center text-sm text-[#9ca3af]"
              style={product.imageUrl ? { backgroundImage: `url('${product.imageUrl}')` } : undefined}
            >
              {!product.imageUrl ? "등록된 이미지 없음" : <span className="sr-only">{product.name} 이미지 미리보기</span>}
            </div>
            <p className="mt-3 break-all text-xs text-[#6b7280]">이미지 경로: {storagePath ?? "등록된 이미지 없음"}</p>
          </DetailCard>
        </div>
      </div>

      <section className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
          <h2 className="font-semibold">연관 매칭 현황</h2>
          <span className="text-sm text-[#6b7280]">active {activeMappingCount}개</span>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
            <tr>
              <th className="px-5 py-3 font-medium">보물 ID</th>
              <th className="px-5 py-3 font-medium">보물명</th>
              <th className="px-5 py-3 font-medium">매칭 상태</th>
              <th className="px-5 py-3 font-medium">매칭 등록일</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((mapping) => (
              <tr key={`${mapping.treasureId}-${mapping.mappedAt}`} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                <td className="px-5 py-4 font-mono text-xs">
                  <Link href={`/admin/treasures/${mapping.treasureId}`} prefetch={false} className="underline underline-offset-2">{mapping.treasureId}</Link>
                </td>
                <td className="px-5 py-4">
                  <Link href={`/admin/treasures/${mapping.treasureId}`} prefetch={false} className="font-medium underline underline-offset-2">{mapping.treasureName}</Link>
                </td>
                <td className="px-5 py-4"><ProductStatusBadge status={mapping.mappingStatus} /></td>
                <td className="px-5 py-4 text-[#6b7280]">{formatAdminProductDateTime(mapping.mappedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {mappings.length === 0 ? <p className="p-12 text-center text-sm text-[#6b7280]">아직 연결된 보물상자가 없습니다.</p> : null}
      </section>

      <p className="mt-4 text-xs text-[#6b7280]">상품 상세에는 쿠폰 번호, 바코드, 외부 API Secret, 사용자 개인정보를 표시하지 않습니다.</p>

      <DialogOverlay open={isWarningOpen} onClose={() => setIsWarningOpen(false)} labelledBy="inactive-warning-title">
            <h2 id="inactive-warning-title" className="text-lg font-bold">inactive 전환 경고</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              현재 이 상품에 연결된 active 보물이 {activeMappingCount}개 있습니다. inactive로 변경하면 해당 보물의 운영에 영향을 줄 수 있습니다.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsWarningOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
                닫기
              </button>
              <button type="button" onClick={() => router.push(`/admin/products/${product.id}/edit`)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
                수정 화면으로 이동
              </button>
            </div>
      </DialogOverlay>
    </AdminShell>
  );
}
