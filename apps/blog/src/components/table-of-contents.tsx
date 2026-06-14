"use client";

import { type MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@repo/ui/utils";
import type { TableOfContentsItem } from "@/lib/toc";

function getEncodedHash(id: string) {
  return `#${encodeURIComponent(id)}`;
}

function scrollToPosition(top: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, top);
    return;
  }

  const start = window.scrollY;
  const distance = top - start;
  const duration = 260;
  const startTime = window.performance.now();

  const step = (currentTime: number) => {
    const elapsed = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);

    window.scrollTo(0, start + distance * eased);

    if (elapsed < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

export function TableOfContents({ items }: { items: TableOfContentsItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const mobileDockRef = useRef<HTMLElement | null>(null);
  const mobileDockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (items.length === 0) return;

    const updateActiveHeading = () => {
      const headings = items
        .map((item) => document.getElementById(item.id))
        .filter((heading): heading is HTMLElement => heading !== null);

      if (headings.length === 0) return;

      const offset = window.scrollY + 144;
      let activeHeading = headings[0];

      for (const heading of headings) {
        if (heading.offsetTop > offset) break;
        activeHeading = heading;
      }

      setActiveId(activeHeading.id);
    };

    updateActiveHeading();
    window.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);

    return () => {
      window.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
    };
  }, [items]);

  useEffect(() => {
    return () => {
      if (mobileDockTimerRef.current) {
        clearTimeout(mobileDockTimerRef.current);
      }
    };
  }, []);

  const activateMobileDock = useCallback(() => {
    if (mobileDockTimerRef.current) {
      clearTimeout(mobileDockTimerRef.current);
    }

    mobileDockRef.current?.setAttribute("data-active", "true");
    mobileDockTimerRef.current = setTimeout(() => {
      mobileDockRef.current?.removeAttribute("data-active");
    }, 1100);
  }, []);

  useEffect(() => {
    const dock = mobileDockRef.current;
    if (!dock) return;

    dock.addEventListener("click", activateMobileDock);
    dock.addEventListener("focusin", activateMobileDock);
    dock.addEventListener("pointerdown", activateMobileDock);
    dock.addEventListener("touchstart", activateMobileDock, { passive: true });

    return () => {
      dock.removeEventListener("click", activateMobileDock);
      dock.removeEventListener("focusin", activateMobileDock);
      dock.removeEventListener("pointerdown", activateMobileDock);
      dock.removeEventListener("touchstart", activateMobileDock);
    };
  }, [activateMobileDock]);

  const handleHeadingClick = (event: MouseEvent<HTMLAnchorElement>, item: TableOfContentsItem) => {
    const heading = document.getElementById(item.id);
    if (!heading) return;

    event.preventDefault();
    activateMobileDock();
    window.history.pushState(null, "", getEncodedHash(item.id));
    scrollToPosition(Math.max(0, heading.getBoundingClientRect().top + window.scrollY - 32));
    setActiveId(item.id);
  };

  const handleTopClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    activateMobileDock();
    window.history.pushState(null, "", window.location.pathname + window.location.search);
    scrollToPosition(0);
  };

  if (items.length < 2) return null;

  return (
    <>
      <nav
        aria-label="목차"
        className="not-prose fixed left-1/2 top-28 z-30 hidden w-56 translate-x-[24rem] rounded-lg border border-black/10 bg-white/95 px-5 py-5 shadow-sm backdrop-blur xl:block dark:border-white/15 dark:bg-zinc-950/90"
      >
        <p className="text-sm font-semibold leading-6 text-black dark:text-white">목차</p>
        <ol className="mt-4 space-y-1">
          {items.map((item) => {
            const isActive = activeId === item.id;

            return (
              <li key={item.id}>
                <a
                  href={getEncodedHash(item.id)}
                  onClick={(event) => handleHeadingClick(event, item)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "block border-l py-1.5 text-sm leading-6 transition-colors",
                    item.level === 2 && "pl-3",
                    item.level === 3 && "pl-5 text-[13px]",
                    item.level === 4 && "pl-7 text-xs",
                    isActive
                      ? "border-black font-medium text-black dark:border-white dark:text-white"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-500 hover:text-black dark:border-zinc-800 dark:text-zinc-500 dark:hover:border-zinc-400 dark:hover:text-white",
                  )}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ol>
        <div className="mt-5 border-t border-black/10 pt-4 dark:border-white/15">
          <a
            href="#"
            onClick={handleTopClick}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-black transition-colors hover:text-zinc-600 dark:text-white dark:hover:text-zinc-300"
          >
            <ArrowUp className="size-4" aria-hidden />
            Top
          </a>
        </div>
      </nav>

      <nav
        aria-label="모바일 목차"
        ref={mobileDockRef}
        className={cn(
          "mobile-toc-dock not-prose fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-3 z-30 flex max-h-[58vh] flex-col items-center gap-0.5 overflow-y-auto rounded-full border border-black/10 bg-white/65 px-1 py-2 opacity-45 shadow-sm backdrop-blur transition-opacity duration-300 hover:opacity-100 data-[active=true]:opacity-100 xl:hidden dark:border-white/15 dark:bg-zinc-950/65",
        )}
      >
        {items.map((item, index) => {
          const isActive = activeId === item.id;

          return (
            <a
              key={item.id}
              href={getEncodedHash(item.id)}
              onClick={(event) => handleHeadingClick(event, item)}
              aria-current={isActive ? "true" : undefined}
              aria-label={item.text}
              title={item.text}
              className={cn(
                "flex size-7 items-center justify-center rounded-full transition-colors",
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white",
              )}
            >
              <span
                className={cn(
                  "rounded-full bg-current transition-all",
                  isActive ? "h-3 w-3" : "h-1.5 w-1.5",
                  item.level === 3 && !isActive && "h-1.5 w-1.5 opacity-80",
                  item.level === 4 && !isActive && "h-1 w-1 opacity-70",
                )}
              />
              <span className="sr-only">{index + 1}. {item.text}</span>
            </a>
          );
        })}
        <div className="my-1 h-px w-5 bg-black/10 dark:bg-white/15" />
        <a
          href="#"
          onClick={handleTopClick}
          aria-label="맨 위로"
          title="Top"
          className="flex size-7 items-center justify-center rounded-full text-black transition-colors hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-900"
        >
          <ArrowUp className="size-3.5" aria-hidden />
        </a>
      </nav>
    </>
  );
}
