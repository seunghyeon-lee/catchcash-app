# 04_1_Notification_Inbox_Screen.md

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 04_1_Notification_Inbox_Screen |
| 화면명 | 알림 보관함 화면 |
| 파일명 | `04_1_Notification_Inbox_Screen.md` |
| 목적 | 사용자가 받은 알림을 확인하고, 알림 유형별로 분류 확인 및 관련 화면으로 이동할 수 있도록 하는 화면 정의 |
| 스타일 기준 | Tailwind CSS + 공통 흑백 손그림 디자인 지시문 |
| 디자인 반영 버전 | Stitch AI 알림 보관함 시안 기준 / 팝업형 알림 보관함 / 필터칩 + 알림 카드 리스트 / 알림 카드 프레임 에셋 적용 |
| 핵심 원칙 | 구조는 정갈하게, 선은 거칠게 |

---

## 2. 화면 개요

알림 보관함 화면은 메인 홈 GNB의 알림 아이콘을 탭했을 때 노출되는 **알림 전용 화면**이다.

이 화면에서 사용자는 아래를 수행할 수 있다.

- 받은 알림 목록 확인
- 안 읽은 알림과 읽은 알림 구분
- 알림 유형별 필터 조회
- 특정 알림 탭 후 관련 화면으로 이동
- 알림 전체 읽음 처리
- 알림이 없을 경우 빈 상태 확인

본 화면은 **서브 화면**으로 동작하며, 하단 탭바는 사용하지 않는다.

---

## 3. 화면 구조

```txt
상단 헤더
→ 화면 타이틀
→ 보조 문구
→ 필터칩 영역
→ 알림 카드 리스트
→ 빈 상태 또는 로딩 상태
```

### 3.1 상단 헤더

| 영역 | 내용 |
|---|---|
| 좌측 | 화면명 `알림` |
| 우측 | 닫기 버튼 `X` |
| 구분선 | 헤더 하단 1px 선 |

### 3.2 메인 카피

| 요소 | 문구 |
|---|---|
| 타이틀 | `뭐가 또 왔다.` |
| 보조 문구 | `읽을 건 읽고, 넘길 건 넘겨.` |

---

## 4. 필터칩 정책

알림 목록 상단에는 알림 유형을 빠르게 분류할 수 있는 필터칩을 배치한다.

### 4.1 필터칩 구성

| 순서 | 필터명 | 유형 |
|---|---|---|
| 1 | 전체 | 기본 필터 |
| 2 | 안읽음 | 상태 필터 |
| 3 | 쿠폰 | 알림 유형 필터 |
| 4 | 보물 | 알림 유형 필터 |
| 5 | 공지 | 알림 유형 필터 |
| 6 | 설정 | 알림 유형 필터 |

### 4.2 필터칩 디자인 정책

| 구분 | 정책 |
|---|---|
| 선택 상태 | 검정 배경 + 흰 텍스트 |
| 비선택 상태 | 흰 배경 + 검정 텍스트 |
| 외곽선 | 검정 rough border |
| 높이 | 28px ~ 32px |
| 정렬 | 좌측 정렬, 가로 배치 |
| 스크롤 | 화면 폭을 넘으면 가로 스크롤 허용 |

### 4.3 버튼 길이 정책

사용자가 말한 기준을 그대로 반영한다.

| 구분 | 정책 |
|---|---|
| 검정 버튼 | 선택된 상태 버튼 |
| 흰색 버튼(3글자 이상) | 일반 크기 버튼 |
| 작은 흰색 버튼(2글자) | 좁은 폭 버튼 |

### 4.4 버튼 프레임 구현 정책

카테고리 버튼도 단순 CSS 박스가 아니라 **프레임 에셋 + 텍스트 오버레이** 방식으로 구현한다.

```txt
카테고리 버튼 프레임 = SVG 에셋
버튼 텍스트 = 코드 텍스트
클릭 상태 = HTML button + state
```

### 4.5 버튼 유형 분류

| 버튼 유형 | 상태 | 글자 수 기준 | 사용 예시 |
|---|---|---|---|
| Active Medium | 활성화 | 3글자 이상 | 전체, 안읽음 |
| Active Small | 활성화 | 2글자 | 쿠폰, 보물, 공지, 설정 |
| Inactive Medium | 비활성화 | 3글자 이상 | 전체, 안읽음 |
| Inactive Small | 비활성화 | 2글자 | 쿠폰, 보물, 공지, 설정 |

### 4.6 버튼 폭 기준

| 버튼 타입 | 예시 | 권장 width |
|---|---|---|
| 활성화 일반 버튼 | 전체 / 안읽음 | 42px ~ 64px |
| 비활성 일반 버튼 | 전체 / 안읽음 | 42px ~ 64px |
| 활성화 소형 버튼 | 쿠폰 / 보물 / 공지 / 설정 | 32px ~ 40px |
| 비활성 소형 버튼 | 쿠폰 / 보물 / 공지 / 설정 | 32px ~ 40px |

### 4.7 버튼 프레임 에셋 정책

1차 MVP에서는 아래 4종 프레임을 필수로 사용한다.

| asset_name | 용도 |
|---|---|
| `ui_frame_filter_chip_active_md_rough_default.svg` | 활성화된 일반 길이 필터 버튼 |
| `ui_frame_filter_chip_active_sm_rough_default.svg` | 활성화된 소형 필터 버튼 |
| `ui_frame_filter_chip_inactive_md_rough_default.svg` | 비활성 일반 길이 필터 버튼 |
| `ui_frame_filter_chip_inactive_sm_rough_default.svg` | 비활성 소형 필터 버튼 |

필요 시 pressed/disabled 상태를 확장 에셋으로 추가할 수 있다.

### 4.8 기본 선택 상태

- 화면 최초 진입 시 기본 선택값은 `전체`
- 사용자가 필터를 탭하면 해당 필터만 활성화
- `안읽음`은 읽지 않은 알림만 필터링
- 유형 필터는 해당 유형 알림만 표시
- 필터 레이블 텍스트는 이미지에 포함하지 않고 코드 텍스트로 구현한다

---

## 5. 알림 카드 정책

알림 카드 영역은 **같은 구조의 공통 카드 컴포넌트**를 사용한다.  
단, 알림 제목/내용 길이에 따라 카드 높이는 자동으로 늘어난다.

### 5.1 카드 공통 규칙

| 항목 | 정책 |
|---|---|
| 카드 배경 | 흰색 프레임 에셋 |
| 외곽선 | 이미지 에셋의 hand-drawn frame 사용 |
| 카드 형태 | 사각형 기반, 손그림 느낌 |
| 높이 | 기본은 프레임 에셋 높이를 따름 |
| 기본 높이 | 디자인 시안 기준 56px ~ 76px |
| 확장 방식 | 1차 MVP는 프레임별 고정 높이 사용 |
| 간격 | 카드 간 8px ~ 12px |
| 내부 여백 | 12px ~ 16px |
| 정렬 | 리스트 수직 정렬 |

### 5.2 카드 크기 변화 정책

사용자가 요청한 대로 **4개 카드 박스는 정확한 직사각형 CSS 박스가 아니라, 꾸불꾸불한 손그림 사각형 프레임 에셋**을 사용한다.

즉, 알림 카드는 아래 방식으로 구현한다.

```txt
카드 프레임 = SVG 에셋
카드 안 텍스트 = 코드 텍스트
클릭 영역 = HTML button / link
```

이번 디자인 시안 기준으로 4개 카드 프레임은 서로 모양과 높이가 조금씩 다르다.  
따라서 1차 MVP에서는 **알림 유형별 카드 프레임 에셋을 분리**해서 사용한다.

```txt
1. 보물 관련 알림 = 프레임 에셋 A
2. 쿠폰 알림 = 프레임 에셋 B
3. 공지 및 규칙 알림 = 프레임 에셋 C
4. 설정 알림 = 프레임 에셋 D
```

### 5.2.1 길이 정책

- 알림 제목은 1줄
- 알림 본문은 최대 2줄
- 시간은 우측 상단 또는 우측 영역에 1줄
- 1차 MVP에서는 문구 길이를 제어해서 프레임 에셋 높이에 맞춘다.
- 향후 더 긴 문구가 필요하면 `_lg` 확장 프레임 에셋을 추가한다.

### 5.2.2 중요한 구현 원칙

- 카드 전체를 하나의 이미지처럼 사용하되, **텍스트는 이미지에 포함하지 않는다.**
- 프레임 SVG 위에 제목/본문/시간 텍스트를 올린다.
- 클릭, 읽음 처리, 이동은 실제 코드 컴포넌트에서 처리한다.
- 카드 박스의 꾸불꾸불한 외곽선은 CSS만으로 구현하지 않고, **프레임 에셋**으로 처리한다.

### 5.3 카드 레이아웃

```txt
NotificationCard wrapper
→ frame SVG
→ 좌측 아이콘
→ 중앙 텍스트 영역
   - 제목
   - 본문
→ 우측 시간 또는 보조 정보
```

권장 구조:

```tsx
<button className="relative w-full text-left">
  <img
    src={frameAsset}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
  />
  <div className="relative z-10 flex items-start gap-3 px-4 py-3">
    <img src={typeIcon} alt="" aria-hidden="true" className="h-5 w-5" />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold">제목</p>
      <p className="text-xs text-neutral-600">본문</p>
    </div>
    <span className="text-[10px] text-neutral-500">방금 전</span>
  </div>
</button>
```

### 5.4 읽음 / 안읽음 정책

| 상태 | 정책 |
|---|---|
| 안읽음 | 제목 bold, 카드 강조, 시간 노출 |
| 읽음 | 일반 텍스트 weight, 시각적 강조 감소 |
| 전체 읽음 처리 | 해당 사용자 알림 전체에 `is_read = true` 적용 |

---

## 6. 알림 유형별 정책

알림은 아래 4개 유형으로 관리한다.

### 6.1 1번 카드: 보물 관련 알림

#### 정의
새로운 보물 등장, 근처 보물 발견 가능, 보물 만료 임박, 탐색 가능 상태 등을 알려주는 알림

#### 예시 문구
- `근처에 보물 떴다.`
- `반경 500m 안에 새 보물이 나타났다. 빨리 찾거라`
- `사냥 가능한 상자가 근처에 있다.`

#### 정책

| 항목 | 내용 |
|---|---|
| type | `treasure` |
| 대표 아이콘 | 별 / 보물 / 위치 기반 아이콘 |
| 클릭 시 이동 | 지도 화면 또는 해당 보물 상세 화면 |
| 우선순위 | 높음 |
| 발송 시점 | 새 보물 오픈 / 사용자 반경 조건 충족 시 |
| 중복 처리 | 동일 보물에 대한 중복 발송 최소화 |
| 읽음 처리 | 알림 상세 탭 또는 관련 화면 진입 시 읽음 처리 가능 |

### 6.2 2번 카드: 쿠폰 알림

#### 정의
보상 획득 완료, 쿠폰 수령 가능, 보관함 확인 유도, 사용 만료 임박 등을 알려주는 알림

#### 예시 문구
- `보리상자 생긴 시간이구나`
- `보관함에서 쿠폰을 챙겨라`
- `전리품 챙길 시간이다.`

#### 정책

| 항목 | 내용 |
|---|---|
| type | `coupon` |
| 대표 아이콘 | 쿠폰 / 선물 / 보상 아이콘 |
| 클릭 시 이동 | 보관함 화면 또는 쿠폰 상세 팝업 진입 |
| 우선순위 | 높음 |
| 발송 시점 | 보상 확정 / 쿠폰 발급 가능 / 사용 만료 임박 |
| 발급 정책 | 본 화면에서 직접 발급하지 않음 |
| 유의사항 | 실제 기프티콘 코드는 보관함 상세에서 확인 |

### 6.3 3번 카드: 공지 및 규칙 알림

#### 정의
공지사항, 운영 정책 변경, 이용약관/규칙 변경, 이벤트 공지 등을 알려주는 알림

#### 예시 문구
- `사냥 규칙이 바뀌었다.`
- `새 이용 안내를 확인해라`
- `공지 좀 읽고 가라`

#### 정책

| 항목 | 내용 |
|---|---|
| type | `notice` |
| 대표 아이콘 | 별 / 메가폰 / 공지 아이콘 |
| 클릭 시 이동 | 공지 상세 화면 또는 규칙/약관 상세 웹뷰 |
| 우선순위 | 중간 |
| 발송 시점 | 공지 등록 / 규칙 변경 / 운영 안내 |
| 보관 정책 | 공지는 일반 알림보다 보관 기간을 길게 둘 수 있음 |
| 읽음 처리 | 공지 상세 진입 시 읽음 처리 |

### 6.4 4번 카드: 설정 알림

#### 정의
위치 권한 미허용, 알림 권한 꺼짐, 계정 설정 확인 필요 등 앱 설정 관련 상태를 알려주는 알림

#### 예시 문구
- `위치 권한이 꺼져 있다.`
- `이러면 보물 못 찾는다.`
- `알림 좀 켜둬라`

#### 정책

| 항목 | 내용 |
|---|---|
| type | `setting` |
| 대표 아이콘 | 톱니바퀴 아이콘 |
| 클릭 시 이동 | 설정 화면 또는 기기 설정 안내 화면 |
| 우선순위 | 중간 |
| 발송 시점 | 권한 미허용 감지 / 필수 설정 비활성 상태 |
| 중복 처리 | 동일 상태가 지속되면 반복 발송 제한 |
| 해소 처리 | 사용자가 설정을 완료하면 더 이상 노출하지 않음 |

---

## 6.5 알림 카드 프레임 에셋 정책

이번 알림보관함 시안에서는 카드 외곽선이 정확한 직사각형이 아니라 손그림처럼 꾸불꾸불한 사각형이기 때문에,  
알림 카드 박스도 **프레임 에셋**으로 정의한다.

### 6.5.1 유형별 카드 프레임 매핑

알림 프레임은 디자인 시안 기준으로 **2가지 형태**를 사용한다.

```txt
상단 각진 프레임 = 보물 / 쿠폰 알림
하단 둥근 프레임 = 공지 / 설정 알림
```

각 형태는 다시 **일반형**과 **확장형**으로 나뉜다.

| 순서 | 알림 유형 | 기본 프레임 에셋명 | 확장 프레임 에셋명 | 형태 특징 |
|---|---|---|---|---|
| 1 | 보물 관련 알림 | `ui_frame_notification_treasure_standard_rough_default.svg` | `ui_frame_notification_treasure_standard_rough_lg.svg` | 상단 각진 일반형/확장형 |
| 2 | 쿠폰 알림 | `ui_frame_notification_coupon_standard_rough_default.svg` | `ui_frame_notification_coupon_standard_rough_lg.svg` | 상단 각진 일반형/확장형 |
| 3 | 공지 및 규칙 알림 | `ui_frame_notification_notice_round_rough_default.svg` | `ui_frame_notification_notice_round_rough_lg.svg` | 하단 둥근 일반형/확장형 |
| 4 | 설정 알림 | `ui_frame_notification_setting_round_rough_default.svg` | `ui_frame_notification_setting_round_rough_lg.svg` | 하단 둥근 일반형/확장형 |

### 6.5.2 확장 프레임 정책

알림 본문이 길어지는 경우에는 `_lg` 확장형 프레임을 사용한다.

| 유형 | 일반형 사용 기준 | 확장형 사용 기준 |
|---|---|---|
| 보물 | 제목 1줄 + 본문 1줄 | 제목 1줄 + 본문 2줄 |
| 쿠폰 | 제목 1줄 + 본문 1줄 | 제목 1줄 + 본문 2줄 |
| 공지 | 제목 1줄 + 본문 1줄 | 제목 1줄 + 본문 2줄 |
| 설정 | 제목 1줄 + 본문 1줄 | 제목 1줄 + 본문 2줄 |

프레임 모양은 유형별로 고정한다.

```txt
보물/쿠폰 = standard
공지/설정 = round
```


### 6.5.3 디자인 시안 기준 프레임 형태

업로드된 프레임 시안 기준으로 아래처럼 분류한다.

| 시안 위치 | 형태명 | 사용 알림 |
|---|---|---|
| 위쪽 왼쪽 | standard default | 보물 일반형 |
| 위쪽 오른쪽 | standard lg | 보물/쿠폰 확장형 |
| 아래쪽 왼쪽 | round default | 공지/설정 일반형 |
| 아래쪽 오른쪽 | round lg | 공지/설정 확장형 |

정확한 에셋 네이밍은 알림 유형명까지 포함한다.  
즉 같은 standard 모양이라도 보물과 쿠폰은 파일을 별도로 관리한다.

```txt
보물 = treasure_standard
쿠폰 = coupon_standard
공지 = notice_round
설정 = setting_round
```

### 6.5.4 운영 카피 길이 제한

프레임 에셋 높이를 유지하기 위해 운영 문구는 아래 기준을 따른다.

- 제목: 최대 18자 내외
- 본문: 최대 28자 ~ 40자 내외
- 시간: 최대 6자 ~ 8자 내외
- 줄 수: 제목 1줄 + 본문 1~2줄

긴 공지는 알림 화면에서 요약만 보여주고, 탭 후 상세 화면에서 전체 내용을 확인한다.

---

## 7. 정렬 및 노출 정책

### 7.1 기본 정렬

알림 목록은 아래 순서로 정렬한다.

1. `is_read = false`인 안읽은 알림 우선
2. 같은 상태 내에서는 `created_at` 최신순
3. 동일 시간대일 경우 우선순위 높은 유형 우선

### 7.2 알림 수 제한

| 항목 | 정책 |
|---|---|
| 1차 노출 개수 | 최근 20개 |
| 추가 로딩 | 스크롤 하단 도달 시 더보기 또는 무한 스크롤 |
| 빈 상태 | 0건이면 빈 상태 표시 |

### 7.3 읽음 처리 정책

| 동작 | 처리 |
|---|---|
| 알림 카드 탭 | 해당 알림 `is_read = true` |
| 모두 읽음 탭 | 전체 알림 `is_read = true` |
| 필터 변경 | 읽음 상태 변경 없음 |

---

## 8. 상태 정책

### 8.1 빈 상태

| 요소 | 내용 |
|---|---|
| 타이틀 | `아직 조용하네.` |
| 보조 문구 | `보물도 소식도 아직 없다.` |
| 일러스트 | 알림 빈 상태 일러스트 |

### 8.2 로딩 상태

| 요소 | 내용 |
|---|---|
| 문구 | `뒤적이는 중...` |
| 표현 방식 | 스켈레톤 카드 또는 간단한 로딩 텍스트 |

### 8.3 오류 상태

| 요소 | 내용 |
|---|---|
| 타이틀 | `뭔가 꼬였다.` |
| 보조 문구 | `알림을 못 불러왔다. 다시 해봐.` |
| 액션 | 새로고침 버튼 또는 재시도 텍스트 버튼 |

---

## 9. 에셋 정의

### 9.1 필수 이미지 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `icon_action_close_rough_default_24.svg` | action icon | svg | notification | 24x24 | 알림 화면 우측 상단 닫기 아이콘 |
| `ui_frame_filter_chip_active_md_rough_default.svg` | filter chip frame | svg | notification | 56x24 | 활성화된 일반 길이 필터 버튼 프레임 |
| `ui_frame_filter_chip_active_sm_rough_default.svg` | filter chip frame | svg | notification | 36x24 | 활성화된 소형 필터 버튼 프레임 |
| `ui_frame_filter_chip_inactive_md_rough_default.svg` | filter chip frame | svg | notification | 56x24 | 비활성 일반 길이 필터 버튼 프레임 |
| `ui_frame_filter_chip_inactive_sm_rough_default.svg` | filter chip frame | svg | notification | 36x24 | 비활성 소형 필터 버튼 프레임 |
| `icon_notification_treasure_rough_default_20.svg` | notification icon | svg | notification | 20x20 | 보물 관련 알림 아이콘 |
| `icon_notification_coupon_rough_default_20.svg` | notification icon | svg | notification | 20x20 | 쿠폰 알림 아이콘 |
| `icon_notification_notice_rough_default_20.svg` | notification icon | svg | notification | 20x20 | 공지 및 규칙 알림 아이콘 |
| `icon_notification_setting_rough_default_20.svg` | notification icon | svg | notification | 20x20 | 설정 알림 아이콘 |
| `ui_frame_notification_treasure_standard_rough_default.svg` | notification frame | svg | notification | 320x56 | 보물 관련 알림 상단 각진 일반형 프레임 |
| `ui_frame_notification_coupon_standard_rough_default.svg` | notification frame | svg | notification | 320x56 | 쿠폰 알림 상단 각진 일반형 프레임 |
| `ui_frame_notification_notice_round_rough_default.svg` | notification frame | svg | notification | 320x60 | 공지 및 규칙 알림 하단 둥근 일반형 프레임 |
| `ui_frame_notification_setting_round_rough_default.svg` | notification frame | svg | notification | 320x60 | 설정 알림 하단 둥근 일반형 프레임 |
| `illust_empty_notification_rough_default.svg` | empty illustration | svg | notification | 160x120 | 알림 없음 빈 상태 일러스트 |

### 9.2 선택/확장 에셋

| asset_name | asset_type | format | usage_screen | recommended_size | description |
|---|---|---|---|---|---|
| `icon_notification_treasure_rough_unread_20.svg` | notification icon | svg | notification | 20x20 | 보물 알림 강조 상태 아이콘 |
| `icon_notification_coupon_rough_unread_20.svg` | notification icon | svg | notification | 20x20 | 쿠폰 알림 강조 상태 아이콘 |
| `icon_notification_notice_rough_unread_20.svg` | notification icon | svg | notification | 20x20 | 공지 알림 강조 상태 아이콘 |
| `icon_notification_setting_rough_unread_20.svg` | notification icon | svg | notification | 20x20 | 설정 알림 강조 상태 아이콘 |
| `ui_frame_notification_treasure_standard_rough_lg.svg` | notification frame | svg | notification | 320x72 | 보물 알림 상단 각진 확장형 프레임 |
| `ui_frame_notification_coupon_standard_rough_lg.svg` | notification frame | svg | notification | 320x72 | 쿠폰 알림 상단 각진 확장형 프레임 |
| `ui_frame_notification_notice_round_rough_lg.svg` | notification frame | svg | notification | 320x76 | 공지 알림 하단 둥근 확장형 프레임 |
| `ui_frame_notification_setting_round_rough_lg.svg` | notification frame | svg | notification | 320x76 | 설정 알림 하단 둥근 확장형 프레임 |
| `ui_frame_filter_chip_active_md_rough_pressed.svg` | filter chip frame | svg | notification | 56x24 | 활성화 일반 버튼 pressed 상태 |
| `ui_frame_filter_chip_active_sm_rough_pressed.svg` | filter chip frame | svg | notification | 36x24 | 활성화 소형 버튼 pressed 상태 |
| `ui_frame_filter_chip_inactive_md_rough_pressed.svg` | filter chip frame | svg | notification | 56x24 | 비활성 일반 버튼 pressed 상태 |
| `ui_frame_filter_chip_inactive_sm_rough_pressed.svg` | filter chip frame | svg | notification | 36x24 | 비활성 소형 버튼 pressed 상태 |

### 9.3 에셋으로 만들지 않는 항목

아래 항목은 에셋이 아니라 CSS/컴포넌트로 구현한다.

- 필터 버튼 텍스트
- 카드 내부 제목/본문/시간 텍스트
- 읽음/안읽음 상태 표시
- 전체 읽음 버튼
- 리스트 정렬
- 필터 영역 레이아웃

---

## 10. 구현 정책

### 10.1 컴포넌트 구조

```txt
NotificationInboxScreen
 ├─ NotificationHeader
 ├─ NotificationFilterChips
 ├─ NotificationList
 │   └─ NotificationCard
 │       └─ NotificationFrameAsset
 ├─ EmptyState
 └─ LoadingState
```

### 10.2 공통 컴포넌트

| 컴포넌트명 | 설명 |
|---|---|
| `NotificationHeader` | 상단 헤더 |
| `NotificationFilterChips` | 필터 버튼 영역 |
| `NotificationFilterChip` | 단일 필터 버튼 |
| `NotificationList` | 알림 목록 래퍼 |
| `NotificationCard` | 공통 알림 카드 |
| `NotificationFrameAsset` | 알림 유형별 프레임 매핑 |
| `NotificationTypeIcon` | 알림 유형 아이콘 |
| `NotificationEmptyState` | 빈 상태 |
| `NotificationLoadingState` | 로딩 상태 |




### 10.4 필터칩 프레임 구현 방식

카테고리 필터 버튼도 **프레임 SVG 에셋**을 바닥에 깔고, 그 위에 텍스트를 올리는 방식으로 구현한다.

```tsx
const filterFrameByState = {
  active: {
    md: '/assets/ui/frames/filter/ui_frame_filter_chip_active_md_rough_default.svg',
    sm: '/assets/ui/frames/filter/ui_frame_filter_chip_active_sm_rough_default.svg',
  },
  inactive: {
    md: '/assets/ui/frames/filter/ui_frame_filter_chip_inactive_md_rough_default.svg',
    sm: '/assets/ui/frames/filter/ui_frame_filter_chip_inactive_sm_rough_default.svg',
  },
} as const;

const size = label.length >= 3 ? 'md' : 'sm';
const state = isActive ? 'active' : 'inactive';

<button className="relative h-6 text-xs">
  <img
    src={filterFrameByState[state][size]}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
  />
  <span className="relative z-10 px-3">
    {label}
  </span>
</button>
```

구현 원칙:

- `전체`, `안읽음`은 md 프레임 우선 사용
- `쿠폰`, `보물`, `공지`, `설정`은 sm 프레임 우선 사용
- 글자 수가 늘어나면 md 또는 lg 확장 프레임을 추가할 수 있다
- 버튼 텍스트는 이미지에 포함하지 않는다
- 클릭 상태는 React state로 관리한다

### 10.5 카드 프레임 구현 방식

알림 카드 박스는 CSS만으로 구현하지 않고, **프레임 SVG 에셋**을 바닥에 깔고 그 위에 텍스트를 올리는 방식으로 구현한다.

```tsx
const frameByType = {
  treasure: {
    default: '/assets/ui/frames/notification/ui_frame_notification_treasure_standard_rough_default.svg',
    lg: '/assets/ui/frames/notification/ui_frame_notification_treasure_standard_rough_lg.svg',
  },
  coupon: {
    default: '/assets/ui/frames/notification/ui_frame_notification_coupon_standard_rough_default.svg',
    lg: '/assets/ui/frames/notification/ui_frame_notification_coupon_standard_rough_lg.svg',
  },
  notice: {
    default: '/assets/ui/frames/notification/ui_frame_notification_notice_round_rough_default.svg',
    lg: '/assets/ui/frames/notification/ui_frame_notification_notice_round_rough_lg.svg',
  },
  setting: {
    default: '/assets/ui/frames/notification/ui_frame_notification_setting_round_rough_default.svg',
    lg: '/assets/ui/frames/notification/ui_frame_notification_setting_round_rough_lg.svg',
  },
} as const;

<button className="relative w-full text-left">
  <img
    src={frameByType[item.type][item.sizeVariant ?? 'default']}
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
  />
  <div className="relative z-10 flex items-start gap-3 px-4 py-3">
    <img src={iconByType[item.type]} alt="" aria-hidden="true" className="h-5 w-5" />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold">{item.title}</p>
      <p className="text-xs text-neutral-600">{item.body}</p>
    </div>
    <span className="text-[10px] text-neutral-500">{item.createdAtLabel}</span>
  </div>
</button>
```

구현 원칙:

- 프레임 SVG는 `aria-hidden="true"` 처리
- 텍스트와 시간은 반드시 코드 텍스트로 구현
- 클릭 영역은 실제 button 또는 link
- 프레임별 크기 차이는 디자인 에셋 기준으로 유지
- 긴 문구는 줄 수 제한 및 ellipsis 정책을 둔다

### 10.3 알림 데이터 모델 권장안

```ts
type NotificationType = 'treasure' | 'coupon' | 'notice' | 'setting';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  linkType: 'map' | 'treasure_detail' | 'inventory' | 'notice_detail' | 'settings';
  linkValue?: string;
  priority: 'high' | 'medium' | 'low';
  sizeVariant?: 'default' | 'lg';
  createdAt: string;
}
```

---

## 11. 권장 파일 구조

```txt
app/
  notification/
    page.tsx

components/
  notification/
    NotificationHeader.tsx
    NotificationFilterChips.tsx
    NotificationFilterChip.tsx
    NotificationList.tsx
    NotificationCard.tsx
    NotificationEmptyState.tsx

constants/
  notificationAssets.ts
  notificationCopy.ts
  notificationFilters.ts

public/
  assets/
    icons/
      action/
        icon_action_close_rough_default_24.svg

      notification/
        icon_notification_treasure_rough_default_20.svg
        icon_notification_coupon_rough_default_20.svg
        icon_notification_notice_rough_default_20.svg
        icon_notification_setting_rough_default_20.svg

    ui/
      frames/
        filter/
          ui_frame_filter_chip_active_md_rough_default.svg
          ui_frame_filter_chip_active_sm_rough_default.svg
          ui_frame_filter_chip_inactive_md_rough_default.svg
          ui_frame_filter_chip_inactive_sm_rough_default.svg

        notification/
          ui_frame_notification_treasure_standard_rough_default.svg
          ui_frame_notification_treasure_standard_rough_lg.svg
          ui_frame_notification_coupon_standard_rough_default.svg
          ui_frame_notification_coupon_standard_rough_lg.svg
          ui_frame_notification_notice_round_rough_default.svg
          ui_frame_notification_notice_round_rough_lg.svg
          ui_frame_notification_setting_round_rough_default.svg
          ui_frame_notification_setting_round_rough_lg.svg

    illustrations/
      empty/
        illust_empty_notification_rough_default.svg
```

---

## 12. 개발자 주의사항

- 필터칩도 CSS 박스만으로 만들지 않고, 프레임 SVG 에셋을 사용한다.
- 알림 카드 박스는 CSS로 만들지 않고, 프레임 SVG 에셋을 사용한다.
- 카드 내부 텍스트만 코드로 올린다.
- 1차 MVP에서는 카드 프레임 높이를 고정하고, 운영 문구 길이를 관리한다.
- 알림 4종은 모두 하나의 `NotificationCard` 컴포넌트로 처리하되, type에 따라 프레임 에셋만 교체한다.
- 알림 유형 차이는 `아이콘`, `type`, `이동 경로`, `카피`, `우선순위`에서만 구분한다.
- 쿠폰 알림 화면에서 직접 쿠폰 발급이나 코드 노출은 하지 않는다.
- 설정 알림은 사용자가 설정 완료 시 더 이상 노출하지 않도록 상태 연동이 필요하다.
- 공지/규칙 알림은 운영자가 등록한 공지 데이터와 연결될 수 있도록 설계한다.

---

## 13. QA 체크리스트

- [ ] 기본 필터 `전체`가 검정 버튼으로 노출된다.
- [ ] `안읽음`은 일반 길이 프레임 버튼으로 노출된다.
- [ ] `쿠폰/보물/공지/설정`은 소형 프레임 버튼으로 노출된다.
- [ ] 활성/비활성 필터 프레임 에셋 4종이 정의되어 있다.
- [ ] 필터 버튼 텍스트는 이미지가 아니라 코드 텍스트로 구현된다.
- [ ] 알림 카드 4종이 유형별로 구분된다.
- [ ] 카드 프레임 에셋 8종이 정의되어 있다. 일반형 4종 + 확장형 4종
- [ ] 보물/쿠폰은 standard 프레임과 매핑된다.
- [ ] 공지/설정은 round 프레임과 매핑된다.
- [ ] 알림 문구 길이에 따라 default/lg 프레임을 선택할 수 있다.
- [ ] 카드 내부 텍스트는 이미지가 아니라 코드 텍스트로 구현된다.
- [ ] 보물 알림 탭 시 지도 또는 보물 상세로 이동한다.
- [ ] 쿠폰 알림 탭 시 보관함으로 이동한다.
- [ ] 공지 및 규칙 알림 탭 시 공지 상세 또는 약관/규칙 화면으로 이동한다.
- [ ] 설정 알림 탭 시 설정 화면으로 이동한다.
- [ ] 닫기 버튼 탭 시 이전 화면으로 닫힌다.
- [ ] 빈 상태와 로딩 상태가 정의되어 있다.
