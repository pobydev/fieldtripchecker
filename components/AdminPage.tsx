"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, RefreshCcw, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { csvEscape, formatKoreanDateTime, getStatusKind, normalizeRows, TRIPS } from "@/lib/trip";
import type { DayKey, FieldTripStatus } from "@/lib/types";

export function AdminPage() {
  const [activeDay, setActiveDay] = useState<DayKey>("lotte");
  const [rows, setRows] = useState<FieldTripStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const response = await fetch("/api/status", { cache: "no-store" });
    const result = await response.json();
    if (response.ok) {
      setRows(result.data ?? []);
      setMessage("");
    } else {
      setMessage(result.error ?? "현황을 불러오지 못했습니다.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createBrowserSupabaseClient>["channel"]> | null = null;
    let supabase: ReturnType<typeof createBrowserSupabaseClient> | null = null;

    try {
      supabase = createBrowserSupabaseClient();
      channel = supabase
        .channel("field_trip_status_changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "field_trip_status" }, (payload) => {
          const row = (payload.new || payload.old) as Partial<FieldTripStatus>;
          if (row.day_key && row.class_no) {
            setHighlighted(`${row.day_key}-${row.class_no}`);
            window.setTimeout(() => setHighlighted(null), 2500);
          }
          load();
        })
        .subscribe();
    } catch {
      setMessage("Realtime 구독 환경 변수가 설정되지 않았습니다. 10초마다 자동 새로고침합니다.");
    }

    const interval = window.setInterval(() => load(), 10000);
    return () => {
      window.clearInterval(interval);
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, [load]);

  const activeRows = useMemo(() => normalizeRows(activeDay, rows.filter((row) => row.day_key === activeDay)), [activeDay, rows]);
  const summary = useMemo(() => {
    const finalized = activeRows.filter((row) => row.is_finalized).length;
    const draft = activeRows.filter((row) => row.is_submitted && !row.is_finalized).length;
    const sum = (key: keyof FieldTripStatus) =>
      activeRows.reduce((total, row) => total + (typeof row[key] === "number" ? (row[key] as number) : 0), 0);

    return {
      enrolled: sum("enrolled_count"),
      participant: sum("participant_count"),
      absent: sum("absent_count"),
      annualPass: sum("annual_pass_count"),
      finalized,
      draft,
      pending: 12 - finalized - draft,
    };
  }, [activeRows]);

  function statusText(row: FieldTripStatus) {
    const status = getStatusKind(row);
    if (status === "finalized") return "최종 완료";
    if (status === "draft") return "임시 저장";
    return "미입력";
  }

  function downloadCsv() {
    const headers =
      activeDay === "lotte"
        ? ["반", "상태", "재적학생수", "참여학생수", "불참학생수", "불참학생 번호", "비고", "연간이용권 소지자수", "최근 수정 시간", "최종 완료 시간"]
        : ["반", "상태", "재적학생수", "참여학생수", "불참학생수", "불참학생 번호", "비고", "최근 수정 시간", "최종 완료 시간"];

    const body = activeRows.map((row) => {
      const cells =
        activeDay === "lotte"
          ? [row.class_name, statusText(row), row.enrolled_count, row.participant_count, row.absent_count, row.absent_numbers, row.note, row.annual_pass_count, row.updated_at, row.finalized_at]
          : [row.class_name, statusText(row), row.enrolled_count, row.participant_count, row.absent_count, row.absent_numbers, row.note, row.updated_at, row.finalized_at];
      return cells.map(csvEscape).join(",");
    });
    const csv = `\uFEFF${headers.map(csvEscape).join(",")}\n${body.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${TRIPS[activeDay].name}_참여현황.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function reset(scope: "day" | "all") {
    if (!window.confirm("입력 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    const response = await fetch("/api/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope, dayKey: activeDay }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error ?? "초기화하지 못했습니다.");
      return;
    }
    setMessage("초기화되었습니다.");
    load();
  }

  function toggleNote(key: string) {
    setOpenNotes((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <main className="page-shell">
      <PageHeader title="관리자 화면" />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-white p-1 shadow-quizlet">
          {(["lotte", "nanta"] as DayKey[]).map((dayKey) => (
            <button
              key={dayKey}
              type="button"
              onClick={() => setActiveDay(dayKey)}
              className={activeDay === dayKey ? "rounded bg-quizlet-violet px-4 py-3 text-sm font-bold text-white" : "rounded px-4 py-3 text-sm font-semibold text-slate-text hover:bg-page-background hover:text-quizlet-violet"}
            >
              {TRIPS[dayKey].name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <button type="button" onClick={downloadCsv} className="secondary-button hidden sm:inline-flex">
            <Download size={18} aria-hidden />
            CSV 다운로드
          </button>
          <button type="button" onClick={() => reset("day")} className="danger-button min-h-10 px-3 py-2 text-sm sm:min-h-12 sm:px-5 sm:py-3 sm:text-[16px]">
            <RefreshCcw size={16} aria-hidden />
            해당 일정 초기화
          </button>
          <button type="button" onClick={() => reset("all")} className="danger-button min-h-10 px-3 py-2 text-sm sm:min-h-12 sm:px-5 sm:py-3 sm:text-[16px]">
            <RotateCcw size={16} aria-hidden />
            전체 초기화
          </button>
        </div>
      </div>

      {message ? <div className="card mb-5 bg-practice-orange/35 text-sm font-semibold text-[#8a4b05]">{message}</div> : null}
      {loading ? <div className="card mb-5 text-sm font-normal text-slate-text">불러오는 중입니다.</div> : null}

      <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
        <SummaryCard label="전체 재적" value={summary.enrolled} />
        <SummaryCard label="전체 참여" value={summary.participant} />
        <SummaryCard label="전체 불참" value={summary.absent} danger />
        {activeDay === "lotte" ? <SummaryCard label="연간이용권" value={summary.annualPass} /> : null}
        <SummaryCard label="최종 완료" value={`${summary.finalized}/12`} success />
        <SummaryCard label="임시 저장" value={`${summary.draft}/12`} warning />
        <SummaryCard label="미입력" value={`${summary.pending}/12`} />
      </section>

      <section className="grid gap-3 md:hidden">
        {activeRows.map((row) => {
          const key = `${row.day_key}-${row.class_no}`;
          return (
            <article key={key} className={`card space-y-4 ${highlighted === key ? "ring-4 ring-[rgba(66,85,255,0.18)]" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[20px] font-bold text-stormcloud-ink">{row.class_name}</h2>
                  <p className="mt-1 text-[12px] font-normal text-light-slate">최근 수정 {formatKoreanDateTime(row.updated_at)}</p>
                </div>
                <StatusBadge submitted={row.is_submitted} finalized={row.is_finalized} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <MobileMetric label="재적" value={row.enrolled_count ?? "-"} />
                <MobileMetric label="참여" value={row.participant_count ?? "-"} />
                <MobileMetric label="불참" value={row.absent_count ?? "-"} danger />
              </div>
              <Detail label="불참학생 번호" value={row.absent_numbers || "-"} />
              {activeDay === "lotte" ? <Detail label="연간이용권 소지자수" value={row.annual_pass_count ?? "-"} /> : null}
              <NoteButton rowKey={key} note={row.note} open={Boolean(openNotes[key])} onClick={() => toggleNote(key)} />
            </article>
          );
        })}
      </section>

      <section className="hidden overflow-hidden rounded-lg bg-white shadow-quizlet md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead className="bg-page-background text-[12px] font-bold text-slate-text">
              <tr>
                <Th>반</Th>
                <Th>상태</Th>
                <Th>재적</Th>
                <Th>참여</Th>
                <Th>불참</Th>
                <Th>불참학생 번호</Th>
                <Th>비고</Th>
                {activeDay === "lotte" ? <Th>연간이용권</Th> : null}
                <Th>최근 수정</Th>
              </tr>
            </thead>
            <tbody>
              {activeRows.map((row) => {
                const key = `${row.day_key}-${row.class_no}`;
                return (
                  <tr key={key} className={`border-t border-ash-border ${highlighted === key ? "bg-[rgba(66,85,255,0.08)]" : ""}`}>
                    <Td strong>{row.class_name}</Td>
                    <Td><StatusBadge submitted={row.is_submitted} finalized={row.is_finalized} /></Td>
                    <Td>{row.enrolled_count ?? "-"}</Td>
                    <Td>{row.participant_count ?? "-"}</Td>
                    <Td danger>{row.absent_count ?? "-"}</Td>
                    <Td>{row.absent_numbers || "-"}</Td>
                    <Td><NoteButton rowKey={key} note={row.note} open={Boolean(openNotes[key])} onClick={() => toggleNote(key)} compact /></Td>
                    {activeDay === "lotte" ? <Td>{row.annual_pass_count ?? "-"}</Td> : null}
                    <Td>{formatKoreanDateTime(row.updated_at)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({ label, value, danger = false, warning = false, success = false }: { label: string; value: number | string; danger?: boolean; warning?: boolean; success?: boolean }) {
  const valueClass = danger ? "text-danger" : warning ? "text-[#8a4b05]" : success ? "text-quizlet-violet" : "text-stormcloud-ink";
  return (
    <div className="card py-4">
      <p className="text-[12px] font-semibold text-slate-text">{label}</p>
      <p className={`mt-1 font-mono text-[22px] font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function MobileMetric({ label, value, danger = false }: { label: string; value: number | string; danger?: boolean }) {
  return (
    <div className="rounded bg-page-background p-3 shadow-subtle">
      <p className="text-[12px] font-semibold text-slate-text">{label}</p>
      <p className={danger ? "mt-1 font-mono text-[22px] font-bold text-danger" : "mt-1 font-mono text-[22px] font-bold text-stormcloud-ink"}>{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded bg-page-background p-3 shadow-subtle">
      <p className="text-[12px] font-semibold text-slate-text">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-stormcloud-ink">{value}</p>
    </div>
  );
}

function NoteButton({ note, open, onClick, compact = false }: { rowKey: string; note: string | null; open: boolean; onClick: () => void; compact?: boolean }) {
  return (
    <div>
      <button type="button" onClick={onClick} className="text-sm font-semibold text-quizlet-violet hover:text-night-violet">
        {open ? "비고 숨기기" : "비고 보기"}
      </button>
      {open ? (
        <div className={`${compact ? "mt-2 max-w-xs" : "mt-3"} whitespace-pre-wrap break-words rounded bg-page-background p-3 text-sm font-normal leading-relaxed text-slate-text shadow-subtle`}>
          {note || "비고 없음"}
        </div>
      ) : null}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3">{children}</th>;
}

function Td({ children, strong = false, danger = false }: { children: React.ReactNode; strong?: boolean; danger?: boolean }) {
  return <td className={`whitespace-nowrap px-4 py-3 font-semibold ${strong ? "text-stormcloud-ink" : "text-deep-slate"} ${danger ? "text-danger" : ""}`}>{children}</td>;
}
