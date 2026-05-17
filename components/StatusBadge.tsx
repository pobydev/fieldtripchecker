import { getStatusKind } from "@/lib/trip";

export function StatusBadge({ submitted, finalized }: { submitted: boolean; finalized: boolean }) {
  const kind = getStatusKind({ is_submitted: submitted, is_finalized: finalized });

  if (kind === "finalized") {
    return <span className="status-badge bg-[rgba(66,85,255,0.12)] text-quizlet-violet">최종 완료</span>;
  }

  if (kind === "draft") {
    return <span className="status-badge bg-practice-orange/45 text-[#8a4b05]">임시 저장</span>;
  }

  return <span className="status-badge bg-page-background text-slate-text">미입력</span>;
}
