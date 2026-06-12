import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { getAllDrafts } from "@/lib/drafts";

export const metadata = {
  title: "Draft Preview",
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}

export default function DraftsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const drafts = getAllDrafts();

  return (
    <main>
      <header className="mb-10 space-y-2">
        <div className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          Local preview only
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Draft Preview</h1>
          <p className="text-muted-foreground mt-2 text-sm">발행 전 MDX 컴포넌트와 draft 이미지를 확인한다.</p>
        </div>
      </header>

      {drafts.length > 0 ? (
        <ul className="border-y">
          {drafts.map((draft, index) => (
            <li key={draft.slug} className={index > 0 ? "border-t" : undefined}>
              <Link href={`/drafts/${draft.slug}`} className="group flex gap-4 py-4">
                <div className="relative h-[70px] w-[104px] flex-none overflow-hidden rounded-md border">
                  <Image
                    src={draft.cover}
                    alt=""
                    fill
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="104px"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-medium leading-snug">
                    <span className="relative inline-block">
                      {draft.title}
                      <span
                        aria-hidden
                        className="bg-current absolute -bottom-0.5 left-0 h-0.5 w-0 transition-[width] duration-300 ease-out group-hover:w-full motion-reduce:transition-none"
                      />
                    </span>
                  </h2>
                  <p className="text-muted-foreground mt-1 truncate text-[13px] leading-relaxed">
                    {draft.description}
                  </p>
                  <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
                    <span>{formatDate(draft.date)}</span>
                    <span aria-hidden>·</span>
                    <span>{draft.readingMinutes}분 읽기</span>
                    {draft.draftLength ? (
                      <>
                        <span aria-hidden>·</span>
                        <span>{draft.draftLength}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-muted-foreground flex items-center gap-2 rounded-lg border p-4 text-sm">
          <FileText className="size-4" aria-hidden />
          <span>미리보기할 draft가 없다.</span>
        </div>
      )}
    </main>
  );
}
