export type DayKey = "lotte" | "nanta";

export type FieldTripStatus = {
  id: string;
  day_key: DayKey;
  day_name: string;
  class_no: number;
  class_name: string;
  enrolled_count: number | null;
  participant_count: number | null;
  absent_count: number | null;
  absent_numbers: string | null;
  note: string | null;
  annual_pass_count: number | null;
  updated_at: string | null;
  is_submitted: boolean;
  is_finalized: boolean;
  finalized_at: string | null;
};

export type StatusPayload = {
  dayKey: DayKey;
  classNo: number;
  enrolledCount: number;
  participantCount: number;
  absentCount: number;
  absentNumbers: string;
  note?: string | null;
  annualPassCount?: number | null;
  isFinalized: boolean;
};
