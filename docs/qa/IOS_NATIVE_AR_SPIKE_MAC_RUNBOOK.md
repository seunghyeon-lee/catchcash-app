# iOS Native AR Spike Mac Runbook

이 문서는 Windows에서 준비한 iOS Native AR feasibility spike를
Mac + 실제 iPhone에서 실행하기 위한 가이드입니다.

이번 spike의 검증 목표는 제품 전체 Capacitor 완성이 아닙니다.

- ARKit + RealityKit session 실행
- 카메라 기준 약 1.5m 앞에 테스트 cube 1회 배치
- 사용자가 앞/뒤/좌/우/회전해도 cube가 현실 공간의 같은 위치에 남는지 확인

`chest.glb`는 사용하지 않습니다. RealityKit primitive cube만 사용합니다.

---

## 1. 브랜치 확인

```bash
git checkout spike/native-ar-ios
git status
```

현재 브랜치가 `spike/native-ar-ios`인지 확인합니다.

---

## 2. 의존성 설치

```bash
npm install
```

---

## 3. spike Web shell 빌드

```bash
npm run build:ios-spike
```

성공 시 프로젝트 루트에 아래 파일이 생성됩니다.

- `out/index.html`
- `out/main.js`
- `out/styles.css`

`capacitor.config.ts`의 `webDir`은 `"out"`입니다.
`out/`은 git ignore 대상이므로 commit하지 않습니다.

---

## 4. Capacitor 버전 확인

`package.json` 기준:

- `@capacitor/core`: `^7.4.0`
- `@capacitor/cli`: `^7.4.0`
- `@capacitor/ios`: `^7.4.0`

실제 설치된 버전은 아래 명령으로 확인합니다.

```bash
npm ls @capacitor/core @capacitor/cli @capacitor/ios
```

Windows에서 확인된 lock 버전 예:

- `@capacitor/core`: `7.6.8`
- `@capacitor/cli`: `7.6.8`
- `@capacitor/ios`: `7.4.0`

Mac에서도 같은 major 7 계열인지 확인하세요.

---

## 5. iOS platform 추가

Windows에서는 `npx cap add ios`를 실행하지 않았습니다.
Mac에서 처음 한 번만 실행합니다.

```bash
npx cap add ios
```

성공하면 프로젝트 루트에 `ios/` 폴더가 생깁니다.

이미 `ios/`가 있다면 이 단계는 건너뜁니다.

---

## 6. Capacitor sync

```bash
npx cap sync ios
```

이 명령은 `out/` 내용을 iOS WebView assets로 복사합니다.
반드시 `npm run build:ios-spike` 이후에 실행하세요.

---

## 7. Swift plugin 파일을 iOS target에 연결

준비된 소스:

- `native-plugins/native-ar/ios/NativeARPlugin.swift`
- `native-plugins/native-ar/ios/NativeARViewController.swift`

TypeScript interface:

- `native-plugins/native-ar/src/definitions.ts`
- `native-plugins/native-ar/src/index.ts`

### TODO / 확인사항

Capacitor 7의 local plugin 등록 방식은 프로젝트 생성 결과와 Xcode/SPM/CocoaPods 구성에 따라 달라질 수 있습니다.
여기서는 특정 Xcode 내부 경로를 단정하지 않습니다.

Mac에서 아래를 확인하세요.

1. `npx cap add ios` 후 생성된 `ios/` 구조 확인
2. Capacitor 7 local plugin을 자동으로 인식하는지 확인
3. 자동 인식되지 않으면 Xcode에서 위 Swift 2개 파일을 App target에 직접 추가
4. plugin class name이 `NativeARPlugin`, JS name이 `NativeAR`인지 확인
5. WebView에서 `window.Capacitor.Plugins.NativeAR`가 보이는지 Safari Web Inspector로 확인

가능한 등록 방식 후보:

- Capacitor local plugin package로 등록 후 `npx cap sync ios`
- Xcode App target에 Swift 파일을 수동 추가
- Capacitor 7 SPM plugin 경로에 소스 연결

어느 방식이 실제 생성 프로젝트에서 동작하는지는 Mac에서 확인 후 이 문서에 구체 경로를 보충하세요.

---

## 8. Info.plist Camera 권한

Xcode 또는 `ios/` 아래 Info.plist에 아래 key를 추가합니다.

- Key: `NSCameraUsageDescription`
- Value: `보물 찾기 AR 기능을 사용하기 위해 카메라 접근이 필요합니다.`

이 값이 없으면 ARKit session이 카메라 권한을 요청하지 못하고 실패할 수 있습니다.

위치 권한은 이번 spike에서 필요하지 않습니다.

---

## 9. Xcode 열기

```bash
npx cap open ios
```

---

## 10. Xcode Signing

Xcode에서 아래를 설정합니다.

- Team
- Bundle Identifier
- Signing Certificate
- Automatically manage signing 사용 가능

시뮬레이터로는 AR 카메라/World Tracking 검증이 되지 않습니다.

---

## 11. 실제 iPhone 선택

- ARKit을 지원하는 실제 iPhone 연결
- 권장: iOS 15 이상
- USB 연결 후 기기 신뢰
- Developer Mode가 필요하면 켜기

---

## 12. Build & Run

Xcode에서 실제 iPhone을 선택한 뒤 Build & Run 합니다.

앱이 실행되면 spike Web shell이 보여야 합니다.

- 제목: `CatchCash Native AR iOS Spike`
- 버튼: `Start AR`, `Place Test Cube`, `Stop AR`

---

## 13. Start AR

1. `Start AR` 탭
2. 카메라 권한 허용
3. native fullscreen ARView가 열리는지 확인
4. 상태 영역 또는 native overlay에서 tracking 상태 확인

성공 시:

- 후면 카메라 영상이 native ARView에 보임
- `onSessionStarted` 또는 tracking 상태 메시지 표시

---

## 14. Place Test Cube

1. `Place Test Cube` 탭
   - fullscreen AR 중이면 native overlay의 `Place Test Cube`를 사용해도 됩니다.
2. 노란 cube가 카메라 기준 약 1.5m 앞에 나타나는지 확인
3. cube를 한 번 배치한 뒤, 카메라가 움직여도 cube가 화면 중앙에 붙어 따라오지 않는지 확인

성공 시:

- `onAnchorPlaced` 이벤트 또는 `Cube anchored 1.5m ahead` 메시지

---

## 15. 이동/회전 테스트

아래를 천천히 반복합니다.

1. 앞으로 걷기
2. 뒤로 걷기
3. 좌우로 걷기
4. 제자리에서 뒤돌기
5. 다시 원래 방향을 보기

촬영 포인트:

- cube가 현실의 같은 지점에 남아 있는지
- 카메라 화면을 따라다니지 않는지
- 시야 밖으로 나갔다가 다시 보이는지

---

## 16. Stop AR

1. `Stop AR` 탭
2. AR session이 pause되고 Web shell로 돌아오는지 확인
3. 다시 `Start AR`이 가능한지 확인

---

## 17. 테스트 영상 촬영

아래가 보이도록 영상을 찍습니다.

1. Start AR
2. Place Test Cube
3. 앞으로 이동
4. 뒤로 이동
5. 좌우 이동
6. 뒤돈 뒤 다시 보기
7. Stop AR

파일명 예:

`ios-native-ar-spike-world-anchor.mov`

---

## QA 성공 기준

- AR camera가 정상 실행된다
- tracking state가 `normal`이 된다
- cube가 약 1~2m 앞에 배치된다
- 앞으로 이동하면 cube가 가까워진다
- 뒤로 이동하면 cube가 멀어진다
- 좌우 이동 시 cube가 현실 위치를 유지한다
- 뒤돌면 cube가 화면에서 사라진다
- 다시 돌아보면 같은 위치에 cube가 있다
- cube가 카메라 화면을 따라다니지 않는다

실패로 볼 것:

- cube가 항상 화면 중앙/카메라 앞에 붙어 있다
- 이동해도 cube 크기/위치가 거의 변하지 않는다
- 회전해도 cube가 화면을 따라온다
- AR session이 열리지 않거나 카메라 권한이 없다

---

## 준비된 소스 위치

Web shell:

- `native-ios-spike-web/index.html`
- `native-ios-spike-web/main.js`
- `native-ios-spike-web/styles.css`
- `scripts/build-native-ios-spike-web.mjs`

TypeScript plugin:

- `native-plugins/native-ar/src/definitions.ts`
- `native-plugins/native-ar/src/index.ts`

Swift:

- `native-plugins/native-ar/ios/NativeARPlugin.swift`
- `native-plugins/native-ar/ios/NativeARViewController.swift`

---

## Windows에서 하지 말 것

- `npx cap add ios`
- `npx cap sync ios`
- `npx cap open ios`
- Xcode build
- 실제 iPhone 검증을 Windows에서 시도
