"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { LoadingBox } from "@/components/LoadingBox";
import { PageHeader } from "@/components/Header";
import { countAbsentNumbers, formatKoreanDateTime, TRIPS } from "@/lib/trip";
import type { DayKey, FieldTripStatus } from "@/lib/types";

type FormState = {
  enrolledCount: string;
  participantCount: string;
  absentCount: string;
  absentNumbers: string;
  note: string;
  hasNote: boolean;
  annualPassCount: string;
  isFinalized: boolean;
};

const emptyForm: FormState = {
  enrolledCount: "",
  participantCount: "",
  absentCount: "",
  absentNumbers: "",
  note: "",
  hasNote: false,
  annualPassCount: "",
  isFinalized: false,
};

function toNumber(value: string) {
  return value === "" ? 0 : Number(value);
}

export function ClassInputPage({ dayKey, classNo }: { dayKey: DayKey; classNo: number }) {
  const router = useRouter();
  const trip = TRIPS[dayKey];
  const [form, setForm] = useState<FormState>(emptyForm);
  const [row, setRow] = useState<FieldTripStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      const response = await fetch(`/api/status?day=${dayKey}&classNo=${classNo}`, { cache: "no-store" });
      const result = await response.json();
      if (ignore) return;
      if (!response.ok) {
        setError(result.error ?? "현황을 불러오지 못했습니다.");
      } else {
        const loaded = (result.data?.[0] ?? null) as FieldTripStatus | null;
        setRow(loaded);
        setForm({
          enrolledCount: loaded?.enrolled_count?.toString() ?? "",
          participantCount: loaded?.participant_count?.toString() ?? "",
          absentCount: loaded?.absent_count?.toString() ?? "",
          absentNumbers: loaded?.absent_numbers ?? "",
          note: loaded?.note ?? "",
          hasNote: Boolean(loaded?.note),
          annualPassCount: loaded?.annual_pass_count?.toString() ?? "",
          isFinalized: loaded?.is_finalized ?? false,
        });
      }
      setLoading(false);
    }

    load();
    return () => {
      ignore = true;
    };
  }, [classNo, dayKey]);

  const validation = useMemo(() => {
    const enrolled = toNumber(form.enrolledCount);
    const participant = toNumber(form.participantCount);
    const absent = toNumber(form.absentCount);
    const annual = toNumber(form.annualPassCount);
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [label, value] of [
      ["재적학생수", form.enrolledCount],
      ["참여학생수", form.participantCount],
      ["불참학생수", form.absentCount],
      ["연간이용권 소지자수", form.annualPassCount],
    ] as const) {
      if (value && (!/^\d+$/.test(value) || Number(value) < 0)) {
        errors.push(`${label}는 0 이상의 숫자만 입력할 수 있습니다.`);
      }
    }

    if (participant > enrolled) errors.push("참여학생수는 재적학생수보다 클 수 없습니다.");
    if (absent > enrolled) errors.push("불참학생수는 재적학생수보다 클 수 없습니다.");
    if (dayKey === "lotte" && annual > participant) {
      errors.push("연간이용권 소지자수는 참여학생수보다 클 수 없습니다.");
    }
    if (form.enrolledCount && enrolled !== participant + absent) {
      warnings.push("재적학생수와 참여학생수+불참학생수가 일치하지 않습니다.");
    }
    if (countAbsentNumbers(form.absentNumbers) !== absent) {
      warnings.push("입력한 불참학생 번호 개수와 불참학생수가 다를 수 있습니다.");
    }

    return { errors, warnings };
  }, [dayKey, form]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSuccess("");
    setError("");
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    if (validation.errors.length > 0) {
      setError(validation.errors[0]);
      return;
    }

    const warningText = validation.warnings.length > 0 ? `\n\n${validation.warnings.join("\n")}\n\n그래도 저장하시겠습니까?` : "";
    const confirmMessage = form.isFinalized ? "최종 완료로 저장하시겠습니까?" : "현황을 임시 저장하시겠습니까?";
    if (!window.confirm(`${confirmMessage}${warningText}`)) return;

    setSaving(true);
    const response = await fetch("/api/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dayKey,
        classNo,
        enrolledCount: toNumber(form.enrolledCount),
        participantCount: toNumber(form.participantCount),
        absentCount: toNumber(form.absentCount),
        absentNumbers: form.absentNumbers,
        note: form.hasNote ? form.note : null,
        annualPassCount: dayKey === "lotte" ? toNumber(form.annualPassCount) : null,
        isFinalized: form.isFinalized,
      }),
    });
    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(result.error ?? "저장하지 못했습니다.");
      return;
    }

    setRow(result.data);
    setSuccess(form.isFinalized ? "최종 완료로 저장되었습니다." : "임시 저장되었습니다.");
    if (form.isFinalized) {
      router.push(`/trip/${dayKey}`);
    }
  }

  if (!Number.isInteger(classNo) || classNo < 1 || classNo > 12) {
    return (
      <main className="page-shell">
        <PageHeader title="반 정보가 올바르지 않습니다." />
      </main>
    );
  }

  return (
    <main className="page-shell max-w-3xl">
      <PageHeader
        title={`${trip.name} / 2학년 ${classNo}반`}
        backHref={`/trip/${dayKey}`}
        description={row?.updated_at ? `최근 저장: ${formatKoreanDateTime(row.updated_at)}` : "아직 저장된 현황이 없습니다."}
      />

      {loading ? <LoadingBox /> : null}

      <section className="card space-y-5 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField label="재적학생수" value={form.enrolledCount} onChange={(value) => updateField("enrolledCount", value)} />
          <NumberField label="참여학생수" value={form.participantCount} onChange={(value) => updateField("participantCount", value)} />
          <NumberField label="불참학생수" value={form.absentCount} onChange={(value) => updateField("absentCount", value)} />
        </div>

        <TextField label="불참학생 번호" value={form.absentNumbers} onChange={(value) => updateField("absentNumbers", value)} placeholder="예: 3, 7, 15" />

        {dayKey === "lotte" ? (
          <NumberField label="연간이용권 소지자수" value={form.annualPassCount} onChange={(value) => updateField("annualPassCount", value)} />
        ) : null}

        <TogglePanel
          checked={form.hasNote}
          onChange={(checked) => updateField("hasNote", checked)}
          title="비고 입력"
          description="특이사항이 있을 때만 입력합니다."
        >
          <textarea
            className="min-h-28 w-full resize-y rounded border border-ash-border bg-white px-4 py-3 text-base font-semibold text-stormcloud-ink outline-none transition placeholder:text-light-slate focus:border-quizlet-violet focus:ring-4 focus:ring-[rgba(66,85,255,0.16)]"
            value={form.note}
            onChange={(event) => updateField("note", event.target.value)}
            placeholder="필요한 경우에만 입력"
          />
        </TogglePanel>

        <TogglePanel
          checked={form.isFinalized}
          onChange={(checked) => updateField("isFinalized", checked)}
          title="최종 확인 완료"
          description="체크하지 않으면 임시 저장으로 표시됩니다."
        />

        {validation.warnings.length > 0 ? (
          <div className="rounded border border-practice-orange bg-practice-orange/35 p-3 text-sm font-semibold text-[#8a4b05]">
            {validation.warnings.map((warning) => (
              <p key={warning}>주의: {warning}</p>
            ))}
          </div>
        ) : null}

        {error ? <Message type="error" text={error} /> : null}
        {success ? <Message type="success" text={success} /> : null}

        <button type="button" onClick={handleSave} disabled={saving || loading} className="filled-button w-full text-base">
          <Save size={20} aria-hidden />
          {saving ? "저장 중" : form.isFinalized ? "최종 완료로 저장" : "임시 저장"}
        </button>
        <div className="grid gap-2 sm:grid-cols-2">
          <Link href={`/trip/${dayKey}`} className="secondary-button">
            반 선택 화면으로
          </Link>
          <Link href="/" className="secondary-button">
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-2">
      <span className="label-text">{label}</span>
      <input className="input-field font-mono text-[22px] tracking-[-0.99px]" inputMode="numeric" pattern="[0-9]*" min={0} type="number" value={value} onChange={(event) => onChange(event.target.value)} placeholder="0" />
    </label>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block space-y-2">
      <span className="label-text">{label}</span>
      <input className="input-field text-base" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function TogglePanel({
  checked,
  onChange,
  title,
  description,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-page-background p-4 shadow-subtle">
      <label className="flex items-start gap-3">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-5 w-5 accent-quizlet-violet" />
        <span>
          <span className="block text-base font-bold text-stormcloud-ink">{title}</span>
          <span className="mt-0.5 block text-sm font-normal text-slate-text">{description}</span>
        </span>
      </label>
      {checked && children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

function Message({ type, text }: { type: "error" | "success"; text: string }) {
  const Icon = type === "error" ? AlertCircle : CheckCircle2;
  const className =
    type === "error"
      ? "border-[rgba(242,96,82,0.35)] bg-[rgba(242,96,82,0.08)] text-danger"
      : "border-[rgba(66,85,255,0.22)] bg-[rgba(66,85,255,0.08)] text-quizlet-violet";
  return (
    <div className={`flex items-center gap-2 rounded border p-3 text-sm font-semibold ${className}`}>
      <Icon size={18} aria-hidden />
      {text}
    </div>
  );
}
