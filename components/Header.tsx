import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";

export function PageHeader({
  title,
  description,
  backHref,
}: {
  title: string;
  description?: string;
  backHref?: string;
}) {
  return (
    <header className="mb-6 border-b border-ash-border pb-5">
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/" className="secondary-button min-h-10 px-3 py-2 text-sm">
          <Home size={17} aria-hidden />
          홈
        </Link>
        {backHref ? (
          <Link href={backHref} className="secondary-button min-h-10 px-3 py-2 text-sm">
            <ChevronLeft size={17} aria-hidden />
            반 선택
          </Link>
        ) : null}
      </div>
      <h1 className="text-[32px] font-bold leading-[1.27] text-stormcloud-ink sm:text-[44px]">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-[16px] font-normal leading-6 text-slate-text">{description}</p> : null}
    </header>
  );
}
