alter table public.field_trip_status
add column if not exists is_finalized boolean not null default false;

alter table public.field_trip_status
add column if not exists finalized_at timestamptz;

update public.field_trip_status
set is_finalized = false
where is_finalized is null;
