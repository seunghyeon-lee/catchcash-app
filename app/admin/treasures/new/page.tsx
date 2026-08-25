"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { insertAdminTreasure, type AdminTreasureWritePayload } from "@/lib/admin/treasure-service";

type TreasureCreateStatus = "inactive" | "active";

type TreasureCreateForm = {
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
  status: TreasureCreateStatus;
};

type TreasureCreateErrors = Partial<Record<keyof TreasureCreateForm, string>>;

const initialForm: TreasureCreateForm = {
  title: "",
  description: "",
  locationText: "",
  hintText: "",
  latitude: "",
  longitude: "",
  radiusM: "30",
  startsAt: "",
  endsAt: "",
  maxClaimCount: "100",
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

function parseNumber(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function AdminTreasureCreatePage() {
  const router = useRouter();
  const [form, setForm] = useState<TreasureCreateForm>(initialForm);
  const [errors, setErrors] = useState<TreasureCreateErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isFailureDialogOpen, setIsFailureDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isDirty = useMemo(
    () => Object.entries(form).some(([key, value]) => initialForm[key as keyof TreasureCreateForm] !== value),
    [form],
  );

  const updateField = (field: keyof TreasureCreateForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: TreasureCreateErrors = {};
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

    if (form.endsAt && new Date(form.endsAt).getTime() < Date.now()) {
      nextErrors.endsAt = "운영 종료일시가 과거인 보물상자는 저장할 수 없습니다.";
    }

    if (maxClaimCount === null || !Number.isInteger(maxClaimCount) || maxClaimCount < 1) {
      nextErrors.maxClaimCount = "최대 획득 수량은 1개 이상이어야 합니다.";
    }

    if (form.status === "active") {
      if (latitude === null || longitude === null) {
        nextErrors.status = "active 저장을 위해 좌표를 입력하세요.";
      } else if (form.startsAt && form.endsAt) {
        const now = Date.now();
        const starts = new Date(form.startsAt).getTime();
        const ends = new Date(form.endsAt).getTime();
        if (now < starts || now > ends) {
          nextErrors.status = "active 저장 시 운영 기간이 현재 유효해야 합니다.";
        }
      }
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

    setSaveError(null);
    setIsSaving(true);

    // 위치 문구(locationText)는 DB 컬럼이 없어 저장하지 않는다(좌표에서 파생). status는 UI→DB 매핑.
    const payload: AdminTreasureWritePayload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      hintText: form.hintText.trim() || null,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      radiusM: Number(form.radiusM),
      status: form.status === "active" ? "active" : "draft",
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      maxClaimCount: Number(form.maxClaimCount),
    };

    const result = await insertAdminTreasure(payload);
    if (!result.ok) {
      setIsSaving(false);
      setSaveError(result.message ?? "보물상자 등록에 실패했습니다.");
      return;
    }

    // 세션 없음(mock) 또는 실제 저장 성공 → 목록으로 이동.
    router.push("/admin/treasures");
  };

  const handleLeave = () => {
    if (isDirty) {
      setIsLeaveDialogOpen(true);
      return;
    }
    router.push("/admin/treasures");
  };

  const applySampleCoordinates = () => {
    updateField("latitude", "37.5665");
    updateField("longitude", "126.978");
  };

  return (
    <AdminShell>
      <form onSubmit={handleSubmit} className="max-w-[1040px]">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold">보물상자 등록</h1>
            <p className="mt-2 text-sm text-[#6b7280]">
              보물상자 기본 정보와 운영 조건을 입력합니다. 관리자 세션이 있으면 Supabase treasure_boxes에 저장하고, 없으면 안내만 합니다. Naver Map API는 연결하지 않습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLeave}
            className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]"
          >
            목록으로
          </button>
        </div>

        {saveError ? (
          <div role="alert" className="mt-5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">
            {saveError}
          </div>
        ) : null}

        <div className="mt-7 space-y-4">
          <FormSection title="기본 정보" description="사용자 앱 힌트와 CMS 목록에 표시될 보물상자 기본 정보를 입력합니다.">
            <div className="grid grid-cols-2 gap-4">
              <label className="col-span-2 block">
                <span className="text-sm font-medium text-[#374151]">제목</span>
                <input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value.slice(0, 60))}
                  maxLength={60}
                  className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  placeholder="예: 강남역 출구 보물"
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
                  placeholder="운영자 확인용 설명을 입력하세요."
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
                  placeholder="예: 서울 강남구 강남역 근처"
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
                  placeholder="사용자 앱에 표시될 탐색 힌트를 입력하세요."
                />
                <FieldError message={errors.hintText} />
              </label>
            </div>
          </FormSection>

          <FormSection title="위치 및 반경" description="좌표와 사냥 가능 반경을 입력합니다. 지도 영역은 MVP shell placeholder입니다.">
            <div className="grid grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-[#374151]">위도</span>
                <input
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(event) => updateField("latitude", event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] px-3 text-sm outline-none focus:border-[#111827]"
                  placeholder="37.5665"
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
                  placeholder="126.9780"
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
                  placeholder="30"
                />
                <FieldError message={errors.radiusM} />
              </label>
            </div>

            <div className="mt-5 rounded-lg border border-dashed border-[#d1d5db] bg-[#f9fafb] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">지도에서 위치 선택</p>
                  <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                    Naver Map API는 연결하지 않습니다. 좌표는 직접 입력하거나 아래 샘플 좌표를 사용할 수 있습니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={applySampleCoordinates}
                  className="shrink-0 rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm font-medium text-[#374151] hover:bg-white"
                >
                  샘플 좌표 입력
                </button>
              </div>
              <div className="mt-4 grid h-48 place-items-center rounded-md border border-[#e5e7eb] bg-white text-sm text-[#9ca3af]">
                지도 placeholder · mock UI
              </div>
            </div>
          </FormSection>

          <FormSection title="운영 조건" description="노출 기간과 최대 획득 수량을 설정합니다. 등록 시 현재 획득 수량은 0으로 시작합니다.">
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
                  placeholder="100"
                />
                <FieldError message={errors.maxClaimCount} />
              </label>
            </div>
          </FormSection>

          <FormSection title="초기 상태" description="기본값은 inactive입니다. active 선택 시 좌표와 운영 기간이 유효해야 합니다.">
            <label className="block max-w-xs">
              <span className="text-sm font-medium text-[#374151]">저장 상태</span>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value as TreasureCreateStatus)}
                className="mt-1 h-10 w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-[#111827]"
              >
                <option value="inactive">inactive</option>
                <option value="active">active</option>
              </select>
              <FieldError message={errors.status} />
            </label>
            <div className="mt-4 rounded-md bg-[#f9fafb] p-4 text-sm leading-6 text-[#6b7280]">
              등록 직후 상품 매칭이 없으면 사용자 앱 지도에는 노출되지 않습니다. visible 상태는 목록/상세 API에서 계산됩니다.
            </div>
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
            {isSaving ? "저장 중" : "저장"}
          </button>
        </div>

        {isDirty ? <p className="mt-3 text-right text-xs text-[#6b7280]">입력값은 mock 상태로만 처리되며 실제 DB에 저장되지 않습니다.</p> : null}
      </form>

      {isFailureDialogOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="treasure-save-failure-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 id="treasure-save-failure-title" className="text-lg font-bold">
              저장 실패
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">보물상자를 저장하지 못했습니다. 입력값을 확인한 뒤 다시 시도하세요.</p>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setIsFailureDialogOpen(false)} className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white">
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isLeaveDialogOpen ? (
        <div role="dialog" aria-modal="true" aria-labelledby="treasure-leave-title" className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 id="treasure-leave-title" className="text-lg font-bold">
              작성 중인 내용이 있습니다
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">목록으로 이동하면 입력한 내용이 저장되지 않습니다.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setIsLeaveDialogOpen(false)} className="rounded-md border border-[#d1d5db] px-4 py-2 text-sm font-medium">
                계속 작성
              </button>
              <button
                type="button"
                onClick={() => router.push("/admin/treasures")}
                className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white"
              >
                목록으로
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
