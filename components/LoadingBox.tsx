export function LoadingBox({ text = "불러오는 중입니다." }: { text?: string }) {
  return <div className="card py-8 text-center text-[14px] font-normal text-slate-text">{text}</div>;
}
