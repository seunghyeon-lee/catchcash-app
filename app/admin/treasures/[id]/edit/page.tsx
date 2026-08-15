"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import {
  findAdminTreasureDetail,
  type AdminTreasureDetail,
} from "@/lib/admin/mock-treasures";

type TreasureEditStatus = "inactive" | "active";

type TreasureEditForm = {
  title: string;
  description: string;
  locationText: string;
  hintText: string;
  latitude: string;
  longitude: string;
  radiusM: string;
  startsAt: string;
  endsAt: string;
  maxClaimCount: string;
  status: TreasureEditStatus;
};

type TreasureEditErrors = Partial<Record<keyof TreasureEditForm, string>>;

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

function parseNumber(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function detailToForm(detail: AdminTreasureDetail): TreasureEditForm {
  return {
    title: detail.title,
    description: detail.description,
    locationText: detail.locationLabel,
    hintText: detail.hintText,
    latitude: detail.latitude === null ? "" : String(detail.latitude),
    longitude: detail.longitude === null ? "" : String(detail.longitude),
    radiusM: String(detail.radiusM),
    startsAt: toDateTimeLocal(detail.startsAt),
    endsAt: toDateTimeLocal(detail.endsAt),
    maxClaimCount: String(detail.maxClaimCount),
    status: detail.status === "active" ? "active" : "inactive",
  };
}

export default function AdminTreasureEditPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const treasureId = String(params.id ?? "");
  const detail = findAdminTreasureDetail(treasureId);

  const [form, setForm] = useState<TreasureEditForm | null>(() => (detail ? detailToForm(detail) : null));
  const [errors, setErrors] = useState<TreasureEditErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isFailureDialogOpen, setIsFailureDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isActiveBlockedOpen, setIsActiveBlockedOpen] = useState(false);
  const [activeBlockedReasons, setActiveBlockedReasons] = useState<string[]>([]);

  const initialForm = useMemo(() => (detail ? detailToForm(detail) : null), [detail]);

  const isDirty = useMemo(() => {
    if (!form || !initialForm) return false;
    return Object.entries(form).some(([key, value]) => initialForm[key as keyof TreasureEditForm] !== value);
  }, [form, initialForm]);

  const activeChecks = useMemo(() => {
    if (!form || !detail) return [];

    const latitude = parseNumber(form.latitude);
    const longitude = parseNumber(form.longitude);
    const maxClaimCount = parseNumber(form.maxClaimCount) ?? detail.maxClaimCount;
    const hasBasics = form.title.trim().length >= 2 && form.locationText.trim().length >= 2 && form.hintText.trim().length >= 2;
    const periodValid = Boolean(form.startsAt && form.endsAt && new Date(form.startsAt).getTime() < new Date(form.endsAt).getTime());
    const hasCoordinates = latitude !== null && longitude !== null;
    const claimAvailable = detail.currentClaimCount < maxClaimCount;
    const hasActiveMapping = detail.mappingStatus === "active" && detail.activeMappingCount > 0;
    const notDeleted = detail.deletedAt === null && detail.status !== "deleted";

    return [
      { label: "선택 보물 정보 존재", passed: hasBasics },
      { label: "운영 기간 유효", passed: periodValid },
      { label: "위도·경도 좌표 존재", passed: hasCoordinates },
      { label: "잔여 수량 조건", passed: claimAvailable },
      { label: "활성 매칭 1개 존재", passed: hasActiveMapping },
      { label: "삭제 상태 아님", passed: notDeleted },
    ];
  }, [detail, form]);

  const updateField = (field: keyof TreasureEditForm, value: string) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  if (!detail || !form || !initialForm) {
    return (
      <AdminShell>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-10 text-center">
          <h1 className="text-xl font-bold text-[#111827]">보물상자를 찾을 수 없습니다.</h1>
          <p className="mt-2 text-sm text-[#6b7280]">수정할 mock 보물상자가 없습니다.</p>
          <Link href="/admin/treasures" className="mt-6 inline-flex rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
            목록으로
          </Link>
        </div>
      </AdminShell>
    );
  }

  const detailHref = `/admin/treasures/${detail.id}`;

  const validate = () => {
    const nextErrors: TreasureEditErrors = {};
    const title = form.title.trim();
    const description = form.description.trim();
    const locationText = form.locationText.trim();
    const hintText = form.hintText.trim();
    const latitude = parseNumber(form.latitude);
    const longitude = parseNumber(form.longitude);
    const radiusM = parseNumber(form.radiusM);
    const maxClaimCount = parseNumber(form.maxClaimCount);

    if (title.length < 2) nextErrors.title = "보물상자 제목을 입력하세요.";
    else if (title.length > 60) nextErrors.title = "제목은 60자 이하로 입력하세요.";

    if (description.length < 5) nextErrors.description = "설명을 입력하세요.";
    else if (description.length > 500) nextErrors.description = "설명은 500자 이하로 입력하세요.";

    if (locationText.length < 2) nextErrors.locationText = "위치 문구를 입력하세요.";
    else if (locationText.length > 100) nextErrors.locationText = "위치 문구는 100자 이하로 입력하세요.";

    if (hintText.length < 2) nextErrors.hintText = "힌트를 입력하세요.";
    else if (hintText.length > 500) nextErrors.hintText = "힌트는 500자 이하로 입력하세요.";

    if (latitude === null) nextErrors.latitude = "위도를 입력하세요.";
    else if (latitude < -90 || latitude > 90) nextErrors.latitude = "위도는 -90에서 90 사이여야 합니다.";

    if (longitude === null) nextErrors.longitude = "경도를 입력하세요.";
    else if (longitude < -180 || longitude > 180) nextErrors.longitude = "경도는 -180에서 180 사이여야 합니다.";

    if (radiusM === null || !Number.isInteger(radiusM) || radiusM < 1) nextErrors.radiusM = "반경은 1m 이상이어야 합니다.";

    if (!form.startsAt) nextErrors.startsAt = "운영 시작일시를 입력하세요.";
    if (!form.endsAt) nextErrors.endsAt = "운영 종료일시를 입력하세요.";

    if (form.startsAt && form.endsAt && new Date(form.endsAt).getTime() <= new Date(form.startsAt).getTime()) {
      nextErrors.endsAt = "운영 종료일시는 시작일시보다 이후여야 합니다.";
    }

    if (maxClaimCount === null || !Number.isInteger(maxClaimCount) || maxClaimCount < 1) {
      nextErrors.maxClaimCount = "최대 획득 수량은 1개 이상이어야 합니다.";
    } else if (maxClaimCount < detail.currentClaimCount) {
      nextErrors.maxClaimCount = "최대 획득 수는 현재 획득 수보다 작을 수 없습니다.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      setIsFailureDialogOpen(true);
      return;
    }

    if (form.status === "active") {
      const failed = activeChecks.filter((item) => !item.passed).map((item) => item.label);
      if (failed.length > 0) {
        setActiveBlockedReasons(failed);
        setIsActiveBlockedOpen(true);
        return;
      }
    }

    setIsSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    router.push(detailHref);
  };

  const handleLeave = () => {
    if (isDirty) {
      setIsLeaveDialogOpen(true);
      return;
    }
    router.push(detailHref);
  };

  const applySampleCoordinates = () => {
    updateField("latitude", "37.5665");
    updateField("longitude", "126.978");
  };

  return (
    <AdminShell>
      <form onSubmit={handleSubmit}>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">보물상자 수정</h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              {detail.title} · mock data 초기값 표시 · 실제 update/API 연결 없음
            </p>
          </div>
          <Link href={detailHref} className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]">
            상세로 돌아가기
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-[minmax(0,1fr)_320px] gap-4">
          <div className="space-y-4">
            <FormSection title="기본 정보">
              <div className="grid grid-cols-2 gap-4">
                <label className="col-span-2 block">
                  <span className="text-sm font-medium text-[#374151]">제목</span>
                  <input
                    value={form.title}
                    onChange={(event) => updateField("title", event.target.value.slice(0, 60))}
                    maxLength={60}
                    className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  />
                  <FieldError message={errors.title} />
                </label>
                <label className="col-span-2 block">
                  <span className="text-sm font-medium text-[#374151]">설명</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value.slice(0, 500))}
                    maxLength={500}
                    className="mt-1 min-h-28 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#111827]"
                  />
                  <div className="mt-1 flex justify-between text-xs text-[#6b7280]">
                    <FieldError message={errors.description} />
                    <span className="ml-auto">{form.description.length}/500</span>
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#374151]">위치 문구</span>
                  <input
                    value={form.locationText}
                    onChange={(event) => updateField("locationText", event.target.value.slice(0, 100))}
                    maxLength={100}
                    className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  />
                  <FieldError message={errors.locationText} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#374151]">힌트</span>
                  <textarea
                    value={form.hintText}
                    onChange={(event) => updateField("hintText", event.target.value.slice(0, 500))}
                    maxLength={500}
                    className="mt-1 min-h-24 w-full rounded-md border border-[#d1d5db] px-3 py-2 text-sm outline-none focus:border-[#111827]"
                  />
                  <FieldError message={errors.hintText} />
                </label>
                <label className="block max-w-xs">
                  <span className="text-sm font-medium text-[#374151]">저장 상태</span>
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value as TreasureEditStatus)}
                    className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-[#111827]"
                  >
                    <option value="inactive">inactive</option>
                    <option value="active">active</option>
                  </select>
                  <FieldError message={errors.status} />
                </label>
              </div>
            </FormSection>

            <FormSection title="위치 정보" description="지도는 placeholder이며 Naver Map API는 연결하지 않습니다.">
              <div className="grid grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#374151]">위도</span>
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(event) => updateField("latitude", event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  />
                  <FieldError message={errors.latitude} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#374151]">경도</span>
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(event) => updateField("longitude", event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  />
                  <FieldError message={errors.longitude} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#374151]">반경(m)</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={form.radiusM}
                    onChange={(event) => updateField("radiusM", event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  />
                  <FieldError message={errors.radiusM} />
                </label>
              </div>
              <div className="mt-5 rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">지도 미리보기</p>
                    <p className="mt-2 text-sm leading-6 text-[#6b7280]">좌표는 직접 수정하거나 샘플 좌표를 사용할 수 있습니다.</p>
                  </div>
                  <button
                    type="button"
                    onClick={applySampleCoordinates}
                    className="shrink-0 rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm font-medium text-[#374151]"
                  >
                    샘플 좌표 입력
                  </button>
                </div>
                <div className="mt-4 grid h-40 place-items-center rounded-md border border-[#e5e7eb] bg-white text-sm text-[#9ca3af]">
                  지도 placeholder · mock UI
                </div>
              </div>
            </FormSection>

            <FormSection title="운영 조건">
              <div className="grid grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#374151]">운영 시작일시</span>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(event) => updateField("startsAt", event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  />
                  <FieldError message={errors.startsAt} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#374151]">운영 종료일시</span>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(event) => updateField("endsAt", event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  />
                  <FieldError message={errors.endsAt} />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-[#374151]">최대 획득 수량</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={form.maxClaimCount}
                    onChange={(event) => updateField("maxClaimCount", event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  />
                  <p className="mt-1 text-xs text-[#6b7280]">현재 획득 수: {detail.currentClaimCount}개</p>
                  <FieldError message={errors.maxClaimCount} />
                </label>
              </div>
            </FormSection>
          </div>

          <div className="space-y-4">
            <FormSection title="active 전환 조건 검사" description="active 저장 전에 충족해야 하는 mock 조건입니다.">
              <ul className="space-y-2">
                {activeChecks.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#374151]">{item.label}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.passed ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#991b1b]"}`}>
                      {item.passed ? "충족" : "미충족"}
                    </span>
                  </li>
                ))}
              </ul>
            </FormSection>

            <FormSection title="수정 정책 안내">
              <ul className="space-y-2 text-sm leading-6 text-[#6b7280]">
                <li>max_claim_count는 current_claim_count 미만으로 설정할 수 없습니다.</li>
                <li>active 전환을 위해 조건 체크를 서버에서 최종 검증합니다.</li>
                <li>저장 실패 시 변경값은 유지됩니다.</li>
                <li>이미 획득이 발생한 보물은 운영 기간과 최대 획득 수 변경에 주의하세요.</li>
                <li>상품 연결은 이 화면이 아니라 매칭 관리 화면에서 수정합니다.</li>
              </ul>
            </FormSection>
          </div>
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
            {isSaving ? "저장 중" : "저장"}
          </button>
        </div>

        {isDirty ? <p className="mt-3 text-right text-xs text-[#6b7280]">입력값은 mock 상태로만 처리되며 실제 DB에 저장되지 않습니다.</p> : null}
      </form>

      {isFailureDialogOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="treasure-edit-failure-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 id="treasure-edit-failure-title" className="text-lg font-bold">
              저장 실패
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">입력값을 확인한 뒤 다시 시도하세요.</p>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setIsFailureDialogOpen(false)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isActiveBlockedOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="treasure-active-blocked-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 id="treasure-active-blocked-title" className="text-lg font-bold">
              active 전환 불가
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">아래 조건이 충족되지 않아 active로 저장할 수 없습니다.</p>
            <ul className="mt-4 space-y-2">
              {activeBlockedReasons.map((reason) => (
                <li key={reason} className="rounded-md bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]">
                  {reason}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setIsActiveBlockedOpen(false)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isLeaveDialogOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="treasure-edit-leave-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 id="treasure-edit-leave-title" className="text-lg font-bold">
              작성 중인 내용이 있습니다
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">상세로 이동하면 변경 내용이 저장되지 않습니다.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsLeaveDialogOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
                계속 수정
              </button>
              <button type="button" onClick={() => router.push(detailHref)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
                상세로
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
