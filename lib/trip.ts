import type { DayKey, FieldTripStatus } from "@/lib/types";

export const TRIPS: Record<DayKey, { key: DayKey; name: string; path: string }> = {
  lotte: { key: "lotte", name: "롯데월드", path: "/trip/lotte" },
  nanta: { key: "nanta", name: "난타공연", path: "/trip/nanta" },
};

export const CLASS_NUMBERS = Array.from({ length: 12 }, (_, index) => index + 1);

export function isDayKey(value: string): value is DayKey {
  return value === "lotte" || value === "nanta";
}

export function emptyRow(dayKey: DayKey, classNo: number): FieldTripStatus {
  return {
    id: `${dayKey}-${classNo}`,
    day_key: dayKey,
    day_name: TRIPS[dayKey].name,
    class_no: classNo,
    class_name: `2학년 ${classNo}반`,
    enrolled_count: null,
    participant_count: null,
    absent_count: null,
    absent_numbers: null,
    note: null,
    annual_pass_count: null,
    updated_at: null,
    is_submitted: false,
    is_finalized: false,
    finalized_at: null,
  };
}

export function getStatusKind(row: Pick<FieldTripStatus, "is_submitted" | "is_finalized">) {
  if (row.is_finalized) return "finalized";
  if (row.is_submitted) return "draft";
  return "empty";
}

export function normalizeRows(dayKey: DayKey, rows: FieldTripStatus[]) {
  return CLASS_NUMBERS.map((classNo) => rows.find((item) => item.class_no === classNo) ?? emptyRow(dayKey, classNo));
}

export function formatKoreanDateTime(value: string | null) {
  if (!value) return "없음";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function countAbsentNumbers(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "없음") return 0;
  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter((item) => /^\d+$/.test(item)).length;
}

export function csvEscape(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll("\"", "\"\"")}"`;
}
