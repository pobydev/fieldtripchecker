insert into public.field_trip_status (day_key, day_name, class_no, class_name, is_submitted, is_finalized)
select 'lotte', '롯데월드', class_no, '2학년 ' || class_no || '반', false, false
from generate_series(1, 12) as class_no
on conflict (day_key, class_no) do update
set day_name = excluded.day_name,
    class_name = excluded.class_name;

insert into public.field_trip_status (day_key, day_name, class_no, class_name, is_submitted, is_finalized)
select 'nanta', '난타공연', class_no, '2학년 ' || class_no || '반', false, false
from generate_series(1, 12) as class_no
on conflict (day_key, class_no) do update
set day_name = excluded.day_name,
    class_name = excluded.class_name;
