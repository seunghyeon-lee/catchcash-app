# A18. 유저 상세 화면 정의서

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | A18. 유저 상세 화면 정의서 |
| 파일명 | `A18_Admin_User_Detail_Screen.md` |
| 화면명 | 유저 상세 |
| 화면 ID | `A18_Admin_User_Detail_Screen` |
| 상위 도메인 | 유저 관리 |
| 관련 화면 | `A17_Admin_User_List_Screen`, `A15_Admin_Reward_List_Screen`, `A16_Admin_Reward_Detail_Screen`, `A19_Admin_Inquiry_List_Screen`, `A20_Admin_Inquiry_Detail_Screen`, `A21_Admin_Security_Log_List_Screen` |
| 작성 목적 | 관리자 CMS에서 특정 유저의 프로필, 운영 지표, 보상·문의 이력, 보안 로그 요약, 내부 메모, 정지·해제 액션을 관리하기 위한 화면 구현 기준 정의 |
| 구현 기준 | Next.js App Router + React + TypeScript + Tailwind CSS + Supabase |
| 권한 기준 | super_admin / operator / viewer |
| MVP 기준 | 사용자 이메일, 쿠폰 번호, 바코드 표시 금지 |

---

## 2. 화면 개요

유저 상세 화면은 특정 캐치캐쉬 사용자의 운영 정보를 확인하는 관리자 CMS 화면이다.

이 화면에서는 유저의 기본 프로필, 운영 지표, 보상 목록, 문의 목록, 내부 관리자 메모를 확인할 수 있다.  
super_admin은 추가로 유저 정지와 정지 해제를 실행할 수 있다.

중요:

```txt
사용자 이메일은 표시하지 않는다.
쿠폰 번호와 바코드는 표시하지 않는다.
유저 정지/해제는 super_admin만 가능하다.
operator는 조회와 내부 메모 작성만 가능하다.
viewer는 조회만 가능하며 내부 메모 작성과 정지/해제는 불가하다.
보안 로그 요약은 super_admin 전용으로 표시한다.
```

---

## 3. 화면 목적

### 3.1 관리자 목적

- 특정 유저의 서비스 이용 상태를 확인한다.
- 유저의 보상 획득, 문의, 재처리 요청 현황을 확인한다.
- 치팅 의심 또는 보안 이벤트 요약을 확인한다.
- 운영 대응을 위한 내부 메모를 남긴다.
- 필요 시 유저를 정지하거나 정지 해제한다.

### 3.2 시스템 목적

- 사용자 앱과 관리자 CMS의 유저 상태를 일관되게 관리한다.
- 유저 상태 변경 같은 위험 액션은 권한과 사유 입력을 강제한다.
- 개인정보와 쿠폰 민감 정보를 관리자 화면에 노출하지 않는다.
- 보상·문의·보안 로그 화면으로 이동할 수 있는 연결점을 제공한다.

---

## 4. 진입 조건

### 4.1 진입 경로

| 이전 화면 | 진입 액션 |
|---|---|
| A17 유저 목록 | 유저 선택 후 `유저 상세` 클릭 |
| A15 보상 목록 | 유저 컬럼 클릭 |
| A16 보상 상세 | 연관 정보의 유저 클릭 |
| A19 문의 목록 | 유저 컬럼 클릭 |
| A20 문의 상세 | 연관 유저 클릭 |
| A21 보안 로그 | 연관 유저 클릭 |

### 4.2 Route

```txt
/admin/users/{userId}
```

Next.js App Router 기준 권장 파일 경로:

```txt
app/admin/(protected)/users/[userId]/page.tsx
```

---

## 5. 접근 권한

### 5.1 접근 가능 조건

```txt
관리자 세션 존재
admin.status = active
admin.role in ('super_admin', 'operator', 'viewer')
```

### 5.2 권한 매트릭스

| 기능 | super_admin | operator | viewer |
|---|---:|---:|---:|
| 유저 기본 프로필 조회 | O | O | O |
| 운영 지표 조회 | O | O | O |
| 보상 목록 요약 조회 | O | O | O |
| 문의 목록 요약 조회 | O | O | O |
| 보안 로그 요약 조회 | O | X | X |
| 내부 관리자 메모 조회 | O | O | O |
| 내부 관리자 메모 저장 | O | O | X |
| 유저 정지 | O | X | X |
| 유저 정지 해제 | O | X | X |
| 보상 상세 이동 | O | O | O |
| 문의 상세 이동 | O | O | O |
| 보안 로그 상세 이동 | O | X | X |

---

## 6. 화면 구조

와이어프레임 기준 화면 구성은 아래 순서로 확정한다.

```txt
AdminLayout
→ 상단 헤더
→ 화면 타이틀 / 상단 액션
→ 좌측 메인 영역
   → 기본 프로필
   → 운영 지표
   → 보안 로그 요약
   → 내부 관리자 메모
→ 우측 보조 영역
   → 보상 목록
   → 문의 목록
→ 유저 정지 확인 팝업
→ 유저 정지 해제 확인 팝업
```

---

## 7. UI 구성 요소

## 7.1 AdminLayout

### 구성

```txt
좌측 사이드바
상단 헤더
본문 콘텐츠 영역
```

사이드바는 현재 로그인한 관리자 role 기준으로 허용된 메뉴만 표시한다.

---

## 7.2 상단 헤더

| 요소 | 설명 |
|---|---|
| 검색 입력 | 전역 검색 또는 현재 화면 검색 |
| 권한 표시 | 현재 관리자 role 표시 |
| 프로필 원형 | 관리자 이니셜 또는 기본 아바타 |

---

## 7.3 화면 타이틀 및 상단 액션

### 타이틀

```txt
유저 상세
```

### 우측 액션

| 버튼/링크 | 노출 권한 | 동작 |
|---|---:|---|
| `유저 목록으로` | 전체 | `/admin/users` 이동 |
| `보안 로그 상세로` | super_admin | 해당 유저 기준 보안 로그 목록 또는 상세 이동 |
| `유저 정지` | super_admin + user.status = active | 정지 확인 팝업 오픈 |
| `정지 해제` | super_admin + user.status = suspended | 정지 해제 확인 팝업 오픈 |

operator와 viewer에게는 `유저 정지`, `정지 해제`, `보안 로그 상세로` 버튼을 노출하지 않는다.

---

## 8. 기본 프로필 영역

## 8.1 표시 정보

| 항목 | 설명 |
|---|---|
| 아바타 | 기본 이니셜 또는 사용자 캐릭터 |
| 닉네임 | 사용자가 설정한 닉네임 |
| 유저 ID | 내부 식별자 |
| 로그인 제공자 | google / kakao / apple |
| 상태 | active / suspended / deleted / inactive |
| 가입일 | 서비스 가입일 |
| 최근 활동 | 마지막 활동 시각 |

### 표시 금지

```txt
사용자 이메일
전화번호
소셜 계정 원문 식별자
OAuth access token
OAuth refresh token
```

---

## 8.2 상태 배지

| 상태 | 의미 | UI |
|---|---|---|
| active | 정상 이용 가능 | 기본 배지 |
| suspended | 정지 상태 | 위험 배지 |
| deleted | 탈퇴 또는 삭제 | 비활성 배지 |
| inactive | 비활성 | 회색 배지 |

---

## 9. 운영 지표 영역

## 9.1 표시 카드

| 카드 | 설명 |
|---|---|
| 총 보상 획득 수 | 유저가 획득한 전체 보상 수 |
| 총 문의 수 | 유저가 등록한 문의 수 |
| 미처리 문의 | open 또는 in_progress 문의 수 |
| 재처리 요청 건수 | 해당 유저 보상과 연결된 재처리 요청 수 |

### 클릭 동작

| 카드 | 동작 |
|---|---|
| 총 보상 획득 수 | A15 보상 목록에 userId 필터로 이동 |
| 총 문의 수 | A19 문의 목록에 userId 필터로 이동 |
| 미처리 문의 | A19 문의 목록에 userId + open/in_progress 필터로 이동 |
| 재처리 요청 건수 | A16-2 재처리 요청 이력에 userId 또는 rewardId 기준 이동 가능 |

---

## 10. 보안 로그 요약 영역

## 10.1 노출 기준

```txt
super_admin에게만 표시한다.
operator와 viewer에게는 영역 자체를 표시하지 않는다.
```

보안 로그와 민감 운영 로그는 super_admin만 조회한다.

---

## 10.2 표시 정보

| 컬럼 | 설명 |
|---|---|
| 발생일시 | 보안 이벤트 발생 시각 |
| 이벤트 유형 | 위치 이상, 반복 실패, 비정상 접근 등 |
| 노출 | 관리자 확인용 요약 |
| 위치 | 대략 위치 또는 지역 수준 |
| 결과 | 관찰 / 의심 / 차단 등 |

### 표시 제한

정확한 좌표나 과도한 민감 정보는 요약 수준으로 표시한다.

---

## 10.3 버튼

| 버튼 | 동작 |
|---|---|
| `보안 로그 상세로` | 해당 유저 기준 A21 보안 로그 목록으로 이동 |

권장 Route:

```txt
/admin/security-logs?userId={userId}
```

---

## 11. 내부 관리자 메모 영역

## 11.1 목적

관리자가 유저 관련 운영 대응 내용을 기록하는 내부 메모 영역이다.

### 노출/작성 권한

| 기능 | super_admin | operator | viewer |
|---|---:|---:|---:|
| 메모 조회 | O | O | O |
| 메모 작성/수정 | O | O | X |

viewer는 textarea를 disabled 처리하거나 읽기 전용 카드로 표시한다.

---

## 11.2 UI 구성

```txt
라벨: 내부 관리자 메모
placeholder: 메모를 입력하세요
textarea
메모 저장 버튼
```

### 저장 버튼

| 조건 | 처리 |
|---|---|
| super_admin/operator | 노출 |
| viewer | 미노출 또는 disabled |
| 메모 변경 없음 | disabled |
| 저장 중 | loading 표시 |
| 저장 성공 | 성공 토스트 |
| 저장 실패 | 오류 팝업 또는 토스트 |

---

## 12. 보상 목록 영역

## 12.1 목적

해당 유저의 최근 보상 이력을 요약해서 보여준다.

### 표시 정보

| 컬럼 | 설명 |
|---|---|
| 획득일 | 보상 획득일 |
| 보물명 | 연결된 보물상자명 |
| 상품명 | 연결된 상품명 |
| 상태 | ready / issued / failed / used / expired / canceled |
| 외부 요청 | 외부 발급 요청 ID 또는 요약 |
| 재처리 | 재처리 요청 여부 |

### 버튼

| 버튼 | 동작 |
|---|---|
| `보상 상세로` | 선택된 보상 또는 전체 보상 목록으로 이동 |

권장 Route:

```txt
/admin/rewards?userId={userId}
```

특정 보상 선택 시:

```txt
/admin/rewards/{rewardId}
```

### 표시 금지

```txt
쿠폰 번호
바코드 원문
바코드 마스킹 값
```

---

## 13. 문의 목록 영역

## 13.1 목적

해당 유저의 최근 문의 이력을 요약해서 보여준다.

### 표시 정보

| 컬럼 | 설명 |
|---|---|
| 접수일 | 문의 접수일 |
| 카테고리 | usage / coupon / reward / account / error / improvement / other |
| 제목 | 문의 제목 |
| 상태 | open / in_progress / answered / closed |
| 답변 여부 | 답변 완료 여부 |

### 버튼

| 버튼 | 동작 |
|---|---|
| `문의 상세로` | 선택된 문의 또는 해당 유저 문의 목록으로 이동 |

권장 Route:

```txt
/admin/inquiries?userId={userId}
```

특정 문의 선택 시:

```txt
/admin/inquiries/{inquiryId}
```

---

## 14. 유저 정지 확인 팝업

## 14.1 진입 조건

```txt
super_admin이 active 상태 유저 상세에서 `유저 정지` 버튼 클릭
```

## 14.2 팝업 목적

유저 정지는 앱 주요 기능을 차단하는 위험 액션이므로 사유 입력 후 확인한다.

---

## 14.3 팝업 구성

```txt
딤드 배경
→ 중앙 팝업
   → 타이틀: 유저 정지 확인
   → 설명 문구
   → 정지 사유 입력
   → 취소 버튼
   → 정지 확인 버튼
```

### 문구

| 요소 | 문구 |
|---|---|
| 타이틀 | `유저 정지 확인` |
| 설명 | `이 유저를 정지하면 앱의 주요 기능이 즉시 차단됩니다. 정지 사유를 입력하세요.` |
| 입력 라벨 | `정지 사유 (필수)` |
| placeholder | `정지 사유를 입력하세요.` |
| 취소 버튼 | `취소` |
| 확인 버튼 | `정지 확인` |

---

## 14.4 유효성

| 항목 | 기준 |
|---|---|
| 정지 사유 | 필수 |
| 최소 글자 수 | 2자 이상 권장 |
| 최대 글자 수 | 200자 이하 권장 |

---

## 14.5 정지 처리 결과

성공 시:

```txt
profiles.status = suspended
suspended_at 저장
suspended_by_admin_id 저장
suspend_reason 저장
민감 운영 로그 기록
화면 상태 갱신
```

실패 시:

```txt
정지 처리 실패 안내
입력값 유지
재시도 가능
```

---

## 15. 유저 정지 해제 확인 팝업

## 15.1 진입 조건

```txt
super_admin이 suspended 상태 유저 상세에서 `정지 해제` 버튼 클릭
```

---

## 15.2 팝업 구성

```txt
딤드 배경
→ 중앙 팝업
   → 타이틀: 유저 정지 해제 확인
   → 설명 문구
   → 해제 사유 입력
   → 취소 버튼
   → 정지 해제 확인 버튼
```

### 문구

| 요소 | 문구 |
|---|---|
| 타이틀 | `유저 정지 해제 확인` |
| 설명 | `이 유저의 정지를 해제하면 앱 기능이 즉시 복구됩니다. 해제 사유를 입력하세요.` |
| 입력 라벨 | `해제 사유 (필수)` |
| placeholder | `해제 사유를 입력하세요.` |
| 취소 버튼 | `취소` |
| 확인 버튼 | `정지 해제 확인` |

---

## 15.3 정지 해제 처리 결과

성공 시:

```txt
profiles.status = active
unsuspended_at 저장
unsuspended_by_admin_id 저장
unsuspend_reason 저장
민감 운영 로그 기록
화면 상태 갱신
```

실패 시:

```txt
정지 해제 실패 안내
입력값 유지
재시도 가능
```

---

## 16. 사용자 앱 차단 정책 연계

유저가 suspended 상태가 되면 사용자 앱은 아래 정책을 따른다.

```txt
로그인은 허용 가능
지도·AR·쿠폰 발급 같은 핵심 서비스 액션 차단
기존 보상과 문의 답변 조회는 허용 가능
문의하기는 허용 권장
정지 안내 화면 또는 차단 안내 표시
```

정지 상태에서도 기존 쿠폰 확인과 문의 답변 확인이 필요한 경우가 있으므로, 무조건 로그아웃시키는 방식은 지양한다.

---

## 17. 데이터 모델

## 17.1 User Detail

```ts
type UserStatus = 'active' | 'suspended' | 'deleted' | 'inactive';
type LoginProvider = 'google' | 'kakao' | 'apple';

type AdminUserDetail = {
  id: string;
  public_id: string;
  nickname: string;
  avatar_url?: string | null;
  provider: LoginProvider;
  status: UserStatus;
  joined_at: string;
  last_active_at?: string | null;

  total_reward_count: number;
  inquiry_count: number;
  open_inquiry_count: number;
  retry_request_count: number;

  internal_memo?: string | null;

  suspended_at?: string | null;
  suspended_by_admin_id?: string | null;
  suspend_reason?: string | null;
};
```

---

## 17.2 Related Reward Item

```ts
type UserRewardSummaryItem = {
  reward_id: string;
  claimed_at: string;
  treasure_title: string;
  product_name: string;
  status: 'ready' | 'issued' | 'failed' | 'used' | 'expired' | 'canceled';
  provider_request_id?: string | null;
  has_retry_request: boolean;
};
```

---

## 17.3 Related Inquiry Item

```ts
type UserInquirySummaryItem = {
  inquiry_id: string;
  created_at: string;
  category: 'usage' | 'coupon' | 'reward' | 'account' | 'error' | 'improvement' | 'other';
  title: string;
  status: 'open' | 'in_progress' | 'answered' | 'closed';
  has_answer: boolean;
};
```

---

## 18. API 연동 기준

## 18.1 유저 상세 조회

```txt
GET /api/admin/users/{userId}
```

### 응답 포함

```txt
기본 프로필
운영 지표
최근 보상 요약
최근 문의 요약
내부 메모
super_admin인 경우 보안 로그 요약
```

---

## 18.2 내부 메모 저장

```txt
PATCH /api/admin/users/{userId}/memo
```

### Request Body

```ts
{
  internal_memo: string;
}
```

권한:

```txt
super_admin
operator
```

---

## 18.3 유저 정지

```txt
POST /api/admin/users/{userId}/suspend
```

### Request Body

```ts
{
  reason: string;
}
```

권한:

```txt
super_admin only
```

---

## 18.4 유저 정지 해제

```txt
POST /api/admin/users/{userId}/unsuspend
```

### Request Body

```ts
{
  reason: string;
}
```

권한:

```txt
super_admin only
```

---

## 19. 상태별 화면

## 19.1 로딩 상태

```txt
프로필 카드 skeleton
운영 지표 skeleton
보상/문의 테이블 skeleton
```

---

## 19.2 유저 없음

문구:

```txt
유저를 찾을 수 없습니다.
삭제되었거나 접근할 수 없는 유저입니다.
```

버튼:

```txt
유저 목록으로
```

---

## 19.3 조회 실패

문구:

```txt
유저 상세 조회 실패
유저 정보를 불러오는 중 오류가 발생했습니다.
```

버튼:

```txt
다시 시도
```

---

## 19.4 권한 없음

서버 권한 검증 실패 시 A24 접근 권한 부족 화면으로 이동한다.

---

## 20. 보안 정책

```txt
사용자 이메일은 관리자 CMS 화면과 API 응답에 포함하지 않는다.
쿠폰 번호와 바코드는 화면과 API 응답에 포함하지 않는다.
정확한 현재 위치 좌표는 노출하지 않는다.
OAuth token은 노출하지 않는다.
유저 정지/해제는 서버에서 super_admin 권한을 재검증한다.
정지/해제 사유는 필수로 저장한다.
정지/해제는 민감 운영 로그로 기록한다.
보안 로그 요약은 super_admin에게만 내려준다.
```

---

## 21. 운영 로그 정책

| 액션 | 로그 유형 |
|---|---|
| 유저 상세 조회 | 필요 시 일반 운영 로그 |
| 내부 메모 저장 | 일반 운영 로그 |
| 유저 정지 | 민감 운영 로그 |
| 유저 정지 해제 | 민감 운영 로그 |
| 보안 로그 상세 이동 | 보안 로그 조회 이력 또는 민감 운영 로그 |
| 보상 상세 이동 | 생략 가능 |
| 문의 상세 이동 | 생략 가능 |

---

## 22. 와이어프레임 반영 기준

| 와이어프레임 요소 | MD 반영 |
|---|---|
| 유저 상세 타이틀 | 유지 |
| 유저 목록으로 링크 | 유지 |
| 보안 로그 상세로 링크 | super_admin 전용으로 유지 |
| 유저 정지 버튼 | super_admin + active 상태에서 노출 |
| 정지 해제 버튼 | super_admin + suspended 상태에서 노출 |
| 기본 프로필 카드 | 유지 |
| 운영 지표 카드 | 유지 |
| 보안 로그 요약 카드 | super_admin 전용으로 유지 |
| 내부 관리자 메모 | 유지 |
| 보상 목록 패널 | 유지 |
| 문의 목록 패널 | 유지 |
| 유저 정지 확인 팝업 | 유지 |
| 유저 정지 해제 확인 팝업 | 유지 |

---

## 23. QA 체크리스트

## 23.1 권한

- [ ] super_admin은 모든 영역을 볼 수 있다.
- [ ] operator는 보안 로그 요약을 볼 수 없다.
- [ ] viewer는 보안 로그 요약을 볼 수 없다.
- [ ] super_admin만 유저 정지 버튼을 볼 수 있다.
- [ ] super_admin만 정지 해제 버튼을 볼 수 있다.
- [ ] viewer는 내부 메모 저장 버튼을 볼 수 없거나 disabled 상태다.

## 23.2 기본 정보

- [ ] 닉네임이 표시된다.
- [ ] 유저 ID가 표시된다.
- [ ] 로그인 제공자가 표시된다.
- [ ] 상태 배지가 표시된다.
- [ ] 가입일이 표시된다.
- [ ] 최근 활동이 표시된다.
- [ ] 사용자 이메일은 표시되지 않는다.

## 23.3 운영 지표

- [ ] 총 보상 획득 수가 표시된다.
- [ ] 총 문의 수가 표시된다.
- [ ] 미처리 문의 수가 표시된다.
- [ ] 재처리 요청 건수가 표시된다.
- [ ] 각 지표 클릭 시 관련 목록으로 이동한다.

## 23.4 보상/문의

- [ ] 최근 보상 목록이 표시된다.
- [ ] 보상 상세로 이동할 수 있다.
- [ ] 최근 문의 목록이 표시된다.
- [ ] 문의 상세로 이동할 수 있다.
- [ ] 쿠폰 번호와 바코드는 표시되지 않는다.

## 23.5 정지/해제

- [ ] active 유저에게는 유저 정지 버튼이 표시된다.
- [ ] suspended 유저에게는 정지 해제 버튼이 표시된다.
- [ ] 정지 사유 미입력 시 확인 버튼이 비활성 또는 오류 표시된다.
- [ ] 해제 사유 미입력 시 확인 버튼이 비활성 또는 오류 표시된다.
- [ ] 정지 성공 시 유저 상태가 suspended로 변경된다.
- [ ] 해제 성공 시 유저 상태가 active로 변경된다.
- [ ] 정지/해제는 민감 운영 로그로 기록된다.

---

## 24. 개발 메모

```txt
A18은 유저 운영의 중심 상세 화면이다.
위험 액션은 반드시 super_admin 권한을 서버에서 재검증한다.
정지/해제는 목록 화면이 아니라 상세 화면에서만 제공한다.
보안 로그 요약은 role에 따라 API 응답 자체에서 제외하는 것이 안전하다.
유저 이메일은 DB에 존재하더라도 관리자 API 응답에 포함하지 않는다.
```
