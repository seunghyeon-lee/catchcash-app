# 09. 명예의 전당 화면 정의서
## 최종 에셋 정리본

---

## 1. 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 09. 명예의 전당 화면 정의서 |
| 파일명 | `09_Hall_Of_Fame_Screen_v3_final_assets.md` |
| 화면명 | 명예의 전당 화면 |
| 화면 ID | `09_Hall_Of_Fame_Screen` |
| 서비스 | 캐치캐쉬 |
| 작성 목적 | Stitch AI 디자인 결과 기준 최종 에셋 명칭 정의 및 바이브코딩 구현 기준 정리 |
| 대상 환경 | iOS / Android Capacitor WebView |
| 구현 기준 | Next.js App Router + React + TypeScript |
| 스타일 기준 | Tailwind CSS + 공통 흑백 손그림 디자인 지시문 |
| 디자인 반영 버전 | Stitch AI 명예의 전당 Grug 시안 기준 최종본 |

---

## 2. 화면 개요

명예의 전당 화면은 캐치캐쉬에서 보물을 많이 찾은 헌터들의 기록을 보여주는 랭킹 화면이다.

이 화면은 아래 정보를 제공한다.

```txt
최고의 사냥꾼
이번 주 발견된 갯수
최근 발견된 상자
나의 기록
기간 필터
헌터 랭킹 리스트
하단 탭바
```

---

## 3. 최종 에셋 목록

이번 화면에서 최종적으로 정의하는 에셋은 아래가 전부다.

| 순서 | 요소 | 에셋명 | 비고 |
|---:|---|---|---|
| 1 | 최고의 사냥꾼 프레임 | `ui_frame_fame_top_hunter_card_rough_default.svg` | 상단 메인 카드 |
| 2 | 이번 주 발견된 갯수 프레임 | `ui_frame_fame_summary_card_left_rough_default.svg` | 좌측 요약 카드 |
| 3 | 최근 발견된 상자 프레임 | `ui_frame_fame_summary_card_right_rough_default.svg` | 우측 요약 카드 |
| 4 | 최근 발견된 상자 아이콘 | `icon_fame_recent_chest_rough_default_20.svg` | 우측 요약 카드 내부 아이콘 |
| 5 | 메달 리본 아이콘 | `icon_fame_medal_ribbon_rough_default.svg` | 최고의 사냥꾼 카드 우측 장식 |
| 6 | 나의 기록 프레임 | `ui_frame_fame_my_record_card_black_rough_default.svg` | 검정색 my record 카드 |
| 7 | 나의 기록 순위 배지 프레임 | `ui_frame_fame_my_rank_badge_rough_default.svg` | `#458` 배지 박스 |
| 8 | 활성 필터 버튼 | `ui_frame_fame_filter_active_rough_default.svg` | 선택된 필터 |
| 9 | 비활성 필터 버튼 | `ui_frame_fame_filter_inactive_rough_default.svg` | 미선택 필터 |
| 10 | 캐릭터 이미지 fallback | `img_fame_avatar_fallback_rough_default.svg` | 프로필 이미지 없을 때 |
| 11 | 하단 탭바 프레임 | `ui_frame_bottom_tab_bar_rough_default.svg` | 공통 하단 네비게이션 |

---

## 4. 에셋 상세 정의

## 4.1 최고의 사냥꾼 프레임

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_fame_top_hunter_card_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 화면 상단, 최고의 사냥꾼 카드 |
| 내부 텍스트 | 코드 텍스트 |
| 내부 이미지 | `img_fame_avatar_fallback_rough_default.svg` 또는 사용자 프로필 이미지 |
| 설명 | 오늘 또는 전체 기준 최고의 사냥꾼을 강조하는 카드 프레임 |

### 포함 정보

```txt
오늘 최고 사냥꾼
닉네임
보물 발견 수
아바타
메달 리본 아이콘
```

---

## 4.2 이번 주 발견된 갯수 프레임

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_fame_summary_card_left_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 상단 요약 카드 좌측 |
| 내부 텍스트 | 코드 텍스트 |
| 설명 | 이번 주 발견된 보물 갯수를 보여주는 요약 카드 프레임 |

### 포함 정보

```txt
이번 주 발견된 갯수
42 finds
```

---

## 4.3 최근 발견된 상자 프레임

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_fame_summary_card_right_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 상단 요약 카드 우측 |
| 내부 텍스트 | 코드 텍스트 |
| 내부 아이콘 | `icon_fame_recent_chest_rough_default_20.svg` |
| 설명 | 최근 발견된 상자 정보를 보여주는 요약 카드 프레임 |

### 포함 정보

```txt
최근 발견된 상자
황금 상자
3분 전 · 동작구
```

---

## 4.4 최근 발견된 상자 아이콘

| 항목 | 내용 |
|---|---|
| 에셋명 | `icon_fame_recent_chest_rough_default_20.svg` |
| 종류 | icon |
| 형식 | SVG |
| 사용 위치 | 최근 발견된 상자 프레임 내부 |
| 설명 | 최근 발견된 보물상자를 나타내는 작은 아이콘 |
| 텍스트 포함 여부 | 없음 |

이 아이콘은 쿠폰 아이콘이 아니라 **상자 아이콘**이다.

---

## 4.5 메달 리본 아이콘

| 항목 | 내용 |
|---|---|
| 에셋명 | `icon_fame_medal_ribbon_rough_default.svg` |
| 종류 | icon |
| 형식 | SVG |
| 사용 위치 | 최고의 사냥꾼 카드 우측 |
| 설명 | 최고 사냥꾼을 강조하는 메달/리본 장식 |
| 텍스트 포함 여부 | 없음 |

---

## 4.6 나의 기록 프레임

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_fame_my_record_card_black_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 요약 카드 아래, my record 영역 |
| 배경 | 검정 |
| 내부 텍스트 | 코드 텍스트 |
| 설명 | 내 총 발견 수와 최근 발견 정보를 보여주는 검정 카드 프레임 |

### 포함 정보

```txt
my record
total finds
08
recent
보물상자 명칭
2일 전
#458
```

---

## 4.7 나의 기록 순위 배지 프레임

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_fame_my_rank_badge_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 나의 기록 카드 우측 상단 |
| 내부 텍스트 | 코드 텍스트 |
| 예시 텍스트 | `#458` |
| 설명 | 내 랭킹 번호를 표시하는 작은 흰색 배지 프레임 |

중요:

```txt
#458 박스 모양 = ui_frame_fame_my_rank_badge_rough_default.svg
#458 글자 = 코드 텍스트
```

---

## 4.8 활성 필터 버튼

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_fame_filter_active_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 기간 필터 영역 |
| 사용 예시 | `전체` |
| 내부 텍스트 | 코드 텍스트 |
| 설명 | 선택된 필터 버튼 프레임 |

---

## 4.9 비활성 필터 버튼

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_fame_filter_inactive_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 기간 필터 영역 |
| 사용 예시 | `오늘`, `이번 주`, `이번 달` |
| 내부 텍스트 | 코드 텍스트 |
| 설명 | 선택되지 않은 필터 버튼 프레임 |

---

## 4.10 캐릭터 이미지 fallback

| 항목 | 내용 |
|---|---|
| 에셋명 | `img_fame_avatar_fallback_rough_default.svg` |
| 종류 | image |
| 형식 | SVG |
| 사용 위치 | 최고의 사냥꾼 카드, 랭킹 리스트 |
| 설명 | 유저 프로필 이미지가 없을 때 사용하는 기본 캐릭터 이미지 |

이 에셋 하나를 공통 fallback으로 사용한다.

```txt
최고의 사냥꾼 아바타
랭킹 리스트 아바타
내 프로필 이미지가 없을 때
```

별도 `my avatar fallback`은 만들지 않는다.

---

## 4.11 하단 탭바 프레임

| 항목 | 내용 |
|---|---|
| 에셋명 | `ui_frame_bottom_tab_bar_rough_default.svg` |
| 종류 | UI frame |
| 형식 | SVG |
| 사용 위치 | 화면 하단 |
| 설명 | 공통 하단 네비게이션 프레임 |

하단 탭바는 명예의 전당 전용이 아니라 전역 공통 에셋이다.

현재 화면 활성 탭:

```txt
랭킹
```

---

## 5. 정의하지 않는 에셋

아래 에셋은 만들지 않는다.

| 제외 요소 | 이유 |
|---|---|
| 랭킹 row 프레임 | 리스트 row는 CSS border-bottom으로 처리 |
| 내 아바타 fallback 별도 이미지 | `img_fame_avatar_fallback_rough_default.svg` 하나로 통일 |
| 헤더 하단 라인 | CSS border로 처리 |
| 랭킹 숫자 아이콘 | 코드 텍스트로 처리 |

### 제외 에셋명

```txt
ui_frame_fame_ranking_row_rough_default.svg
img_fame_my_avatar_fallback_rough_default.svg
```

---

## 6. 코드/CSS로 구현할 요소

| 요소 | 구현 방식 |
|---|---|
| 화면 타이틀 | 코드 텍스트 |
| 보조 문구 | 코드 텍스트 |
| 닉네임 | 코드 텍스트 |
| 발견 수 | 코드 텍스트 |
| 순위 | 코드 텍스트 |
| 지역명 | 코드 텍스트 |
| 시간 | 코드 텍스트 |
| 랭킹 리스트 row | CSS flex + border-bottom |
| 필터 선택 상태 | React state |
| 하단 탭 라벨 | 코드 텍스트 |
| 데이터 정렬 | API 또는 클라이언트 로직 |

---

## 7. 저장 경로

```txt
public/
  assets/
    icons/
      fame/
        icon_fame_recent_chest_rough_default_20.svg
        icon_fame_medal_ribbon_rough_default.svg

    images/
      fame/
        img_fame_avatar_fallback_rough_default.svg

    ui/
      frames/
        fame/
          ui_frame_fame_top_hunter_card_rough_default.svg
          ui_frame_fame_summary_card_left_rough_default.svg
          ui_frame_fame_summary_card_right_rough_default.svg
          ui_frame_fame_my_record_card_black_rough_default.svg
          ui_frame_fame_my_rank_badge_rough_default.svg
          ui_frame_fame_filter_active_rough_default.svg
          ui_frame_fame_filter_inactive_rough_default.svg

        global/
          ui_frame_bottom_tab_bar_rough_default.svg
```

---

## 8. 코드 상수

```ts
export const FAME_ASSETS = {
  topHunterCardFrame: '/assets/ui/frames/fame/ui_frame_fame_top_hunter_card_rough_default.svg',
  summaryLeftCardFrame: '/assets/ui/frames/fame/ui_frame_fame_summary_card_left_rough_default.svg',
  summaryRightCardFrame: '/assets/ui/frames/fame/ui_frame_fame_summary_card_right_rough_default.svg',

  recentChestIcon: '/assets/icons/fame/icon_fame_recent_chest_rough_default_20.svg',
  medalRibbonIcon: '/assets/icons/fame/icon_fame_medal_ribbon_rough_default.svg',

  myRecordCardFrame: '/assets/ui/frames/fame/ui_frame_fame_my_record_card_black_rough_default.svg',
  myRankBadgeFrame: '/assets/ui/frames/fame/ui_frame_fame_my_rank_badge_rough_default.svg',

  filterActiveFrame: '/assets/ui/frames/fame/ui_frame_fame_filter_active_rough_default.svg',
  filterInactiveFrame: '/assets/ui/frames/fame/ui_frame_fame_filter_inactive_rough_default.svg',

  avatarFallback: '/assets/images/fame/img_fame_avatar_fallback_rough_default.svg',

  bottomTabBarFrame: '/assets/ui/frames/global/ui_frame_bottom_tab_bar_rough_default.svg',
} as const;
```

---

## 9. 화면 데이터 구조

```ts
export type FameFilter = 'all' | 'today' | 'week' | 'month';

export interface FameTopHunter {
  nickname: string;
  avatarUrl?: string;
  findCount: number;
  subtitle: string;
}

export interface FameSummary {
  weeklyFindCount: number;
  recentTreasureName: string;
  recentTreasureLocation: string;
  recentTreasureTimeLabel: string;
}

export interface FameMyRecord {
  rank: number;
  totalFinds: number;
  recentTreasureName: string;
  recentFoundAtLabel: string;
}

export interface FameRankingUser {
  rank: number;
  nickname: string;
  avatarUrl?: string;
  findCount: number;
  locationLabel: string;
  lastFoundAtLabel: string;
}
```

---

## 10. QA 체크리스트

- [ ] 최종 에셋은 11개만 사용한다.
- [ ] `#458` 배지는 `ui_frame_fame_my_rank_badge_rough_default.svg` 프레임 위에 코드 텍스트로 표시된다.
- [ ] 최근 발견된 상자 아이콘은 `icon_fame_recent_chest_rough_default_20.svg`를 사용한다.
- [ ] 랭킹 row 프레임 에셋은 사용하지 않는다.
- [ ] 캐릭터 fallback은 `img_fame_avatar_fallback_rough_default.svg` 하나만 사용한다.
- [ ] 필터 버튼은 활성/비활성 프레임을 나눠 사용한다.
- [ ] 모든 텍스트는 이미지에 포함하지 않는다.
