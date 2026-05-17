alter publication supabase_realtime add table public.field_trip_status;

-- Supabase Dashboard에서 확인할 경우:
-- Database > Replication > supabase_realtime publication에서
-- public.field_trip_status 테이블의 INSERT, UPDATE, DELETE를 활성화합니다.
