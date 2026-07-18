# Figma 에셋 현황 (hunt-reward-flow)

> 최종 갱신: 2026-07-18 / 담당: 3번 (보관함·보상상세·지도·힌트·AR·결과)

Figma MCP(`get_design_context`)로 담당 화면 전체 에셋을 export 완료했고,
해시 파일명으로 내려온 원본을 내용(뷰박스·색상·사용 위치) 기준으로 식별해
스펙 파일명으로 `public/assets/` 하위에 배치했습니다.

## 배치 규칙

| 종류 | 위치 |
| --- | --- |
| 아이콘 | `assets/icons/{nav,gnb,tab,map,action,ar,result,inventory}/` |
| 지도 마커 | `assets/markers/map/` |
| 러프 프레임 | `assets/ui/frames/{global,treasure,ar,result,inventory,reward-detail}/` |
| 이미지 (지도/AR mock 배경, 보상 이미지) | `assets/images/{map,ar,inventory,result}/` |

## 참고

- 단순 도형(칩, 뱃지, 진행바, 상자 placeholder, HUNT LOG 카드 등)은 Figma에서
  벡터로 export되지 않고 CSS 코드로 제공되어 Tailwind로 동일하게 재현했습니다.
- `*_fill` / `*_stroke` 쌍으로 된 프레임은 Figma에서 두 레이어로 분리되어
  내려온 것으로, 코드에서 겹쳐서 사용합니다.
- 에셋 경로 상수는 `lib/hunt/assets.ts`에서 관리합니다.
