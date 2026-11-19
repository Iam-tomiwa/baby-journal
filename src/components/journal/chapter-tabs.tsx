"use client";

import { BookOpen } from "lucide-react";
import { useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TabLink = {
  id: string;
  label: string;
  title: string;
  sheet: string;
};

/**
 * The index tabs that stick out of the book: down the right edge on wide
 * screens, along the bottom on phones and tablets. They appear once the cover is open.
 */
export function ChapterTabs({ tabs }: { tabs: TabLink[] }) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const strip = useRef<HTMLOListElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > window.innerHeight * 1.05;
    setShown((current) => (current === next ? current : next));
  });

  useEffect(() => {
    const sections = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter((el): el is HTMLElement => el !== null);
    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        // Nothing in the band (the cover, the footer) means no chapter is open.
        setActive(tabs.findLast((tab) => inBand.has(tab.id))?.id ?? null);
      },
      // A thin band across the middle of the viewport decides which chapter is "open".
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [tabs]);

  // Keep the active tab in view on the phone strip.
  useEffect(() => {
    const current = strip.current?.querySelector<HTMLElement>(
      '[aria-current="true"]',
    );
    current?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: "smooth",
    });
  }, [active]);

  return (
    <nav
      aria-label="Chapters"
      inert={!shown}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 bg-ink transition-transform duration-300 ease-out-expo lg:inset-x-auto lg:bottom-auto lg:right-0 lg:top-[45%] lg:-translate-y-1/2 lg:bg-transparent",
        shown
          ? "translate-y-0 lg:translate-x-0"
          : "translate-y-full lg:translate-x-full",
      )}
    >
      <ol
        ref={strip}
        className="flex items-center gap-2 overflow-x-auto px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] [scrollbar-width:none] lg:max-h-[68svh] lg:flex-col lg:items-end lg:gap-1.5 lg:overflow-y-auto lg:p-0 lg:py-1 lg:pl-4"
      >
        <li className="lg:hidden">
          <Link
            href="/"
            aria-label="All journals"
            className="inline-flex size-11 items-center justify-center rounded-full bg-paper text-ink"
          >
            <BookOpen
              aria-hidden="true"
              className="size-5"
              strokeWidth={2.25}
            />
          </Link>
        </li>
        {tabs.map((tab) => {
          const current = tab.id === active;
          return (
            <li key={tab.id} className="shrink-0">
              <a
                href={`#${tab.id}`}
                data-sheet={tab.sheet}
                aria-current={current ? "true" : undefined}
                title={tab.title}
                className={cn(
                  "inline-flex min-h-11 items-center whitespace-nowrap rounded-full border-2 border-ink bg-sheet px-4 text-sm font-semibold text-ink transition-[padding,background-color,color] duration-200 ease-out-expo",
                  "lg:min-h-10 lg:rounded-r-none lg:border-r-0 lg:pr-5 lg:shadow-print",
                  tab.sheet === "album" && "border-butter text-butter",
                  current
                    ? "max-lg:ring-2 max-lg:ring-paper lg:bg-ink lg:pl-9 lg:text-paper"
                    : "lg:hover:pl-6",
                )}
              >
                {tab.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
