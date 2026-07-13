# 캐치캐쉬 프론트엔드

Next.js App Router 기반의 캐치캐쉬 초기 프론트엔드 프로젝트입니다. 현재 각 라우트는 화면 연결과 레이아웃 확인을 위한 placeholder로 구성되어 있습니다.

## 시작하기

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 모바일 WebView를 고려해 앱 콘텐츠는 최대 480px로 표시됩니다.

## 주요 구조

- `app/`: App Router 페이지 및 라우트
- `components/common`, `components/layout`: 공통 UI와 앱 셸
- `components/rough-frame`, `components/bottom-tab`: 초기 UI 컴포넌트
- `lib/supabase`: Supabase 브라우저 클라이언트
- `stores`, `types`: 상태와 도메인 타입 확장 위치
- `public/assets`: 이미지·아이콘 등 정적 에셋 위치

## Capacitor

`capacitor.config.ts`와 Capacitor 패키지를 준비해 두었습니다. 웹 앱 구현 후 `npx cap add android` 또는 `npx cap add ios`로 네이티브 플랫폼을 추가할 수 있습니다.
