# 관리자 CMS Shell 전체 Route QA 결과

## 1. 문서 개요

| 항목 | 내용 |
|---|---|
| 문서명 | 관리자 CMS Shell 전체 Route QA 결과 |
| 파일명 | `Admin_CMS_Shell_QA_Result.md` |
| 작성일 | 2026-08-22 |
| 작성 목적 | 현재 main 기준 관리자 CMS shell 전체 화면을 수동 확인한 결과를 팀원이 공유할 수 있도록 정리 |
| 검수 대상 | `/admin/**` 하위 CMS shell 화면 전체 |
| 검수 기준 | `CMS_Coding_Rules_And_Component_Guide.md`, `docs/admin-cms/screens` A01~A24 화면 정의서 |

참고 문서:

- `docs/admin-cms/CMS_Coding_Rules_And_Component_Guide.md`
- `docs/admin-cms/screens` 하위 A01~A24 화면 정의서
- `docs/admin-cms/Admin_CMS_Shell_Completion_Status.md`는 현재 저장소에 없어 이번 QA 정리에는 사용하지 않았다.

검수 기준 요약:

| 기준 | 확인 내용 |
|---|---|
| 화면 표시 | 대상 route가 정상 렌더링되는가 |
| 404 | 대상 route에서 404가 발생하지 않는가 |
| 화면 깨짐 | 데스크톱 shell 레이아웃이 깨지지 않는가 |
| 링크 이동 | 목록 ↔ 상세, 목록 복귀, 사이드바 이동이 동작하는가 |
| 민감정보 | 금지된 개인정보·쿠폰·시크릿이 화면에 없는가 |
| mock-only | 실제 외부 연결 없이 shell 기준으로 확인했는가 |

이번 문서는 **shell 기준 확인** 결과이다. 실제 Supabase/Auth/API 연결 검수가 아니다.

---

## 2. 검수 환경

| 항목 | 내용 |
|---|---|
| 기준 브랜치 | local main |
| 실행 환경 | Next.js dev server |
| 진입 방식 | `/admin/login` mock 로그인 후 확인 |
| mock 이메일 | `admin@catchcash.co.kr` |
| mock 비밀번호 | `1234` |
| 검수 방식 | 브라우저 수동 확인 |
| 검수 범위 | shell 화면 표시, 주요 링크 이동, 민감정보 미노출 |

명시적 제외:

- 실제 Supabase 연결 검수 아님
- 실제 Auth 연결 검수 아님
- 실제 API/fetch 연동 검수 아님
- 실제 저장/상태 변경/외부 발급 검수 아님

---

## 3. 전체 결과 요약

shell 기준 수동 확인 결과, 관리자 CMS 전체 route는 정상이다.

| 항목 | 결과 |
|---|---|
| 전체 route 정상 | 확인 |
| 404 없음 | 확인 |
| 화면 깨짐 없음 | 확인 |
| 민감정보 노출 문제 없음 | 확인 |
| 주요 링크 이동 문제 없음 | 확인 |
| mock-only 기준 유지 | 확인 |
| Supabase/API/Auth 신규 연결 없음 | 확인 |

blocking issue는 없다.

---

## 4. 확인한 route 목록

확인 결과는 모두 **OK**이다. 아래 표는 shell 기준 확인 결과이다.

| 구분 | route | 화면명 | 확인 결과 | 비고 |
|---|---|---|---|---|
| 로그인/대시보드 | `/admin/login` | 관리자 로그인 | OK | A01. mock 로그인 후 대시보드 진입 |
| 로그인/대시보드 | `/admin/dashboard` | 운영 대시보드 | OK | A02. 최근 현황 테이블(A02-1) 포함 확인 |
| 관리자 계정 | `/admin/admins` | 관리자 계정 목록 | OK | A03 |
| 관리자 계정 | `/admin/admins/new` | 관리자 계정 등록 | OK | A04. 실제 저장 없음 |
| 관리자 계정 | `/admin/admins/admin-001` | 관리자 계정 상세 | OK | A05. mock 관리자 이메일 표시는 허용 |
| 유저 관리 | `/admin/users` | 유저 목록 | OK | A17 |
| 유저 관리 | `/admin/users/user-202607-005` | 유저 상세 | OK | A18. 사용자 이메일 미표시 |
| 보물상자 | `/admin/treasures` | 보물상자 목록 | OK | A06 |
| 보물상자 | `/admin/treasures/new` | 보물상자 등록 | OK | A07. 실제 저장 없음 |
| 보물상자 | `/admin/treasures/treasure-gangnam-station-01` | 보물상자 상세 | OK | A08 |
| 보물상자 | `/admin/treasures/treasure-gangnam-station-01/edit` | 보물상자 수정 | OK | A09. 실제 저장 없음 |
| 상품 | `/admin/products` | 상품 목록 | OK | A10 |
| 상품 | `/admin/products/new` | 상품 등록 | OK | A11. 실제 저장 없음 |
| 상품 | `/admin/products/prod-starbucks-americano-tall` | 상품 상세 | OK | A12 |
| 매핑 | `/admin/mappings` | 보물-상품 매칭 목록 | OK | A13 |
| 매핑 | `/admin/mappings/new` | 매칭 등록·교체 | OK | A14. 실제 저장 없음 |
| 보상 | `/admin/reward-requests` | 보상 목록 | OK | A15. 재처리 요청 생성 팝업(A16-1) shell 확인 |
| 보상 | `/admin/reward-requests/history` | 재처리 요청 이력 | OK | A16-2 |
| 보상 | `/admin/rewards/reward-001` | 보상 상세 | OK | A16. 쿠폰 번호/바코드 미표시 |
| 문의 | `/admin/inquiries` | 문의 목록 | OK | A19 |
| 문의 | `/admin/inquiries/inquiry-001` | 문의 상세 | OK | A20. 상세 이동 및 답변 영역 shell 확인 |
| 보안 로그 | `/admin/security-logs` | 보안 로그 목록 | OK | A21 |
| 보안 로그 | `/admin/security-logs/sec-log-001` | 보안 로그 상세 | OK | A22. 원본 payload/token 미표시 |
| 운영 로그 | `/admin/operation-logs` | 운영 로그 목록 | OK | A23 |
| 접근 차단 | `/admin/access-denied` | 접근 권한 부족 안내 | OK | A24 |
| 접근 차단 | `/admin/access-denied?reason=unknown` | 접근 권한 부족 안내 | OK | A24. query 진입도 정상 표시 |

---

## 5. 화면 그룹별 검수 결과

아래 내용은 모두 **shell 기준 확인**이다.

### 5.1 로그인/대시보드

| 구분 | 내용 |
|---|---|
| 정상 확인 항목 | `/admin/login` mock 로그인, `/admin/dashboard` 표시, 사이드바 메뉴 이동, 최근 현황 영역 표시, 화면 깨짐 없음 |
| 후속 연결 필요 항목 | 실제 관리자 Auth 세션, 대시보드 통계의 실제 데이터 조회 |

### 5.2 관리자 계정

| 구분 | 내용 |
|---|---|
| 정상 확인 항목 | 목록/등록/상세 표시, 목록 ↔ 상세 이동, mock 관리자 이메일 표시, 실제 계정 상태 변경 없음 |
| 후속 연결 필요 항목 | 관리자 권한 가드/Auth 고도화, 실제 계정 등록·수정·상태 변경 연결 |

### 5.3 유저 관리

| 구분 | 내용 |
|---|---|
| 정상 확인 항목 | 유저 목록/상세 표시, 목록에서 상세 이동, 닉네임·mock ID만 표시, 정지/해제 실제 실행 없음 |
| 후속 연결 필요 항목 | Auth/profile 연동, 실제 유저 상태 변경, mock ID와 실제 DB ID 매핑 |

### 5.4 보물상자 관리

| 구분 | 내용 |
|---|---|
| 정상 확인 항목 | 목록/등록/상세/수정 표시, 목록 ↔ 상세 ↔ 수정 이동, 실제 저장 없음, 실제 GPS/지도 API 연결 없음 |
| 후속 연결 필요 항목 | 보물상자 데이터 조회/저장 연결, 실제 위치 좌표 운영 정책 확인 |

### 5.5 상품 관리

| 구분 | 내용 |
|---|---|
| 정상 확인 항목 | 목록/등록/상세 표시, 목록 ↔ 상세 이동, 쿠폰 번호·바코드 미표시, 실제 Giftishow 호출 없음 |
| 후속 연결 필요 항목 | 상품 데이터 조회/저장 연결, 외부 상품 API는 후순위 |

### 5.6 매핑 관리

| 구분 | 내용 |
|---|---|
| 정상 확인 항목 | 매칭 목록/등록·교체 표시, 목록에서 등록 화면 이동, 실제 매핑 저장 없음 |
| 후속 연결 필요 항목 | 보물-상품 매핑 데이터 조회/저장 연결 |

### 5.7 보상 재처리

| 구분 | 내용 |
|---|---|
| 정상 확인 항목 | 보상 목록/이력/상세 표시, 재처리 요청 생성 팝업 shell 확인, 실제 재처리 실행 없음, 쿠폰/바코드 미표시 |
| 후속 연결 필요 항목 | 보상 데이터 조회 연결, 실제 재처리 실행, inventory 연결, 외부 발급 API는 후순위 |

### 5.8 문의 관리

| 구분 | 내용 |
|---|---|
| 정상 확인 항목 | 문의 목록/상세 표시, 목록에서 상세 이동, 답변 영역 표시, 사용자 이메일 미표시 |
| 후속 연결 필요 항목 | 문의 데이터 조회 연결, 답변 저장 후 사용자 알림 Supabase 연결 |

### 5.9 보안/운영 로그

| 구분 | 내용 |
|---|---|
| 정상 확인 항목 | 보안 로그 목록/상세, 운영 로그 목록 표시, token/원본 payload/API Secret 미표시 |
| 후속 연결 필요 항목 | 실제 로그 조회 연결, 권한별 보안 로그 노출 가드 |

### 5.10 접근 차단

| 구분 | 내용 |
|---|---|
| 정상 확인 항목 | `/admin/access-denied` 및 `?reason=unknown` 정상 표시, 안내 문구와 복귀 링크 확인 |
| 후속 연결 필요 항목 | 서버 권한 검증 실패 시 A24로 보내는 Auth 가드 고도화 |

---

## 6. 민감정보 검수 결과

shell 기준 확인 결과, 아래 항목은 화면에 노출되지 않았다.

| 항목 | 결과 |
|---|---|
| 실제 사용자 이메일 | 미노출 |
| 전화번호 | 미노출 |
| 소셜 provider 식별자 | 미노출 |
| 실제 쿠폰 번호 | 미노출 |
| 바코드 값 | 미노출 |
| API Secret | 미노출 |
| service_role key | 미노출 |
| token | 미노출 |
| 원본 payload | 미노출 |
| 주민번호/주소 등 개인정보 | 미노출 |

예외 허용:

- 관리자 계정 화면(`/admin/admins`, `/admin/admins/new`, `/admin/admins/admin-001`)의 이메일은 mock 관리자 이메일 기준으로 허용된 표시이다.
- 사용자 이메일은 관리자 CMS 어느 화면에서도 표시하지 않았다.

---

## 7. mock-only 검수 결과

이번 QA는 shell 화면 기준 확인이며, 아래 기준이 유지되었다.

| 기준 | 결과 |
|---|---|
| 실제 Supabase 연결 검수 대상 아님 | 유지 |
| 실제 Auth 연결 검수 대상 아님 | 유지 |
| 실제 Naver Map API 연결 없음 | 유지 |
| 실제 GPS 연결 없음 | 유지 |
| 실제 Giftishow Biz API 호출 없음 | 유지 |
| 실제 쿠폰 발급 없음 | 유지 |
| 실제 보상 재처리 실행 없음 | 유지 |
| 실제 계정 상태 변경 없음 | 유지 |
| 실제 사용자 차단/정지 없음 | 유지 |

문의 상세에 기존 fallback 구조가 있더라도, 이번 QA는 그 연결을 실제 검수하지 않았고 mock-only shell 기준으로 화면 표시와 이동만 확인했다.

---

## 8. known issue / backlog

현재 수동 검수 기준 **blocking issue 없음**.

다음 단계에서 확인해야 할 후속 항목:

| 우선순위 | 후속 항목 | 비고 |
|---|---|---|
| 1 | Supabase 연결 단계에서 Auth/profile 연동 필요 | 관리자 세션과 유저 식별 |
| 2 | 사용자 알림 Supabase 연결 필요 | 문의 답변 후 알림 |
| 3 | inventory Supabase 연결 필요 | 보상/보관함 조회 |
| 4 | 관리자 CMS 데이터 조회 연결 필요 | 목록/상세 실제 데이터 |
| 5 | 관리자 권한 가드/Auth 고도화 필요 | role별 메뉴·액션 제한 |
| 6 | 외부 API 연동은 후순위로 분리 | Naver Map, Giftishow 등 |
| 7 | mock ID와 실제 DB ID 매핑 기준 필요 | shell에서 사용한 ID 정리 |

---

## 9. 다음 단계

CMS shell 완료 후 다음 단계는 **Supabase 연결 계획 수립**이다.

추천 다음 문서:

```txt
docs/admin-cms/CMS_Shell_To_Supabase_Connection_Plan.md
```

해당 문서에서 정리할 권장 범위:

- Auth/profile 연결 순서
- 문의·보상·유저·로그 조회 연결 순서
- 권한 가드 적용 범위
- mock ID와 실제 DB ID 매핑
- 외부 API는 별도 후순위 계획으로 분리
