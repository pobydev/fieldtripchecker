import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabaseServer";
import { isDayKey } from "@/lib/trip";
import type { StatusPayload } from "@/lib/types";

function asNonNegativeNumber(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(`${label} 값이 올바르지 않습니다.`);
  }
  return value;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day");
    const classNo = searchParams.get("classNo");
    const supabase = createServiceSupabaseClient();

    let query = supabase
      .from("field_trip_status")
      .select("*")
      .order("day_key", { ascending: true })
      .order("class_no", { ascending: true });

    if (day) {
      if (!isDayKey(day)) {
        return NextResponse.json({ error: "일정 값이 올바르지 않습니다." }, { status: 400 });
      }
      query = query.eq("day_key", day);
    }

    if (classNo) {
      const parsed = Number(classNo);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 12) {
        return NextResponse.json({ error: "반 값이 올바르지 않습니다." }, { status: 400 });
      }
      query = query.eq("class_no", parsed);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "데이터를 불러오지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as StatusPayload;

    if (!isDayKey(payload.dayKey) || !Number.isInteger(payload.classNo) || payload.classNo < 1 || payload.classNo > 12) {
      return NextResponse.json({ error: "일정 또는 반 값이 올바르지 않습니다." }, { status: 400 });
    }
    if (typeof payload.isFinalized !== "boolean") {
      return NextResponse.json({ error: "최종 완료 값이 올바르지 않습니다." }, { status: 400 });
    }

    const enrolledCount = asNonNegativeNumber(payload.enrolledCount, "재적학생수");
    const participantCount = asNonNegativeNumber(payload.participantCount, "참여학생수");
    const absentCount = asNonNegativeNumber(payload.absentCount, "불참학생수");
    const annualPassCount =
      payload.dayKey === "lotte"
        ? asNonNegativeNumber(payload.annualPassCount ?? 0, "연간이용권 소지자수")
        : null;

    if (participantCount > enrolledCount) {
      return NextResponse.json({ error: "참여학생수는 재적학생수보다 클 수 없습니다." }, { status: 400 });
    }
    if (absentCount > enrolledCount) {
      return NextResponse.json({ error: "불참학생수는 재적학생수보다 클 수 없습니다." }, { status: 400 });
    }
    if (payload.dayKey === "lotte" && annualPassCount != null && annualPassCount > participantCount) {
      return NextResponse.json(
        { error: "연간이용권 소지자수는 참여학생수보다 클 수 없습니다." },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("field_trip_status")
      .update({
        enrolled_count: enrolledCount,
        participant_count: participantCount,
        absent_count: absentCount,
        absent_numbers: payload.absentNumbers.trim(),
        note: payload.note?.trim() || null,
        annual_pass_count: annualPassCount,
        updated_at: now,
        is_submitted: true,
        is_finalized: payload.isFinalized,
        finalized_at: payload.isFinalized ? now : null,
      })
      .eq("day_key", payload.dayKey)
      .eq("class_no", payload.classNo)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "저장하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
