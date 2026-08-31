-- 보물 위치 문구(운영용 장소명) 저장 컬럼 추가.
-- latitude/longitude는 지도/AR 계산용 좌표로 유지하고, location_text는 사람이 읽는 위치 설명을 담는다.
-- 기존 row는 null 허용 → 화면에서 위경도 fallback 표시.
alter table public.treasure_boxes
add column if not exists location_text text;
