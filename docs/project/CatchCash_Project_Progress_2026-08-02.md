# CatchCash Project Progress - 2026-08-02

## 현재 상태

프론트 디자인 및 주요 화면 껍데기 구현은 완료된 상태다.

## 완료된 주요 작업

### 사용자 앱
- 스플래시 화면 완료
- 로그인 화면 완료
- 닉네임/약관 화면 완료
- 홈 화면 완료
- 지도 화면 완료
- AR 사냥 화면 완료
- 사냥 결과 화면 완료
- 명예의 전당 화면 완료
- 프로필 화면 완료
- 프로필 수정 화면 완료
- 보관함 화면 완료
- 보상 상세 팝업 완료
- 문의 목록/작성/상세 화면 완료
- 알림 페이지 `/notification` 생성 완료

### 공통 네비게이션
- 공통 AppHeader 적용 완료
- 공통 BottomNav 적용 완료
- 로그인 후 사용자 앱 주요 화면에 BNB 5탭 통일 완료
- 알림 라우트는 `/notification` 기준으로 통일
- `/`, `/login`, `/nickname`, `/admin/**`는 공통 GNB/BNB 제외

### 관리자 CMS
- 관리자 로그인 화면 완료
- 관리자 대시보드 완료
- 관리자 문의 목록/상세 화면 완료
- 관리자 문의 답변 등록 구조 완료

### Supabase
- MVP DB schema 적용 완료
- 사용자 문의 Supabase 연결 1차 완료
- 관리자 문의 Supabase 연결 1차 완료
- 프로필 Supabase 연결 준비 완료

## 현재 기준

- main 직접 push 금지
- feature 브랜치에서 작업 후 PR
- 작업 후 `npm run lint`, `npm run build` 필수
- Supabase 연결 시 세션 없으면 mock fallback 유지
- fake user_id 사용 금지
- service_role key 프론트 사용 금지
- 외부 API 실제 연결 금지
  - Naver Map
  - AR 카메라
  - Giftishow Biz API

## 다음 단계

1. Auth 1차 연결 기준 확정
2. profiles 자동 생성 정책 확정
3. notification Supabase 연결
4. profile/support connect QA
5. inventory Supabase 연결
6. 관리자 CMS 운영 로그/권한 구조 정리