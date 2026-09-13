# NativeAR iOS Spike Plugin

이 디렉터리는 CatchCash iOS Native AR feasibility spike용 소스입니다.
Windows에서는 iOS 프로젝트를 생성하지 않습니다. Mac에서 `ios/` platform을 만든 뒤 이 Swift 파일을 연결하세요.

## 포함 파일

- `src/definitions.ts` — TypeScript plugin interface
- `src/index.ts` — `registerPlugin("NativeAR")`
- `ios/NativeARPlugin.swift` — Capacitor plugin
- `ios/NativeARViewController.swift` — ARKit + RealityKit World Anchor cube

## 이번 spike에서 하지 않는 것

- Android 구현
- `chest.glb` 로드
- GPS treasure / claim / Giftishow
- 기존 WebAR 화면 수정
