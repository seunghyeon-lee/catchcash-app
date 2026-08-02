# CatchCash Real Connect Rules

## 목적

프론트 껍데기 완료 이후 Supabase 실제 연결 작업의 공통 기준을 정의한다.

## 공통 원칙

1. 세션이 있으면 Supabase를 사용한다.
2. 세션이 없으면 기존 mock fallback을 유지한다.
3. Supabase 에러가 발생해도 화면은 깨지면 안 된다.
4. fake user_id를 만들어 DB에 insert/update 하지 않는다.
5. service_role key 또는 secret key를 프론트 코드에 넣지 않는다.
6. 실제 외부 API는 아직 연결하지 않는다.

## Auth 기준

1차 실제 Auth 연결은 Google 로그인부터 진행한다.

- Google: 1차 연결 대상
- Kakao: 후순위
- Apple: 후순위

`/login`, `/nickname` 화면의 디자인과 기존 흐름은 최대한 유지한다.

## profiles 기준

로그인 성공 후 profiles 테이블에 사용자 row가 있어야 한다.

정책:

1. Auth user가 있으면 profiles 조회
2. profiles row가 없으면 자동 생성
3. profiles row가 있으면 기존 데이터 사용
4. 세션이 없으면 profiles insert/update 금지

## support 기준

문의 기능은 로그인 사용자를 기준으로 연결한다.

- 문의 작성: `support_inquiries` insert
- 문의 목록: 로그인 사용자 기준 `support_inquiries` select
- 문의 상세: `support_inquiries` + `support_replies` 조회
- 관리자 답변 등록은 기존 관리자 CMS 구조 유지

## notification 기준

알림은 `/notification` 페이지 기준으로 연결한다.

- 알림 목록: `notifications` select
- 읽음 처리: `is_read` update
- 클릭 이동: `target_route` 기준 이동
- 문의 답변 알림: `/support/[inquiryId]` 이동

## inventory 기준

보관함은 목록과 상세를 분리한다.

- 목록: `inventory_item_list` view 사용
- 상세: `inventory_items` 사용
- 목록에서는 `coupon_code`, `barcode_value` 노출 금지
- 상세 팝업에서만 쿠폰/바코드 표시

## 금지 사항

- package.json 임의 수정 금지
- package-lock.json 임의 수정 금지
- main 직접 push 금지
- `/`, `/login`, `/nickname`, `/admin/**` 임의 수정 금지
- Naver Map 실제 API 연결 금지
- AR 카메라 실제 연결 금지
- Giftishow Biz API 실제 연결 금지