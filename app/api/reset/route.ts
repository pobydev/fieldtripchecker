import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabaseServer";
import { isDayKey } from "@/lib/trip";

export async function POST(request: Request) {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD ?? "0000";
    if (request.headers.get("x-admin-password") !== adminPassword) {
      return NextResponse.json({ error: "관리자 암호가 필요합니다." }, { status: 401 });
    }

    const body = (await request.json()) as { dayKey?: string; scope: "day" | "all" };

    if (body.scope === "day" && (!body.dayKey || !isDayKey(body.dayKey))) {
      return NextResponse.json({ error: "초기화할 일정이 올바르지 않습니다." }, { status: 400 });
    }

    const supabase = createServiceSupabaseClient();
    let query = supabase.from("field_trip_status").update({
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
    });

    if (body.scope === "day") {
      query = query.eq("day_key", body.dayKey);
    } else {
      query = query.in("day_key", ["lotte", "nanta"]);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "초기화하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
