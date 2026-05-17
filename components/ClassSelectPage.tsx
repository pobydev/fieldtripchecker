"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { LoadingBox } from "@/components/LoadingBox";
import { PageHeader } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { formatKoreanDateTime, getStatusKind, normalizeRows, TRIPS } from "@/lib/trip";
import type { DayKey, FieldTripStatus } from "@/lib/types";

export function ClassSelectPage({ dayKey }: { dayKey: DayKey }) {
  const [rows, setRows] = useState<FieldTripStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const trip = TRIPS[dayKey];

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/status?day=${dayKey}`, { cache: "no-store" });
      const result = await response.json();
      if (ignore) return;
      if (!response.ok) {
        setError(result.error ?? "현황을 불러오지 못했습니다.");
      } else {
        setRows(normalizeRows(dayKey, result.data ?? []));
      }
      setLoading(false);
    }

    load();
    return () => {
      ignore = true;
    };
  }, [dayKey]);

  const summary = useMemo(() => {
    const finalized = rows.filter((row) => row.is_finalized).length;
    const draft = rows.filter((row) => row.is_submitted && !row.is_finalized).length;
    return { finalized, draft, pending: 12 - finalized - draft };
  }, [rows]);

  return (
    <main className="page-shell">
      <PageHeader
        title={`${trip.name} 참여 현황 입력`}
        description="본인 반을 선택해 입력해 주세요. 저장 후에도 다시 들어와 수정할 수 있습니다."
      />

      <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
        <Summary label="최종 완료" value={summary.finalized} tone="emerald" />
        <Summary label="임시 저장" value={summary.draft} tone="amber" />
        <Summary label="미입력" value={summary.pending} tone="slate" />
      </div>

      {loading ? <LoadingBox /> : null}
      {error ? (
        <div className="card mb-4 flex items-center gap-2 border-red-200 bg-red-50 text-sm font-bold text-red-600">
          <AlertCircle size={18} aria-hidden />
          {error}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => {
          const status = getStatusKind(row);
          return (
            <Link
              key={row.class_no}
              href={`/trip/${dayKey}/class/${row.class_no}`}
              onClick={(event) => {
                if (!window.confirm(`${trip.name} / ${row.class_name} 입력 화면으로 이동하시겠습니까?`)) {
                  event.preventDefault();
                }
              }}
              className={[
                "card p-4 transition hover:-translate-y-0.5",
                status === "finalized" ? "border-l-4 border-l-quizlet-violet" : status === "draft" ? "border-l-4 border-l-practice-orange" : "bg-white",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[20px] font-bold leading-[1.25] text-stormcloud-ink">{row.class_name}</h2>
                  <p className="mt-1 text-[12px] font-normal text-light-slate">최근 수정 {formatKoreanDateTime(row.updated_at)}</p>
                </div>
                <StatusBadge submitted={row.is_submitted} finalized={row.is_finalized} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Metric label="참여" value={row.participant_count ?? "-"} />
                <Metric label="불참" value={row.absent_count ?? "-"} danger />
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}

function Summary({ label, value, tone }: { label: string; value: number; tone: "emerald" | "amber" | "slate" }) {
  const color = tone === "emerald" ? "text-quizlet-violet" : tone === "amber" ? "text-[#8a4b05]" : "text-slate-text";
  return (
    <div className="card px-3 py-4">
      <p className="text-[12px] font-semibold text-slate-text">{label}</p>
      <p className={`mt-1 font-mono text-[22px] font-bold ${color}`}>{value}반</p>
    </div>
  );
}

function Metric({ label, value, danger = false }: { label: string; value: number | string; danger?: boolean }) {
  return (
    <div className="rounded bg-page-background p-3 shadow-subtle">
      <p className="text-[12px] font-semibold text-slate-text">{label}</p>
      <p className={danger ? "mt-1 font-mono text-[22px] font-bold text-danger" : "mt-1 font-mono text-[22px] font-bold text-stormcloud-ink"}>{value}</p>
    </div>
  );
}
