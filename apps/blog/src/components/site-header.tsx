"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

function getBackHref(pathname: string) {
  if (pathname.startsWith("/posts/")) return "/";
  if (pathname.startsWith("/drafts/")) return "/drafts";
  return null;
}

export function SiteHeader() {
  const pathname = usePathname();
  const backHref = getBackHref(pathname);

  return (
    <header className="mb-12 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="목록으로 돌아가기"
            className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
        ) : null}
        <Link href="/" className="text-sm font-medium">
          권중운
        </Link>
      </div>
      <div className="flex items-center gap-1">
        <a
          href="https://jungwoonkwon.com"
          target="_blank"
          rel="noreferrer"
          className="text-muted-foreground hover:text-foreground inline-flex h-9 items-center rounded-md px-2 text-sm transition-colors"
        >
          Portfolio
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
