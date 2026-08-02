# CatchCash PR Review Checklist

## 1. PR 기본 확인

PR이 올라오면 먼저 아래를 확인한다.

- PR 제목이 작업 범위를 명확히 설명하는가
- 브랜치명이 feature/docs/chore 기준에 맞는가
- main으로 직접 push한 것이 아닌가
- Merge conflicts가 없는가
- Checks가 통과했는가

## 2. Files changed 확인

PR에서 가장 먼저 `Files changed`를 확인한다.

확인 기준:

- 담당 범위의 파일만 수정되었는가
- 불필요하게 다른 팀원 화면을 건드리지 않았는가
- package.json / package-lock.json이 수정되었는가
- supabase 파일이 수정되었는가
- secret key 또는 service_role key가 노출되었는가

## 3. 수정 금지 파일

아래 파일은 특별한 지시 없이는 수정하지 않는다.

- app/page.tsx
- app/login/page.tsx
- app/nickname/page.tsx
- package.json
- package-lock.json
- next.config.*
- tailwind.config.*
- supabase/**
- /admin/** 단, 관리자 CMS 작업일 경우 제외

## 4. Supabase 연결 PR 확인

Supabase 연결 PR에서는 아래를 확인한다.

- 세션이 있을 때 Supabase를 사용하는가
- 세션이 없을 때 mock fallback을 유지하는가
- fake user_id를 만들어 insert/update 하지 않는가
- Supabase 에러가 나도 화면이 깨지지 않는가
- service_role key를 프론트 코드에 넣지 않았는가

## 5. Preview 확인

PR별 Preview에서 담당 화면을 직접 확인한다.

### 팀원1 알림/홈/가이드

- /home
- /notification
- /guide
- /support/[inquiryId]

### 팀원2 프로필/문의

- /profile
- /profile/edit
- /support
- /support/new
- /support/[inquiryId]
- /login 로그아웃 이동

### 팀원3 헌트/보상/보관함

- /map
- /ar-hunt
- /hunt-result
- /hunt-result?result=fail
- /inventory
- /hall-of-fame

### 관리자 CMS

- /admin/login
- /admin/dashboard
- /admin/inquiries
- /admin/inquiries/[id]

## 6. 공통 확인 기준

Preview에서 아래를 확인한다.

- 화면이 정상 표시되는가
- 라우팅이 깨지지 않는가
- 기존 mock fallback이 유지되는가
- 공통 GNB/BNB가 깨지지 않는가
- 모바일 폭에서 화면이 깨지지 않는가

## 7. lint/build 기준

PR 설명 또는 Checks에서 아래를 확인한다.

- npm run lint 통과
- npm run build 통과

로컬 확인이 필요하면 main pull 후 직접 실행한다.

## 8. merge 가능 기준

아래 조건을 모두 만족하면 merge 가능하다.

- Files changed 범위 정상
- Checks 통과
- Preview 정상
- package.json/package-lock.json 불필요 수정 없음
- secret key 노출 없음
- 기존 화면/라우팅 깨짐 없음
- mock fallback 유지

## 9. 수정 요청 기준

아래 상황이면 merge하지 않고 수정 요청한다.

- Merge conflicts 발생
- package 파일 불필요 수정
- 담당 범위 외 파일 수정
- Preview 화면 깨짐
- Supabase 에러 시 fallback 없음
- fake user_id 사용
- service_role key 노출
- 기존 로그인/닉네임/스플래시 흐름 변경

## 10. PR 승인 코멘트 예시

```md
확인했습니다.

검수 내용:
- Files changed 범위 정상
- Preview 화면 정상
- 기존 mock fallback 유지 확인
- package.json/package-lock.json 수정 없음
- secret key 노출 없음
- npm run lint / npm run build 통과 확인

문제 없어서 merge 진행하겠습니다.