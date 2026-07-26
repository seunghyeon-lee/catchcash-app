# hunt-reward-flow 작업 범위 / 에셋 현황

> 브랜치: `feature/hunt-reward-flow`  
> 최종 갱신: 2026-07-19

## 이번 단계 (Mock UI 껍데기) — 완료

- [x] `/map` 임시 지도 placeholder + 마커 + 배너 + 컨트롤
- [x] 보물 힌트 팝업 (거리/HINT/CTA)
- [x] `/ar-hunt` dark camera placeholder + 상자 탭 → 결과
- [x] `/hunt-result?result=success|fail` (MD 카피 기준)
- [x] `/inventory` 필터(전체/사용가능/사용됨/만료됨) + 3+상태 카드
- [x] 보상 상세 팝업 (바코드 영역 / 쿠폰번호 / 복사 / 사용 완료로 표시 / 닫기)
- [x] Figma export 에셋 → MD 스펙 파일명으로 정리
- [x] `npm run lint` / `npm run build` 통과
- [x] 텍스트는 코드 텍스트, max-width 480px 유지

## 다음 단계 (MD 최종 기술 스펙) — 미구현

- [ ] Naver Maps JavaScript API (`/map`)
- [ ] `getUserMedia` + React Three Fiber WebAR Lite (`/ar-hunt`)
- [ ] Supabase Auth session / `treasure_boxes` 조회
- [ ] 거리 계산 유틸 (실 GPS)
- [ ] Supabase RPC `claim_treasure_with_lock`
- [ ] 기프티쇼비즈 쿠폰/바코드 실데이터
- [ ] Realtime 보물 상태 반영
- [ ] safe-area-inset / Capacitor 네이티브 권한 테스트

## 에셋 네이밍

코드 상수는 `lib/hunt/assets.ts`에서 관리한다.  
파일명은 화면 MD(`05`~`08`, `11`~`12`) 스펙명을 우선한다.

| MD 스펙명 | 위치 |
|---|---|
| `icon_nav_back_circle_rough_default_24.svg` | `icons/nav/` |
| `icon_gnb_notification_rough_default_24.svg` | `icons/gnb/` |
| `icon_gnb_help_rough_default_24.svg` | `icons/gnb/` |
| `icon_gnb_setting_rough_default_24.svg` | `icons/gnb/` |
| `icon_action_arrow_right_rough_default_20.svg` | `icons/action/` |
| `icon_inventory_*` | `icons/inventory/` |
| `icon_result_fail_empty_box_rough_default.svg` | `icons/result/` |
| `ui_frame_result_button_primary_black_rough_default.svg` | `ui/frames/result/` |
| `ui_frame_result_button_secondary_white_rough_default.svg` | `ui/frames/result/` |
| `ui_frame_reward_detail_modal_rough_default.svg` | `ui/frames/reward-detail/` |
| `ui_frame_reward_detail_barcode_box_rough_default.svg` | `ui/frames/reward-detail/` |
| `ui_frame_inventory_reward_card_available_rough_default.svg` | `ui/frames/inventory/` |

일부 단순 UI(필터 칩, 상태 배지, HUNT LOG 점선 카드, 진행바)는 MD대로 CSS로 재현한다.
