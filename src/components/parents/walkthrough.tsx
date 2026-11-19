"use client";

import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Link2,
  LockKeyhole,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { BookCover } from "@/components/journal/book-cover";
import { Cassette } from "@/components/journal/mixtape";
import {
  MilestoneCard,
  NoteSlip,
  PrintFrame,
} from "@/components/journal/pieces";
import { Sticker } from "@/components/journal/stickers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Child } from "@/lib/types";
import { cn } from "@/lib/utils";

const SEEN_KEY = "journal:desk-walkthrough-seen";

// The "seen" flag lives in localStorage, read as an external store so the
// server render and the first client render agree (both say "seen").
const subscribe = () => () => undefined;
const readSeen = () => {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
};

type Step = { title: string; body: string; sheet: string; picture: ReactNode };

function steps(options: Child[]): Step[] {
  const photo = options.find((child) => child.coverPhoto)?.coverPhoto ?? null;
  return [
    {
      title: "Every child has their own book",
      body: 'Start by choosing whose journal you\'re adding to. "New journal" starts a book for another child, with their own cover colour.',
      sheet: "butter",
      picture:
        options.length > 0 ? (
          <div className="flex items-center justify-center gap-5">
            {options.slice(0, 2).map((child, i) => (
              <div
                key={child.id}
                className={cn(
                  "aspect-[3/4] w-24 overflow-hidden rounded-l-[3px] rounded-r-lg shadow-print",
                  i === 0 ? "-rotate-3" : "rotate-2",
                )}
              >
                <BookCover child={child} sizes="96px" />
              </div>
            ))}
          </div>
        ) : (
          <Sticker name="star" className="w-24 -rotate-6" />
        ),
    },
    {
      title: "Four things you can stick in",
      body: "A photo or video, a first (first smile, first steps), a written note, or a song from YouTube or Spotify. Use the tabs to switch between them.",
      sheet: "sky",
      picture: (
        <div className="flex shrink-0 scale-[0.62] items-center justify-center gap-2.5 sm:scale-100">
          <PrintFrame caption="Tiny toes" className="w-24 shrink-0 -rotate-3">
            {photo ? (
              <div className="relative aspect-square">
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center">
                <Sticker name="sun" className="w-14" />
              </div>
            )}
          </PrintFrame>
          <MilestoneCard
            title="First smile"
            date="Apr 14"
            age="10 wks"
            tone="leaf"
            className="w-32 shrink-0 rotate-2"
          />
          <div className="ruled w-28 shrink-0 -rotate-2 bg-paper px-3 pb-2 pt-[2.15rem] font-hand text-[1.1rem] leading-[1.75rem] text-ink shadow-print">
            You wave at buses now.
          </div>
          <div className="w-24 shrink-0 rotate-3">
            <Cassette title="Our song" provider="Spotify" tone="tomato" />
          </div>
        </div>
      ),
    },
    {
      title: "See it before it goes in",
      body: "As you type, a preview shows the entry exactly as it will look on the page, on the paper colour of its chapter. Change anything and the preview follows.",
      sheet: "rose",
      picture: (
        <NoteSlip
          body="You wave at buses now. Every single one."
          author="Mum"
          date="10 November"
          className="w-64 -rotate-1"
        />
      ),
    },
    {
      title: "The date decides the chapter",
      body: "Journals are read by age, not by upload order. Set when it happened and the entry lands in the right month, even if you add it weeks later.",
      sheet: "mint",
      picture: (
        <div className="text-center text-ink">
          <p className="font-display text-4xl leading-none">Two months</p>
          <ol className="mt-4 flex justify-center gap-2" aria-hidden="true">
            {[
              ["New", "butter"],
              ["1 mo", "rose"],
              ["2 mo", "mint"],
              ["3 mo", "lilac"],
            ].map(([label, sheet]) => (
              <li
                key={label}
                data-sheet={sheet}
                className={cn(
                  "rounded-full border-2 border-ink bg-sheet px-3 py-1.5 text-sm font-semibold",
                  label === "2 mo" && "bg-ink text-paper",
                )}
              >
                {label}
              </li>
            ))}
          </ol>
        </div>
      ),
    },
    {
      title: "Share the link, keep the passcode",
      body: 'Anyone with a journal\'s link can read it. Only people with the parent passcode can add. To change an entry, remove it under "Recently added" and add it again.',
      sheet: "lilac",
      picture: (
        <div className="flex flex-col items-center gap-3 text-ink">
          <p className="inline-flex -rotate-2 items-center gap-2 bg-paper px-4 py-2.5 text-base font-semibold shadow-print">
            <Link2 aria-hidden="true" className="size-5" strokeWidth={2.25} />
            Anyone with the link can read
          </p>
          <p className="inline-flex rotate-1 items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-base font-semibold text-paper shadow-print">
            <LockKeyhole
              aria-hidden="true"
              className="size-5"
              strokeWidth={2.25}
            />
            Only parents can add
          </p>
        </div>
      ),
    },
  ];
}

/**
 * A five-step tour of the parents' desk. Opens by itself the first time a
 * parent arrives, and again from the "How this works" button.
 */
export function Walkthrough({ options }: { options: Child[] }) {
  const seen = useSyncExternalStore(subscribe, readSeen, () => true);
  // null means "follow the stored flag"; a boolean is the parent's own choice this visit.
  const [choice, setChoice] = useState<boolean | null>(null);
  const [[at, direction], setAt] = useState<[number, 1 | -1]>([0, 1]);
  const open = choice ?? !seen;
  const nextButton = useRef<HTMLButtonElement>(null);
  const all = steps(options);
  const step = all[at];
  const last = at === all.length - 1;

  function close() {
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* Private browsing: the tour simply shows again next visit. */
    }
    setChoice(false);
  }

  function start() {
    setAt([0, 1]);
    setChoice(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-ink underline decoration-ink/40 hover:decoration-ink sm:px-4"
      >
        <CircleHelp aria-hidden="true" className="size-4" strokeWidth={2.25} />
        How this works
      </button>

      <Dialog open={open} onOpenChange={(next) => (next ? start() : close())}>
        <DialogContent
          initialFocus={nextButton}
          className="gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-lg"
        >
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <m.div
                key={at}
                custom={direction}
                variants={{
                  // Steps slide past like pages, fully visible the whole way.
                  enter: (d: number) => ({ x: `${d * 100}%` }),
                  rest: { x: 0 },
                  leave: (d: number) => ({ x: `${d * -100}%` }),
                }}
                initial="enter"
                animate="rest"
                exit="leave"
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  data-sheet={step.sheet}
                  className="sheet flex h-56 items-center justify-center overflow-hidden px-6"
                >
                  {step.picture}
                </div>
                <div className="px-6 pt-6 sm:px-8">
                  <DialogTitle className="font-display text-[1.75rem] leading-[1.05] text-ink">
                    {step.title}
                  </DialogTitle>
                  <DialogDescription className="mt-3 min-h-[6.5rem] text-base leading-relaxed text-ink">
                    {step.body}
                  </DialogDescription>
                </div>
              </m.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-4 px-6 pb-6 pt-2 sm:px-8">
            <p
              className="text-sm font-semibold text-ink-soft"
              aria-live="polite"
            >
              {at + 1} of {all.length}
            </p>
            <div className="flex items-center gap-2">
              {at > 0 ? (
                <button
                  type="button"
                  onClick={() => setAt([at - 1, -1])}
                  aria-label="Previous step"
                  className="inline-flex size-11 items-center justify-center rounded-full border-2 border-ink text-ink"
                >
                  <ArrowLeft
                    aria-hidden="true"
                    className="size-5"
                    strokeWidth={2.5}
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-base font-semibold text-ink underline decoration-ink/40"
                >
                  Skip
                </button>
              )}
              <button
                ref={nextButton}
                type="button"
                onClick={() => (last ? close() : setAt([at + 1, 1]))}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-6 text-base font-semibold text-paper transition-transform duration-150 ease-out-expo hover:scale-[1.03] active:scale-[0.97]"
              >
                {last ? "Start adding" : "Next"}
                {last ? null : (
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
