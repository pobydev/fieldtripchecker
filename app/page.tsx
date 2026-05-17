import Link from "next/link";
import { ClipboardList, Music, ShieldCheck } from "lucide-react";

const trips = [
  {
    href: "/trip/lotte",
    title: "롯데월드",
    description: "1일차 참여 현황 입력",
    icon: ClipboardList,
  },
  {
    href: "/trip/nanta",
    title: "난타공연",
    description: "2일차 참여 현황 입력",
    icon: Music,
  },
];

export default function HomePage() {
  return (
    <main className="page-shell flex min-h-screen flex-col justify-center">
      <section className="mx-auto w-full max-w-2xl space-y-6">
        <div className="card p-7 sm:p-10">
          <p className="text-[14px] font-bold text-quizlet-violet">2학년 현장체험학습</p>
          <h1 className="mt-3 text-[36px] font-bold leading-[1.25] text-stormcloud-ink sm:text-[44px]">
            2026학년도 2학년 현장체험학습 참여 현황
          </h1>
          <p className="mt-4 text-[16px] font-normal leading-6 text-slate-text">
            일정을 선택한 뒤 본인 반의 참여 현황을 입력해 주세요.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {trips.map((trip) => {
            const Icon = trip.icon;
            return (
              <Link key={trip.href} href={trip.href} className="card group p-5 transition hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-study text-deep-slate shadow-subtle">
                    <Icon size={24} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-[24px] font-bold leading-[1.33] text-stormcloud-ink">{trip.title}</h2>
                    <p className="mt-1 text-[14px] font-normal text-slate-text">{trip.description}</p>
                  </div>
                </div>
                <span className="primary-button mt-5 w-full">선택하기</span>
              </Link>
            );
          })}
        </div>

        <div className="text-center">
          <Link href="/admin" className="secondary-button">
            <ShieldCheck size={18} aria-hidden />
            관리자 화면
          </Link>
        </div>
      </section>
    </main>
  );
}
