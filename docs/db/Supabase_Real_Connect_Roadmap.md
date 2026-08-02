# Supabase Real Connect Roadmap

## 목적

프론트 껍데기 완료 이후 실제 Supabase 연결 순서를 정의한다.

## 연결 순서

1. Supabase Auth 기준 확정
2. profiles 자동 생성/조회/수정
3. support_inquiries / support_replies 연결 안정화
4. notifications 연결
5. inventory_items / inventory_item_list 연결
6. treasure_boxes / treasure_claims / treasure_rewards 연결
7. hall_of_fame view 연결
8. 관리자 CMS 기능 확장
9. 외부 API 검토

## 1단계. Auth

1차 Auth는 Google 로그인부터 진행한다.

- Google: 1차 연결
- Kakao: 후순위
- Apple: 후순위

로그인 화면 UI는 유지한다.

## 2단계. profiles

로그인 성공 후 profiles row가 없으면 자동 생성한다.

- Auth user.id 기준 사용
- fake user_id 금지
- 세션 없으면 mock fallback 유지
- Supabase 에러 시 기존 화면이 깨지지 않아야 한다.

## 3단계. support

문의 기능은 로그인 사용자 기준으로 연결한다.

- 작성: support_inquiries insert
- 목록: 내 문의 조회
- 상세: support_inquiries + support_replies 조회
- 관리자 답변 등록 구조는 기존 CMS 유지

## 4단계. notifications

알림은 /notification 페이지 기준으로 연결한다.

- notifications 조회
- 읽음 처리
- target_route 이동
- 문의 답변 알림은 /support/[inquiryId] 이동

## 5단계. inventory

보관함은 목록과 상세를 분리한다.

- 목록: inventory_item_list view
- 상세: inventory_items
- 목록에서 coupon_code/barcode_value 노출 금지
- 상세에서만 쿠폰/바코드 표시

## 6단계. hunt/reward

지도/보물/사냥/보상은 후순위로 연결한다.

- treasure_boxes
- treasure_claims
- treasure_rewards

실제 Naver Map, AR 카메라, Giftishow Biz API는 아직 연결하지 않는다.

## 7단계. hall_of_fame

명예의 전당은 hall_of_fame view 기준으로 연결한다.

- 상단 요약 영역
- hunter rankings 리스트
- 기간 필터
- 기존 mock fallback 유지

## 8단계. 관리자 CMS

관리자 CMS는 문의 관리 이후 아래 순서로 확장한다.

1. 보상/쿠폰 상품 관리
2. 보물상자 관리
3. 유저 관리
4. 운영 로그
5. 관리자 권한/Auth

## 금지 사항

- service_role key 프론트 노출 금지
- fake user_id 사용 금지
- 외부 API 실제 연결 금지
- package.json 임의 수정 금지
- package-lock.json 임의 수정 금지
- main 직접 push 금지