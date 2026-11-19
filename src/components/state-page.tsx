import type { ReactNode } from "react";
import { SiteCredit } from "@/components/site-credit";

/**
 * The layout shared by pages that stand in for a missing one (not found,
 * offline): an illustration made from the journal's own pieces beside the
 * explanation and the ways out.
 */
export function StatePage({
  sheet,
  title,
  illustration,
  children,
  actions,
}: {
  sheet: string;
  title: string;
  illustration: ReactNode;
  /** One or two sentences saying what happened. */
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <main
      data-sheet={sheet}
      className="sheet flex min-h-svh flex-col overflow-hidden px-5 py-10 sm:px-8 sm:py-14"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-12 md:flex-row md:gap-16">
        <div className="flex shrink-0 justify-center pt-6 md:w-[42%] md:pt-0">
          {illustration}
        </div>
        <div className="max-w-md text-center md:text-left">
          <h1 className="font-display text-[clamp(2.4rem,7vw,4.25rem)] leading-[0.98] text-ink">
            {title}
          </h1>
          <div className="mt-5 text-lg leading-relaxed text-ink">
            {children}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-start">
            {actions}
          </div>
        </div>
      </div>
      <SiteCredit
        className="pt-10 text-center text-ink-soft"
        heartClassName="text-tomato"
      />
    </main>
  );
}

export const stateButton =
  "inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-base font-semibold text-paper transition-transform duration-200 ease-out-expo hover:scale-[1.04] active:scale-[0.97]";

export const stateLink =
  "inline-flex min-h-11 items-center text-base font-semibold text-ink underline";
