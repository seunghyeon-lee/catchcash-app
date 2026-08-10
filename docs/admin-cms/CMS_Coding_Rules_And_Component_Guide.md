# 관리자 CMS 코딩 규칙 및 컴포넌트 사용 가이드

## 1. 문서 개요

이 문서는 캐치캐쉬 관리자 CMS 화면을 추가 구현할 때 화면 간 UI, 라우트, mock data, 보안 표시 기준을 통일하기 위한 작업 가이드이다. 새 관리자 화면 PR을 만들거나 리뷰할 때 이 문서를 기준으로 구현 범위와 변경 파일을 점검한다.

### 적용 범위

- `app/admin/**`
- `components/admin/**`
- `lib/admin/**`
- `docs/admin-cms/**`
- `docs/admin-cms/screens/*.md` 기준으로 구현하는 관리자 CMS shell 화면

### 적용 대상

- 관리자 CMS 신규 목록 화면
- 관리자 CMS 신규 등록/수정 shell 화면
- 관리자 CMS 상세 화면
- 관리자 CMS 모달/팝업
- 관리자 CMS mock data 및 타입 정의

### 언제 참고하는가

- 새 CMS 화면을 시작하기 전
- `docs/admin-cms/screens`의 화면 정의서를 구현하기 전
- `components/admin` 공통 컴포넌트를 수정하기 전
- `lib/admin/mock-*.ts`를 추가하거나 확장하기 전
- PR 작성 및 리뷰 체크리스트가 필요할 때

---

## 2. 관리자 CMS 기본 구조

### 현재 `app/admin` 라우트 구조

현재 코드 기준 구현된 관리자 CMS 라우트는 아래와 같다.

| Route | 파일 | 비고 |
|---|---|---|
| `/admin/login` | `app/admin/login/page.tsx` | 관리자 로그인 mock 화면, `AdminShell` 미사용 |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | 운영 대시보드 |
| `/admin/inquiries` | `app/admin/inquiries/page.tsx` | 문의 목록, Supabase fallback 구조 존재 |
| `/admin/inquiries/[id]` | `app/admin/inquiries/[id]/page.tsx` | 문의 상세/답변 |
| `/admin/products` | `app/admin/products/page.tsx` | 상품 목록 |
| `/admin/products/new` | `app/admin/products/new/page.tsx` | 상품 등록 shell |
| `/admin/products/[id]` | `app/admin/products/[id]/page.tsx` | 상품 상세 |
| `/admin/mappings` | `app/admin/mappings/page.tsx` | 상품-보물 매핑 목록 |
| `/admin/mappings/new` | `app/admin/mappings/new/page.tsx` | 매핑 등록/교체 shell |
| `/admin/reward-requests` | `app/admin/reward-requests/page.tsx` | 보상 목록 및 재처리 요청 생성 팝업 |
| `/admin/reward-requests/history` | `app/admin/reward-requests/history/page.tsx` | 재처리 요청 이력 |
| `/admin/rewards/[id]` | `app/admin/rewards/[id]/page.tsx` | 보상 상세 |

### 사용자 앱과 분리되는 기준

- 관리자 CMS는 반드시 `/admin/**` 하위에 둔다.
- 사용자 앱 route인 `/home`, `/profile`, `/support`, `/inventory`, `/map`, `/ar-hunt`, `/hall-of-fame` 등과 레이아웃 및 상태를 공유하지 않는다.
- 관리자 CMS 화면 구현 PR에서 사용자 앱 화면 파일을 수정하지 않는다.
- 관리자 CMS는 데스크톱 운영 콘솔 기준이며, 모바일 WebView 기준 UI와 분리한다.

### 사용자 앱 GNB/BNB 미사용 기준

- `/admin/**` 화면에서는 사용자 앱 공통 GNB/BNB를 사용하지 않는다.
- 관리자 화면은 `AdminShell`의 좌측 사이드바와 상단 바를 사용한다.
- 예외: `/admin/login`은 인증 진입 화면이므로 `AdminShell`을 사용하지 않고 독립 full-screen login card를 사용한다.

### 관리자 전용 shell/layout 사용 기준

- 인증 이후의 관리자 화면은 `components/admin/admin-shell.tsx`의 `AdminShell`로 감싼다.
- 신규 관리자 화면 기본 형태:

```tsx
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminExamplePage() {
  return (
    <AdminShell>
      {/* page content */}
    </AdminShell>
  );
}
```

---

## 3. 관리자 CMS 공통 레이아웃 규칙

### 좌측 사이드바

현재 `AdminShell`은 `navigation` 배열을 내부에 두고 있다.

```tsx
const navigation = [
  { label: "대시보드", href: "/admin/dashboard" },
  { label: "보물상자" },
  { label: "상품 관리", href: "/admin/products" },
  { label: "매핑 관리", href: "/admin/mappings" },
  { label: "보상 재처리", href: "/admin/reward-requests" },
  { label: "유저" },
  { label: "문의", href: "/admin/inquiries" },
  { label: "운영 로그" },
];
```

규칙:

- 구현된 메뉴는 `href`를 둔다.
- 아직 구현하지 않은 메뉴는 `href` 없이 `준비 중` 표시를 유지한다.
- 메뉴 active 처리는 `pathname === href` 또는 하위 route `pathname.startsWith(...)` 기준이다.
- 신규 메뉴를 추가할 때는 `AdminShell` 수정 영향 범위를 PR 설명에 명시한다.

현재 코드 기준 주의:

- `/admin/rewards/[id]`는 현재 사이드바에서 `보상 재처리` active 처리에 포함되어 있지 않다. 필요 여부는 현재 코드 기준 확인 필요.
- 보물, 유저, 운영 로그, 보안 로그, 관리자 계정 메뉴는 일부 문서에 정의되어 있으나 현재 구현 상태는 준비 중이다.

### 상단 바

`AdminShell` 상단 바 구성:

- 좌측: `캐치캐쉬 CMS` 로고 링크, `/admin/dashboard` 이동
- 우측: 비활성 전역 검색 input, role 배지 `super_admin`, 관리자 아바타 `김운`
- 높이: `h-16`
- 배경: `bg-white`
- border: `border-b border-[#e5e7eb]`

상단 바는 화면별로 새로 만들지 않는다.

### 콘텐츠 영역

`AdminShell`의 main 기준:

- `main`: `min-w-0 flex-1 p-8`
- 전체 shell: `fixed inset-0 z-50 min-w-[980px] overflow-auto bg-[#f8fafc]`
- 관리자 화면은 최소 데스크톱 폭 `980px`을 전제로 한다.

화면 내부 권장 spacing:

- 페이지 헤더 아래 첫 섹션: `mt-7`
- 테이블 상단 정보/토스트: `mt-4`
- 카드 간격: `gap-4`, `gap-5`, `space-y-4`, `space-y-5`
- 카드 padding: `p-5` 또는 `p-6`

### 페이지 제목/설명 영역

목록/상세/등록 화면은 상단에 아래 패턴을 사용한다.

```tsx
<div className="flex items-end justify-between">
  <div>
    <h1 className="text-2xl font-bold">화면 제목</h1>
    <p className="mt-2 text-sm text-[#6b7280]">화면 설명</p>
  </div>
  <div className="flex gap-2">{/* actions */}</div>
</div>
```

규칙:

- 제목은 문서의 화면명과 일치시킨다.
- 설명에는 `mock data 기준`, `shell`, `실제 저장 없음` 등 현재 동작 한계를 명확히 적는다.
- 오른쪽 액션이 2개 이상이면 `div.flex.gap-2`로 묶는다.

### 검색/필터 영역

목록 화면은 제목 아래에 필터 카드 패턴을 사용한다.

```tsx
<section className="mt-7 rounded-lg border border-[#e5e7eb] bg-white p-4">
  <div className="grid grid-cols-[minmax(240px,1fr)_150px_180px_auto] gap-3">
    {/* input/select/date/button */}
  </div>
</section>
```

규칙:

- 검색 input은 첫 컬럼에 둔다.
- 상태 select, 기간 date input, 정렬 select는 같은 카드 안에 둔다.
- 필터 변경 시 `setPage(1)` 또는 `resetPage()`를 호출한다.
- 날짜 range가 있으면 `startDate > endDate` 오류를 화면에 표시한다.
- 필터 초기화 버튼은 `초기화` 또는 `필터 초기화` 문구를 사용한다.

### 테이블 영역

공통 table shell:

```tsx
<section className="mt-4 overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
  <table className="w-full text-left text-sm">
    <thead className="bg-[#f9fafb] text-xs text-[#6b7280]">
      <tr>
        <th className="px-5 py-3 font-medium">컬럼명</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
        <td className="px-5 py-4">값</td>
      </tr>
    </tbody>
  </table>
</section>
```

규칙:

- ID 값은 `font-mono text-xs`를 사용한다.
- 긴 텍스트는 `truncate`와 `max-w-*`를 사용한다.
- 상세 이동은 우측 끝 `액션` 또는 `상세` 컬럼에 배치한다.
- row click modal을 사용할 때는 `cursor-pointer hover:bg-[#f9fafb]`를 사용한다.

### 페이지네이션

권장 위치:

- 테이블 아래 `mt-4`
- 총 개수와 함께 표시하거나 우측 정렬한다.

권장 스타일:

```tsx
<button
  aria-current={page === pageNumber ? "page" : undefined}
  className={`h-8 min-w-8 rounded-md px-2 ${
    page === pageNumber
      ? "bg-[#111827] text-white"
      : "border border-[#d1d5db] bg-white text-[#374151]"
  }`}
>
  {pageNumber}
</button>
```

### 모달/팝업

공통 modal shell:

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  className="fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6"
>
  <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
    <h2 id="dialog-title" className="text-lg font-bold">제목</h2>
    {/* content */}
  </div>
</div>
```

규칙:

- overlay는 `fixed inset-0 z-[60]`.
- 기본 dim은 `bg-black/40`, 중요 확인 모달은 필요 시 `bg-black/55`.
- 중앙 card는 `rounded-lg` 또는 강조 모달의 `rounded-2xl`.
- 확인/취소 버튼은 하단 `mt-6 flex justify-end gap-2`.

---

## 4. 공통 컴포넌트 및 반복 패턴 사용 규칙

현재 `components/admin`의 실제 공통 컴포넌트는 `AdminShell` 하나이다. 카드, 상태 배지, 상세 row, form section, modal은 각 page 내부 local helper로 반복 구현되어 있다.

### `AdminShell`

| 항목 | 내용 |
|---|---|
| 파일 | `components/admin/admin-shell.tsx` |
| 사용 위치 | `/admin/login`을 제외한 대부분의 `/admin/**` 화면 |
| 사용 목적 | 관리자 CMS 전용 상단 바, 좌측 사이드바, 본문 padding 제공 |
| props | `children: ReactNode` |

사용 예시:

```tsx
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <h1 className="text-2xl font-bold">상품 목록</h1>
    </AdminShell>
  );
}
```

주의사항:

- 사용자 앱 화면에서 사용하지 않는다.
- `/admin/login`에서는 사용하지 않는다.
- 메뉴 추가 시 active 조건도 함께 업데이트한다.
- 현재 role과 관리자명은 mock 고정값이다.

### 관리자 사이드바 패턴

| 항목 | 내용 |
|---|---|
| 구현 위치 | `AdminShell` 내부 `navigation` 배열 |
| 사용 목적 | 구현된 CMS 영역으로 이동 |
| props | 없음 |

주의사항:

- 구현 전 메뉴는 `href` 없이 준비 중으로 표시한다.
- 새 route가 기존 메뉴 하위라면 `pathname.startsWith(...)` active 조건을 추가한다.
- 보상 상세 `/admin/rewards/[id]`의 active 메뉴 연동은 현재 코드 기준 확인 필요.

### 관리자 상단 바 패턴

| 항목 | 내용 |
|---|---|
| 구현 위치 | `AdminShell` 내부 `header` |
| 구성 | 로고, 비활성 전역 검색, role 배지, 관리자 아바타 |
| 사용 목적 | 관리자 CMS 공통 context 표시 |

주의사항:

- 전역 검색은 현재 disabled placeholder이다.
- 실제 role/session 연동은 현재 코드 기준 미구현이다.
- 신규 화면에서 별도 top bar를 만들지 않는다.

### `FormSection` local pattern

| 항목 | 내용 |
|---|---|
| 사용 위치 | `app/admin/products/new/page.tsx`, `app/admin/mappings/new/page.tsx` |
| 사용 목적 | 등록/생성 화면의 입력 섹션 카드 |
| props | `title`, `description?`, `children` |

사용 예시:

```tsx
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
```

주의사항:

- 현재 공통 컴포넌트로 분리되어 있지 않다.
- 여러 화면에서 동일하게 필요해질 경우 `components/admin` 분리 여부는 별도 PR에서 검토한다.

### `DetailCard` / `DetailRow` local pattern

| 항목 | 내용 |
|---|---|
| 사용 위치 | `app/admin/products/[id]/page.tsx`, `app/admin/rewards/[id]/page.tsx`, `app/admin/reward-requests/history/page.tsx` |
| 사용 목적 | 상세 화면의 key-value 정보 표시 |
| props | `DetailCard`: `title`, `description?`, `children`; `DetailRow`: `label`, `value` |

사용 예시:

```tsx
function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-t border-[#f3f4f6] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <dt className="text-sm text-[#6b7280]">{label}</dt>
      <dd className="max-w-[68%] text-right text-sm font-medium text-[#111827]">{value}</dd>
    </div>
  );
}
```

주의사항:

- ID 값은 `font-mono text-xs`로 표시한다.
- 민감 정보는 row로 만들지 않는다.
- 없거나 해당 없음 값은 `-`를 사용한다.

### 상태 배지 local pattern

| 항목 | 내용 |
|---|---|
| 사용 위치 | 상품, 매핑, 문의, 보상 목록/상세/이력 |
| 사용 목적 | 상태값을 작은 pill badge로 표시 |
| props | 화면마다 다르나 보통 `label`, `status` 또는 `value` |

공통 스타일:

```tsx
<span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>
  {label}
</span>
```

권장 tone:

- 성공/활성: `bg-[#dcfce7] text-[#166534]`
- 진행/대기/ready: `bg-[#dbeafe] text-[#1d4ed8]`
- 경고/읽는 중/만료/품절: `bg-[#fef3c7] text-[#92400e]`
- 실패/위험/invalid/deleted: `bg-[#fee2e2] text-[#991b1b]`
- 비활성/없음/취소: `bg-[#f3f4f6] text-[#4b5563]`

주의사항:

- `processing`은 보상 상태로 쓰지 말고 재처리 요청 상태에서만 사용한다.
- 화면마다 상태 label constant를 `lib/admin/mock-*.ts`에 둔다.

### 버튼 패턴

| 종류 | 스타일 | 사용 예 |
|---|---|---|
| 강조 버튼 | `rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-black` | 등록, 생성, 저장 |
| 보조 버튼 | `rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:bg-[#f9fafb]` | 목록으로, 취소, CSV |
| 비활성 버튼 | `disabled:cursor-not-allowed disabled:bg-[#9ca3af]` 또는 `disabled:text-[#9ca3af]` | 조건 미충족 |
| 링크 액션 | `font-medium underline underline-offset-2` | 상세, 이력 보기 |
| 위험 텍스트 액션 | `text-[#b91c1c] underline underline-offset-2` | 비활성화 |

### 빈 상태/준비 중 패턴

빈 목록:

```tsx
<div className="px-6 py-16 text-center">
  <p className="text-sm font-semibold text-[#111827]">검색 결과 없음</p>
  <p className="mt-2 text-sm text-[#6b7280]">입력한 조건과 일치하는 항목이 없습니다.</p>
</div>
```

준비 중 메뉴:

```tsx
<span className="block rounded-md px-3 py-2.5 text-sm text-[#9ca3af]">
  메뉴명
  <small className="ml-2 text-[10px]">준비 중</small>
</span>
```

---

## 5. 관리자 CMS 라우트 규칙

### 현재 구현된 라우트

| 도메인 | Route | 파일 | 상태 |
|---|---|---|---|
| 로그인 | `/admin/login` | `app/admin/login/page.tsx` | 구현 |
| 대시보드 | `/admin/dashboard` | `app/admin/dashboard/page.tsx` | 구현 |
| 상품 관리 | `/admin/products` | `app/admin/products/page.tsx` | 구현 |
| 상품 관리 | `/admin/products/new` | `app/admin/products/new/page.tsx` | 구현 |
| 상품 관리 | `/admin/products/[id]` | `app/admin/products/[id]/page.tsx` | 구현 |
| 매핑 관리 | `/admin/mappings` | `app/admin/mappings/page.tsx` | 구현 |
| 매핑 관리 | `/admin/mappings/new` | `app/admin/mappings/new/page.tsx` | 구현 |
| 보상 재처리 | `/admin/reward-requests` | `app/admin/reward-requests/page.tsx` | 구현 |
| 보상 재처리 | `/admin/reward-requests/history` | `app/admin/reward-requests/history/page.tsx` | 구현 |
| 보상 상세 | `/admin/rewards/[id]` | `app/admin/rewards/[id]/page.tsx` | 구현 |
| 문의 관리 | `/admin/inquiries` | `app/admin/inquiries/page.tsx` | 구현 |
| 문의 관리 | `/admin/inquiries/[id]` | `app/admin/inquiries/[id]/page.tsx` | 구현 |

### 앞으로 만들 화면 후보

| 도메인 | Route | 권장 파일 | 현재 상태 |
|---|---|---|---|
| 관리자 계정 | `/admin/accounts` | `app/admin/accounts/page.tsx` | 후보 |
| 관리자 계정 | `/admin/accounts/new` | `app/admin/accounts/new/page.tsx` | 후보 |
| 관리자 계정 | `/admin/accounts/[id]` | `app/admin/accounts/[id]/page.tsx` | 후보 |
| 유저 | `/admin/users` | `app/admin/users/page.tsx` | 후보 |
| 유저 | `/admin/users/[id]` | `app/admin/users/[id]/page.tsx` | 후보 |
| 보물상자 | `/admin/treasures` | `app/admin/treasures/page.tsx` | 후보 |
| 보물상자 | `/admin/treasures/new` | `app/admin/treasures/new/page.tsx` | 후보 |
| 보물상자 | `/admin/treasures/[id]` | `app/admin/treasures/[id]/page.tsx` | 후보 |
| 보물상자 | `/admin/treasures/[id]/edit` | `app/admin/treasures/[id]/edit/page.tsx` | 후보 |
| 보안 로그 | `/admin/security-logs` | `app/admin/security-logs/page.tsx` | 후보 |
| 보안 로그 | `/admin/security-logs/[id]` | `app/admin/security-logs/[id]/page.tsx` | 후보 |
| 운영 로그 | `/admin/operation-logs` | `app/admin/operation-logs/page.tsx` | 후보 |
| 접근 제한 | `/admin/access-denied` | `app/admin/access-denied/page.tsx` | 후보 |

라우트 규칙:

- 목록: `/admin/{domain}`
- 생성: `/admin/{domain}/new`
- 상세: `/admin/{domain}/[id]`
- 수정: `/admin/{domain}/[id]/edit`
- 이력/보조 화면: 기존 목록 하위에 의미 있는 path를 둔다. 예: `/admin/reward-requests/history`

---

## 6. mock data 작성 규칙

### 파일 네이밍

현재 `lib/admin` mock 파일:

| 파일 | 용도 |
|---|---|
| `lib/admin/mock-inquiries.ts` | 문의 mock 타입/데이터/label/date formatter |
| `lib/admin/mock-products.ts` | 상품 mock 타입/데이터/상세 helper |
| `lib/admin/mock-mappings.ts` | 상품-보물 매핑 mock 타입/데이터/helper |
| `lib/admin/mock-reward-requests.ts` | 보상, 재처리 요청, 보상 상세 mock 타입/데이터/helper |
| `lib/admin/support-service.ts` | 문의 Supabase fallback service |

신규 mock 파일은 `mock-{domain}.ts` 형식을 사용한다.

예:

- `mock-users.ts`
- `mock-treasures.ts`
- `mock-security-logs.ts`
- `mock-operation-logs.ts`
- `mock-admin-accounts.ts`

### 분리 기준

- 화면 도메인 단위로 분리한다.
- 같은 도메인의 목록/상세/이력 데이터는 한 파일에 둔다.
- 다른 도메인에서 재사용해야 하는 타입은 export한다.
- 화면 내부에서만 쓰는 작은 폼 타입은 page 파일 내부에 둘 수 있다.

### 타입 정의 위치

- mock data shape는 `lib/admin/mock-*.ts`에 `export type`으로 둔다.
- label map도 같은 파일에 둔다.
- date/price formatter도 같은 파일에 둔다.

예:

```ts
export type AdminProductStatus = "active" | "inactive";

export const ADMIN_PRODUCT_STATUS_LABEL: Record<AdminProductStatus, string> = {
  active: "active",
  inactive: "inactive",
};
```

### ID 네이밍 예시

현재 코드 기준 ID 예시:

| 도메인 | 예시 |
|---|---|
| 상품 | `prod-starbucks-americano-tall` |
| 외부 상품 ID | `GFT-10234` |
| 매핑 | `M-1042` |
| 보물 | `treasure-gangnam-station-01` |
| 보상 | `reward-20260809-001` |
| 재처리 요청 | `REQ-0041` |
| 유저 public ID | `USR-2048` |
| 문의 | UUID, 화면 표시 시 `INQ-{id.slice(0, 8).toUpperCase()}` |

규칙:

- 사람이 읽을 수 있는 mock ID를 사용한다.
- 실제 운영 ID처럼 보이되 실제 개인정보, 쿠폰 번호, 바코드로 오해될 값은 넣지 않는다.
- 화면 표시용 ID는 `font-mono text-xs`를 사용한다.

### 날짜 포맷

mock data 원본:

- ISO string 사용
- Asia/Seoul offset 포함 권장: `2026-08-09T09:12:00+09:00`

화면 표시:

- `Intl.DateTimeFormat("ko-KR", { year, month, day, hour, minute, hour12: false })`
- 날짜만 표시할 때는 `year/month/day`만 사용

### 상태값 작성 기준

- status union type을 먼저 정의한다.
- label map을 반드시 함께 둔다.
- 필터 select는 label map 또는 union literal을 기준으로 렌더링한다.
- 새 상태값 추가 시 상태 배지 tone도 함께 정의한다.

### 민감정보 금지

mock data라도 아래 값은 넣지 않는다.

- 실제 쿠폰 번호
- 실제 바코드
- 실제 사용자 이메일/전화번호
- 실제 외부 API Secret
- 실제 service role key
- 실제 기프티쇼 API 응답 원문

---

## 7. 상태값 표시 규칙

현재 코드에서 확인한 상태값 기준 표이다. 아직 구현되지 않은 `suspended` 등은 현재 코드 기준 확인 필요로 표시한다.

| 상태값 | 표시명 | 권장 배지 스타일 | 사용 화면/파일 | 주의사항 |
|---|---|---|---|---|
| `active` | active | `bg-[#dcfce7] text-[#166534]` | 상품, 매핑, 보물, 상품 상태 | 활성/정상 운영 |
| `inactive` | inactive | `bg-[#f3f4f6] text-[#4b5563]` | 상품, 매핑, 보물 | 비활성. 위험 액션과 혼동하지 않는다. |
| `deleted` | deleted | `bg-[#fee2e2] text-[#991b1b]` | 매핑의 보물 상태 | 삭제된 보물. 선택 목록에서 제외 권장 |
| `visible` | visible | `bg-[#dcfce7] text-[#166534]` | 매핑 목록 calculated status | 사용자 앱 노출 가능 상태 |
| `scheduled` | scheduled | `bg-[#dbeafe] text-[#1d4ed8]` | 매핑 목록 calculated status | 예약/대기 |
| `expired` | expired | `bg-[#fef3c7] text-[#92400e]` 또는 회색 | 매핑, 보상 | 만료. 도메인별 tone 확인 |
| `sold_out` | sold_out | `bg-[#fef3c7] text-[#92400e]` | 매핑/보물 옵션 | 소진 상태 |
| `invalid` | invalid | `bg-[#fee2e2] text-[#991b1b]` | 매핑 calculated status | 운영 불가 상태 |
| `ready` | ready | `bg-[#dbeafe] text-[#1d4ed8]` | 보상 목록/상세 | 발급 전 보상 상태 |
| `issued` | issued | `bg-[#dcfce7] text-[#166534]` | 보상 목록/상세 | 쿠폰 원문은 표시 금지 |
| `used` | used | `bg-[#dcfce7] text-[#166534]` | 보상 상세 | 사용 완료 |
| `failed` | failed | `bg-[#fee2e2] text-[#991b1b]` | 보상, 재처리 요청 | 보상 실패 또는 재처리 실패. 문맥 확인 |
| `canceled` | canceled | `bg-[#f3f4f6] text-[#4b5563]` | 보상, 재처리 이력 | 취소 상태 |
| `none` | 요청 없음 | `bg-[#f3f4f6] text-[#4b5563]` | 보상 재처리 상태 | 재처리 요청 없음 |
| `requested` | 요청됨 | `bg-[#dbeafe] text-[#1d4ed8]` | A15 보상 목록 | 목록용 retry status |
| `in_progress` | 처리 중 | `bg-[#dbeafe] text-[#1d4ed8]` | A15 보상 목록 | 목록용 retry status |
| `succeeded` | 성공 | `bg-[#dcfce7] text-[#166534]` | A15 보상 목록 | 목록용 retry status |
| `pending` | pending | `bg-[#f3f4f6] text-[#4b5563]` 또는 파랑 | A16_2 이력, A16 상세 | 재처리 요청 상태. 보상 상태로 사용 금지 |
| `processing` | processing | `bg-[#dbeafe] text-[#1d4ed8]` | A16_2 이력, A16 상세 | 재처리 요청 상태. 보상 상태로 사용 금지 |
| `success` | success | `bg-[#dcfce7] text-[#166534]` | A16_2 이력 | Worker 처리 성공 |
| `reading` | 읽는 중 | `bg-[#fef3c7] text-[#92400e]` | 문의 목록/상세 | 처리 중인 문의 |
| `resolved` | 해결됨 | `bg-[#dcfce7] text-[#166534]` | 문의 목록/상세 | 답변 완료/해결 |
| `suspended` | 현재 코드 기준 확인 필요 | 현재 코드 기준 확인 필요 | 현재 코드 기준 미사용 | 유저/계정 화면 구현 시 정의 필요 |

---

## 8. 테이블 작성 규칙

### 검색/필터 영역

- 테이블 위에 별도 card를 둔다.
- 검색 input placeholder는 검색 가능한 대상을 구체적으로 적는다.
- 상태 필터는 `상태 전체`, `재처리 전체`, `상품 전체`처럼 도메인 문맥을 포함한다.
- 날짜 필터는 `type="date"`를 사용한다.
- 필터 변경 시 page를 1로 초기화한다.

### 총 개수 표시

권장:

```tsx
<div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
  <span>총 {filteredItems.length}건 · mock data</span>
  <span>민감정보 미표시 안내</span>
</div>
```

페이지 구간 표시가 필요하면:

```tsx
<span>{startItemNumber}-{endItemNumber} / {filteredItems.length}건</span>
```

### 컬럼명

- 한글 명사형 사용: `상품명`, `상태`, `등록일`, `액션`
- ID 컬럼은 `{도메인} ID`로 적는다.
- 액션 컬럼은 우측 끝에 둔다.

### ID 표시

- ID는 `font-mono text-xs`를 사용한다.
- UUID는 전체 표시가 필요 없으면 화면 표시용 prefix를 만든다.
- 예: `INQ-{item.id.slice(0, 8).toUpperCase()}`

### 상태 배지

- 상태 컬럼은 text만 두지 말고 `StatusBadge` 패턴을 사용한다.
- 같은 row에 상태가 여러 개면 세로 gap으로 구분한다.

### 상세 링크

- 목록 화면에서는 우측 `상세` 또는 `액션` 컬럼에 둔다.
- 상세 route가 아직 없으면 shell 단계에서는 링크만 연결하거나 placeholder 모달로 처리한다.
- 새 상세 화면을 이번 PR 범위로 만들지 않는 경우 route 파일을 생성하지 않는다.

### 빈 상태 문구

검색 결과 없음:

```txt
검색 결과 없음
입력한 조건과 일치하는 항목이 없습니다. 필터를 조정해 주세요.
```

초기 데이터 없음:

```txt
아직 등록된 항목이 없습니다.
```

### CSV 내보내기

- shell 단계에서는 버튼과 확인 팝업만 제공한다.
- 실제 CSV 파일 생성/다운로드/API 호출은 하지 않는다.
- 팝업에는 민감정보 미포함 문구를 반드시 넣는다.

---

## 9. 버튼/액션 규칙

| 액션 | 문구 예시 | 스타일 | 동작 기준 |
|---|---|---|---|
| 기본/보조 | `목록으로`, `취소` | 흰 배경 + 회색 border | route 이동 또는 모달 닫기 |
| 강조 | `상품 등록`, `저장`, `요청 생성` | 검정 배경 + 흰 글자 | mock 저장 후 목록 이동 또는 toast |
| 상세 보기 | `상세`, `상세 보기` | underline text | 상세 route 이동 또는 확인 모달 |
| 등록/생성 | `상품 등록`, `매칭 등록·교체`, `재처리 요청 생성` | 강조 버튼 | 실제 저장 없이 mock 처리 |
| 수정 | `상품 수정` | 강조 버튼 | shell 링크만 제공 가능 |
| CSV | `CSV 내보내기` | 보조 버튼 | 확인 팝업만 제공 |
| 위험 액션 | `비활성화` | 빨간 underline 또는 확인 모달 | 사유 입력 후 local state mock 변경 |
| 목록 복귀 | `{도메인} 목록으로`, `목록으로 돌아가기` | 보조 버튼 | 목록 route 이동 |

shell 단계 버튼 처리:

- `await new Promise((resolve) => window.setTimeout(resolve, 500))` 패턴으로 mock 저장 지연을 표현할 수 있다.
- 저장 후 route 이동은 `router.push(...)`.
- 실제 DB insert/update/delete는 하지 않는다.
- 성공은 toast 또는 목록 이동으로 표현한다.
- 실패는 validation dialog 또는 inline error로 표현한다.

---

## 10. 모달/팝업 규칙

현재 구현된 모달 예:

| 화면 | 모달 |
|---|---|
| `app/admin/products/page.tsx` | CSV 내보내기 확인 |
| `app/admin/products/new/page.tsx` | 저장 실패 안내 |
| `app/admin/products/[id]/page.tsx` | inactive 전환 경고 |
| `app/admin/mappings/page.tsx` | 매칭 비활성화 확인 |
| `app/admin/mappings/new/page.tsx` | 매칭 교체 확인 |
| `app/admin/reward-requests/page.tsx` | CSV 내보내기, 재처리 요청 생성 |
| `app/admin/reward-requests/history/page.tsx` | CSV 내보내기, 재처리 요청 상세 |
| `app/admin/rewards/[id]/page.tsx` | 재처리 요청 생성 |
| `app/admin/inquiries/page.tsx` | 문의 상세 이동 확인 |

### overlay

- 기본: `fixed inset-0 z-[60] grid place-items-center bg-black/40 p-6`
- 중요한 생성/재처리 모달: 필요 시 `bg-black/55`

### 중앙 모달

- 기본: `w-full max-w-md rounded-lg bg-white p-6 shadow-xl`
- 긴 상세: `max-h-[86vh] overflow-auto`
- 강조 생성 팝업: `rounded-2xl`

### 버튼

- 하단 우측 정렬: `mt-6 flex justify-end gap-2`
- 취소는 보조 버튼, 확인은 강조 버튼
- 저장 중에는 disabled 처리

### 실제 저장/API 호출 금지

- shell 단계 모달에서는 외부 API 호출을 하지 않는다.
- Supabase insert/update/delete를 하지 않는다.
- 파일 다운로드를 만들지 않는다.
- 결과는 local state, toast, route 이동으로만 표현한다.

### 민감정보 안내 문구

CSV/보상/재처리 관련 모달에는 아래 취지의 문구를 포함한다.

```txt
쿠폰 번호, 바코드, 사용자 이메일, 외부 API Secret은 포함하지 않습니다.
이 팝업은 기프티쇼비즈 API를 직접 호출하지 않습니다.
```

---

## 11. 보안/민감정보 표시 금지 규칙

### 절대 표시 금지

- 실제 쿠폰 번호
- 바코드 값
- 바코드 원문
- 바코드 마스킹 값
- 쿠폰 PIN
- 외부 API Secret
- Supabase `service_role` key
- 사용자 이메일
- 사용자 전화번호
- 소셜 provider 식별자
- 주민번호
- 주소
- 실제 기프티쇼 API 응답 원문
- provider access token

### 표시 가능한 정보

- mock user ID 또는 public ID: `USR-2048`
- `user_id` 일부: `user_id.slice(0, 8)`
- nickname
- reward_id
- treasure_id
- product display name
- product ID
- external request tracking ID
- 실패 코드
- 상태값
- 생성일/수정일/처리일
- mock 값임이 분명한 내부 운영 메모

### 화면 문구 기준

민감정보가 관련된 화면에는 하단 또는 요약 영역에 안내 문구를 둔다.

예:

```txt
쿠폰 번호, 바코드, 사용자 이메일은 목록과 CSV에 포함하지 않습니다.
```

---

## 12. Supabase 연결 금지/허용 기준

### shell 화면 기준

- 새 CMS shell 화면에서는 Supabase 연결을 하지 않는다.
- `lib/admin/mock-*.ts` 데이터를 우선 사용한다.
- 실제 API route 호출도 하지 않는다.
- `package.json`, `package-lock.json`을 수정하지 않는다.
- 외부 SDK 또는 새 dependency를 추가하지 않는다.

### 문의 화면 예외

현재 코드 기준 `app/admin/inquiries/**`는 `lib/admin/support-service.ts`를 통해 Supabase fallback 구조가 존재한다.

- 관리자 세션/RPC가 없으면 mock 문의를 표시한다.
- Supabase 연결이 가능한 경우 `support_inquiries`, `support_replies`, `profiles`, `notifications`를 조회/사용한다.
- 이 구조는 기존 구현으로 유지한다.
- 새 shell 화면에서 이 패턴을 임의 복제하지 않는다.

### 금지

- 브라우저에서 `service_role` key 사용 금지
- 관리자 shell 화면에서 외부 발급 API 직접 호출 금지
- 쿠폰 재발급/보상 재지급 직접 실행 금지
- Supabase schema 또는 RLS 변경을 같은 shell PR에 포함 금지

### 향후 연결 단계

- Supabase 연결은 별도 PR로 진행한다.
- 연결 PR에서는 인증/권한/서버 API/RLS/에러 상태를 별도 문서 기준으로 다룬다.
- shell PR과 실제 연동 PR을 섞지 않는다.

---

## 13. 팀원 작업 규칙

1. 최신 `main` 또는 기준 브랜치를 pull한 뒤 새 브랜치를 만든다.
2. 화면 1개당 PR 1개를 원칙으로 한다.
3. 반드시 `docs/admin-cms/screens/*.md` 기준으로 구현한다.
4. 작업 시작 전에 수정 가능 파일과 수정 금지 파일을 명확히 적는다.
5. 기존 화면 영향은 최소화한다.
6. 신규 화면은 기본적으로 `app/admin/**`와 `lib/admin/mock-*.ts`만 수정한다.
7. `components/admin` 수정은 공통 영향 범위를 PR 설명에 명시한다.
8. 사용자 앱 파일은 수정하지 않는다.
9. `package.json`, `package-lock.json`은 수정하지 않는다.
10. shell 단계에서는 Supabase/API 연결을 추가하지 않는다.
11. mock data에는 민감정보를 넣지 않는다.
12. `npm run lint`와 `npm run build`를 통과시킨다.

수정 금지 예:

- `app/home/**`
- `app/profile/**`
- `app/support/**` 단, 문의 CMS 작업과 사용자 support 화면은 별개
- `app/inventory/**`
- `app/map/**`
- `app/ar-hunt/**`
- `app/hall-of-fame/**`
- `components/layout/**`
- `package.json`
- `package-lock.json`
- `supabase/**`

---

## 14. 브랜치/커밋/PR 네이밍 규칙

### 브랜치명

형식:

```txt
feature/admin-{domain}-{screen}-shell
```

예:

- `feature/admin-user-list-shell`
- `feature/admin-user-detail-shell`
- `feature/admin-security-log-list-shell`
- `feature/admin-treasure-create-shell`
- `feature/admin-account-detail-shell`
- `feature/admin-operation-log-list-shell`

### 커밋 메시지

형식:

```txt
feat: add admin {domain} {screen} shell
refactor: align admin {domain} {screen} with md spec
docs: add admin cms coding guide
```

예:

- `feat: add admin user list shell`
- `feat: add admin treasure create shell`
- `feat: add admin security log detail shell`
- `refactor: align admin inquiry list with md spec`
- `docs: add admin cms coding guide`

### PR 제목

형식:

```txt
[Admin CMS] Add {화면명} shell
```

예:

- `[Admin CMS] Add user list shell`
- `[Admin CMS] Add treasure create shell`
- `[Admin CMS] Add reward detail shell`

### PR 설명 템플릿

```md
## Summary
- `docs/admin-cms/screens/{MD_FILE}.md` 기준으로 `{route}` 화면 shell을 구현했습니다.
- Supabase/API 연결 없이 `lib/admin/mock-*.ts` mock data를 사용했습니다.
- 민감정보(쿠폰 번호, 바코드, 사용자 이메일, API Secret)는 표시하지 않았습니다.

## Scope
- Added/updated route: `{route}`
- Changed files:
  - `app/admin/...`
  - `lib/admin/mock-...`
  - `components/admin/...` (수정한 경우 영향 범위 설명)

## Test Plan
- [ ] `{route}` 화면이 정상 표시됩니다.
- [ ] 검색/필터/페이지네이션 또는 상세/등록 shell 동작이 문서 기준과 일치합니다.
- [ ] 기존 관리자 화면에 영향이 없습니다.
- [ ] 사용자 앱 화면에 영향이 없습니다.
- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과

## Notes
- 실제 저장/API 호출/Supabase 연결은 이번 PR 범위가 아닙니다.
- 현재 코드 기준 확인 필요 항목: `{있으면 작성}`
```

---

## 15. Cursor 작업 프롬프트 템플릿

아래 템플릿을 새 CMS 화면 작업 요청에 복사해서 사용한다.

```txt
현재 브랜치는 feature/admin-{domain}-{screen}-shell 입니다.

이번 작업은 관리자 CMS {화면명} 화면 1개만 구현합니다.

반드시 아래 Git 문서 기준으로 작업해주세요.
- docs/admin-cms/screens/{SCREEN_MD_FILE}.md

작업 목표:
- 관리자 CMS {화면명} 화면을 구현합니다.
- 이번 PR에서는 {화면명} 화면만 작업합니다.
- Supabase 연결 없이 mock data 기반으로 구현합니다.
- 기존 관리자 CMS 레이아웃과 사이드바 톤을 유지합니다.

권장 라우트:
- /admin/{route}

작업 범위:
1. /admin/{route} 페이지 생성 또는 수정
2. {SCREEN_MD_FILE} 기준으로 UI 구현
3. 필요한 mock data는 lib/admin/mock-{domain}.ts에 추가 또는 최소 확장
4. 검색/필터/상태/페이지네이션/모달이 MD에 정의되어 있으면 shell로 반영
5. 실제 저장/API 호출/Supabase 연결은 하지 않음

수정 가능:
- app/admin/{route}/page.tsx
- lib/admin/mock-{domain}.ts
- components/admin/** 단, 공통 관리자 UI 재사용 또는 사이드바 최소 수정이 필요한 경우

수정 금지:
- app/page.tsx
- app/login/page.tsx
- app/nickname/page.tsx
- app/home/**
- app/profile/**
- app/support/** 단, 사용자 support 화면
- app/inventory/**
- app/map/**
- app/ar-hunt/**
- app/hall-of-fame/**
- components/layout/**
- package.json
- package-lock.json
- supabase/**
- 실제 Supabase/Auth/API 연결 금지

주의:
- 실제 쿠폰 번호, 바코드, 외부 API Secret, 사용자 개인정보를 표시하지 마세요.
- 실제 보상 재지급, 쿠폰 재발급, 외부 API 호출을 하지 마세요.
- 이번 작업은 {화면명} 화면만입니다.

완료 기준:
- /admin/{route} 화면 정상 표시
- MD 파일의 목록 컬럼/입력 항목/상태/버튼/안내 기준 반영
- mock data 기반 표시
- 기존 관리자 화면 영향 없음
- 사용자 앱 화면 영향 없음
- npm run lint 통과
- npm run build 통과
```

---

## 16. PR 검수 체크리스트

### 변경 범위

- [ ] Files changed가 요청 범위 안에 있다.
- [ ] 사용자 앱 파일이 수정되지 않았다.
- [ ] `package.json`, `package-lock.json`이 수정되지 않았다.
- [ ] `supabase/**`가 수정되지 않았다.
- [ ] `components/admin` 수정이 있다면 영향 범위가 PR 설명에 적혀 있다.

### 라우트/화면

- [ ] 요청한 `/admin/**` route가 정상 표시된다.
- [ ] 화면 제목과 설명이 MD 문서와 일치한다.
- [ ] `AdminShell`을 사용해야 하는 화면에서 사용했다.
- [ ] `/admin/login`처럼 예외인 화면은 독립 layout 기준이 맞다.
- [ ] 사이드바 active 상태가 필요한 경우 반영되어 있다.

### MD 반영

- [ ] `docs/admin-cms/screens/*.md`의 필수 컬럼/필드가 반영되었다.
- [ ] 검색/필터/정렬/페이지네이션이 문서 기준으로 구현되었다.
- [ ] 버튼/모달/경고 문구가 문서 기준으로 구현되었다.
- [ ] 만들지 말라고 한 화면이나 route를 만들지 않았다.

### mock data

- [ ] `lib/admin/mock-*.ts`를 사용했다.
- [ ] 타입과 label map이 함께 정의되어 있다.
- [ ] 날짜는 ISO string 기준으로 작성되었다.
- [ ] ID는 실제처럼 보이지만 민감정보가 아니다.
- [ ] 없는 값은 `null` 또는 `-` 처리 기준이 일관된다.

### 보안

- [ ] 쿠폰 번호가 표시되지 않는다.
- [ ] 바코드 값이 표시되지 않는다.
- [ ] 사용자 이메일/전화번호가 표시되지 않는다.
- [ ] 외부 API Secret/service role key가 표시되지 않는다.
- [ ] 실제 기프티쇼 API 응답 원문이 표시되지 않는다.
- [ ] 보상/CSV/재처리 화면에는 민감정보 미포함 안내가 있다.

### 동작

- [ ] shell 단계 버튼이 실제 API/Supabase를 호출하지 않는다.
- [ ] 저장/생성은 mock 처리 또는 route 이동만 수행한다.
- [ ] CSV 내보내기는 확인 팝업만 제공한다.
- [ ] 위험 액션은 확인 모달과 사유 입력이 있다.
- [ ] 기존 관리자 화면이 깨지지 않는다.

### 검증

- [ ] `npm run lint` 통과
- [ ] `npm run build` 통과
- [ ] Preview에서 주요 route를 직접 확인했다.
- [ ] 빈 상태/에러 상태가 필요한 화면에서 표시된다.
- [ ] 접근 권한/role 연동이 필요한 부분은 현재 코드 기준 확인 필요로 남겼다.

---

## 분석 기준 파일 요약

이 문서는 아래 파일/디렉터리의 현재 구현을 기준으로 작성했다.

- `app/admin/login/page.tsx`
- `app/admin/dashboard/page.tsx`
- `app/admin/inquiries/page.tsx`
- `app/admin/inquiries/[id]/page.tsx`
- `app/admin/products/page.tsx`
- `app/admin/products/new/page.tsx`
- `app/admin/products/[id]/page.tsx`
- `app/admin/mappings/page.tsx`
- `app/admin/mappings/new/page.tsx`
- `app/admin/reward-requests/page.tsx`
- `app/admin/reward-requests/history/page.tsx`
- `app/admin/rewards/[id]/page.tsx`
- `components/admin/admin-shell.tsx`
- `lib/admin/mock-inquiries.ts`
- `lib/admin/mock-products.ts`
- `lib/admin/mock-mappings.ts`
- `lib/admin/mock-reward-requests.ts`
- `lib/admin/support-service.ts`
- `docs/admin-cms/screens/*.md`

## 현재 코드 기준 확인 필요 항목

- 실제 관리자 role/session 연동 방식
- `/admin/rewards/[id]`가 사이드바에서 어느 메뉴 active로 표시되어야 하는지
- 보안 로그, 운영 로그, 관리자 계정, 유저, 보물상자 화면의 최종 route/권한 정책
- 공통 `StatusBadge`, `DetailCard`, `FormSection`을 `components/admin`으로 분리할 시점
- A24 접근 제한 화면 구현 여부
