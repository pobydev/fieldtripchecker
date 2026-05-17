create table if not exists public.field_trip_status (
  id uuid primary key default gen_random_uuid(),
  day_key text not null check (day_key in ('lotte', 'nanta')),
  day_name text not null,
  class_no integer not null check (class_no between 1 and 12),
  class_name text not null,
  enrolled_count integer check (enrolled_count is null or enrolled_count >= 0),
  participant_count integer check (participant_count is null or participant_count >= 0),
  absent_count integer check (absent_count is null or absent_count >= 0),
  absent_numbers text,
  note text,
  annual_pass_count integer check (annual_pass_count is null or annual_pass_count >= 0),
  updated_at timestamptz,
  is_submitted boolean not null default false,
  is_finalized boolean not null default false,
  finalized_at timestamptz,
  unique (day_key, class_no)
);

alter table public.field_trip_status enable row level security;

drop policy if exists "Allow public read for field trip status" on public.field_trip_status;
create policy "Allow public read for field trip status"
on public.field_trip_status
for select
to anon
using (true);

-- 쓰기/초기화는 Next.js API Route가 service role key로 처리합니다.
-- anon 사용자에게 insert/update/delete 정책을 만들지 않습니다.

create index if not exists field_trip_status_day_class_idx
on public.field_trip_status (day_key, class_no);
