import { createServiceSupabaseClient } from "@/lib/supabaseServer";
import { normalizeRows } from "@/lib/trip";
import type { DayKey, FieldTripStatus } from "@/lib/types";

export async function getStatuses(dayKey?: DayKey) {
  const supabase = createServiceSupabaseClient();
  let query = supabase
    .from("field_trip_status")
    .select("*")
    .order("day_key", { ascending: true })
    .order("class_no", { ascending: true });

  if (dayKey) {
    query = query.eq("day_key", dayKey);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (dayKey) {
    return normalizeRows(dayKey, (data ?? []) as FieldTripStatus[]);
  }

  return (data ?? []) as FieldTripStatus[];
}

export async function getClassStatus(dayKey: DayKey, classNo: number) {
  const rows = await getStatuses(dayKey);
  return rows.find((row) => row.class_no === classNo);
}
