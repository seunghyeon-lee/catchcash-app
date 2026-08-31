-- 매핑 종료 사유 등 관리자 액션 로그를 operation_logs에 기록하기 위한 insert 권한.
-- RLS 정책(operation_logs_insert_operator_or_super_admin)이 관리자 role을 계속 검사하므로
-- 일반 authenticated 사용자는 여전히 insert할 수 없다.
grant insert on public.operation_logs to authenticated;
