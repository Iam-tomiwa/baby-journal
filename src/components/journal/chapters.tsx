"use client";

import { Music, Play } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useMemo, useState } from "react";
import { SETTLE } from "@/components/motion-provider";
import type { Chapter, Placed } from "@/lib/chapters";
import type { StickerName } from "@/lib/palette";
import { isLandscape, posterSrc } from "@/lib/media";
import { cn } from "@/lib/utils";
import { Lightbox } from "./lightbox";
import { MilestoneCard, NoteSlip, PrintFrame } from "./pieces";
import { Sticker } from "./stickers";

/**
 * How much room an entry takes on the 2 / 6 / 12 column page. A sheet with only
 * one or two things on it gives them more room, the way you would by hand.
 */
function slot(
  item: Placed,
  count: number,
  mate?: Placed,
): { span: string; mid: number; wide: number; sizes: string } {
  const roomy = count <= 2;
  if (item.kind === "milestone") {
    return roomy
      ? {
          span: "col-span-1 md:col-span-2 lg:col-span-4",
          mid: 2,
          wide: 4,
          sizes: "",
        }
      : {
          span: "col-span-1 md:col-span-3 lg:col-span-3",
          mid: 3,
          wide: 3,
          sizes: "",
        };
  }
  if (item.kind === "note" || !item.media) {
    // On a tablet a note sits beside a portrait print, or steps to the right under a landscape one.
    const underLandscape = mate?.media ? isLandscape(mate.media) : false;
    return roomy
      ? {
          span: underLandscape
            ? "col-span-2 md:col-span-4 md:col-start-3 lg:col-span-6 lg:col-start-auto"
            : "col-span-2 md:col-span-3 lg:col-span-6",
          mid: underLandscape ? 6 : 3,
          wide: 6,
          sizes: "",
        }
      : {
          span: "col-span-2 md:col-span-4 lg:col-span-4",
          mid: 4,
          wide: 4,
          sizes: "",
        };
  }
  if (isLandscape(item.media)) {
    return roomy
      ? {
          span:
            mate?.kind === "milestone"
              ? "col-span-2 md:col-span-4 lg:col-span-7"
              : "col-span-2 md:col-span-6 lg:col-span-7",
          mid: mate?.kind === "milestone" ? 4 : 6,
          wide: 7,
          sizes: "(min-width: 1024px) 640px, (min-width: 768px) 78vw, 92vw",
        }
      : {
          span: "col-span-2 md:col-span-6 lg:col-span-5",
          mid: 6,
          wide: 5,
          sizes: "(min-width: 1024px) 440px, 92vw",
        };
  }
  return roomy
    ? {
        span: "col-span-2 mx-auto w-[78%] md:col-span-3 md:w-full lg:col-span-4",
        mid: 3,
        wide: 4,
        sizes: "(min-width: 1024px) 370px, (min-width: 768px) 46vw, 72vw",
      }
    : {
        span: "col-span-1 md:col-span-3 lg:col-span-3",
        mid: 3,
        wide: 3,
        sizes: "(min-width: 1024px) 270px, (min-width: 768px) 45vw, 45vw",
      };
}

/** Where a short row starts on the 12-column page. Listed in full so Tailwind can see each class. */
const START = [
  "",
  "",
  "lg:col-start-2",
  "lg:col-start-3",
  "lg:col-start-4",
  "lg:col-start-5",
  "lg:col-start-6",
  "lg:col-start-7",
  "lg:col-start-8",
  "lg:col-start-9",
  "lg:col-start-10",
];

const START_MID = [
  "",
  "",
  "md:col-start-2",
  "md:col-start-3",
  "md:col-start-4",
  "md:col-start-5",
];

/** A sheet with only a few things on it alternates sides, the way a hand-filled album does. */
function firstColumn(items: Placed[], sheetIndex: number): string {
  if (sheetIndex % 2 === 0) return "";
  const slots = items.map((item, i) =>
    slot(item, items.length, items.length === 2 ? items[1 - i] : undefined),
  );
  const wide = slots.reduce((sum, s) => sum + s.wide, 0);
  const mid = slots.reduce((sum, s) => sum + s.mid, 0);
  const onTablet = mid < 6 ? (START_MID[6 - mid + 1] ?? "") : "";
  // The tablet start must not leak into the 12-column layout.
  const onDesktop =
    wide < 12
      ? (START[12 - wide + 1] ?? "lg:col-start-auto")
      : "lg:col-start-auto";
  return cn(onTablet, onDesktop);
}

const TAPE_SIDE = {
  left: "left-[10%] -rotate-[7deg]",
  centre: "left-1/2 -ml-10 rotate-2",
  right: "right-[10%] rotate-6",
} as const;

function Entry({
  item,
  order,
  count,
  mate,
  start,
  sticker,
  onOpen,
}: {
  item: Placed;
  order: number;
  /** How many entries share this sheet. */
  count: number;
  start: string;
  /** The only other entry on the sheet, when there are exactly two. */
  mate?: Placed;
  /** A sticker stuck over the corner of this entry. */
  sticker?: StickerName;
  onOpen: (id: string) => void;
}) {
  const { span, sizes } = slot(item, count, mate);
  const delay = (order % 4) * 0.07;
  const lean = item.tilt > 0 ? 5 : -5;

  return (
    <m.li
      style={{ ["--nudge" as string]: `${item.nudge}px` }}
      className={cn(
        "relative mt-[calc(var(--nudge)*0.4)] md:mt-[var(--nudge)]",
        span,
        start,
      )}
      // Placed down on the sheet: arrives a little high and turned, then settles.
      initial={{ opacity: 0, y: 30, rotate: item.tilt + lean, scale: 1.06 }}
      whileInView={{ opacity: 1, y: 0, rotate: item.tilt, scale: 1 }}
      whileHover={{ rotate: 0, scale: 1.03, y: -6, transition: SETTLE }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...SETTLE, delay }}
    >
      {item.kind !== "milestone" ? (
        <m.span
          aria-hidden="true"
          data-placed
          data-tone={item.tone}
          className={cn(
            "washi absolute -top-3 z-10 block h-6 w-20",
            TAPE_SIDE[item.tapeSide],
          )}
          initial={{ opacity: 0, scale: 1.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: delay + 0.28,
            duration: 0.22,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ) : null}

      {item.kind === "milestone" ? (
        <MilestoneCard
          title={item.title}
          date={item.dateCard}
          age={item.age}
          note={item.body}
          tone={item.tone}
        />
      ) : item.kind === "note" || !item.media ? (
        <NoteSlip
          body={item.body ?? item.title}
          author={item.author}
          date={item.dateLong}
        />
      ) : (
        <button
          type="button"
          onClick={() => onOpen(item.id)}
          aria-label={`${item.kind === "video" ? "Play video" : "Open photo"}: ${item.title}`}
          className="block w-full cursor-zoom-in rounded-[3px] text-left"
        >
          <PrintFrame
            caption={item.title}
            detail={
              item.songUrl ? (
                <Music
                  aria-label="Has a song"
                  className="mb-1 size-4 shrink-0 text-cobalt"
                  strokeWidth={2.5}
                />
              ) : null
            }
          >
            <m.div
              layoutId={`media-${item.id}`}
              className="relative"
              style={{
                aspectRatio: `${item.media.width} / ${item.media.height}`,
              }}
            >
              <Image
                src={posterSrc(item.media)}
                alt=""
                fill
                sizes={sizes}
                className="object-cover"
              />
            </m.div>
            {item.kind === "video" ? (
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper">
                <Play aria-hidden="true" className="size-3 fill-current" />
                Video
              </span>
            ) : null}
          </PrintFrame>
        </button>
      )}

      {sticker ? (
        <m.div
          data-placed
          className={cn(
            "pointer-events-none absolute -top-7 z-20 w-14 sm:w-16 md:w-20",
            // Away from the tape, and clear of the caption along the bottom.
            item.tapeSide === "right" ? "-left-4" : "-right-4",
          )}
          initial={{ opacity: 0, scale: 0.4, rotate: 25 }}
          whileInView={{
            opacity: 1,
            scale: 1,
            rotate: item.tilt > 0 ? -12 : 10,
          }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 16,
            delay: delay + 0.35,
          }}
        >
          <Sticker name={sticker} />
        </m.div>
      ) : null}
    </m.li>
  );
}

function ChapterSheet({
  chapter,
  index,
  onOpen,
}: {
  chapter: Chapter;
  index: number;
  onOpen: (id: string) => void;
}) {
  const headingId = `${chapter.id}-title`;
  const start = firstColumn(chapter.items, index);
  // The second sticker goes over the corner of the last photo or video, where there are no words.
  // A sheet with none gets it in the bottom corner of the paper instead.
  const stuckOn = chapter.items.findLastIndex((item) => item.media);
  return (
    <section
      id={chapter.id}
      data-chapter
      data-sheet={chapter.sheet}
      aria-labelledby={headingId}
      className="sheet pinked relative px-5 pb-24 pt-16 sm:px-8 md:pb-32 md:pt-24 lg:pr-24"
    >
      <div className="mx-auto max-w-6xl">
        <header className="relative mb-12 md:mb-16 md:pr-36">
          <h2
            id={headingId}
            className="font-display text-[clamp(2.6rem,9vw,5.5rem)] leading-[0.95] text-ink"
          >
            {chapter.title}
          </h2>
          <svg
            aria-hidden="true"
            viewBox="0 0 300 16"
            preserveAspectRatio="none"
            className="mt-2 h-3 w-[min(60%,18rem)] text-ink"
          >
            <m.path
              d="M3 9c40-8 60 8 98 0s62 8 98 0 60 6 98-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1,
              }}
            />
          </svg>
          <p className="mt-3 font-hand text-[1.5rem] leading-tight text-ink">
            {chapter.range}
          </p>
          <m.div
            data-placed
            className="absolute -top-14 right-0 w-14 sm:w-20 md:-top-6 md:w-28"
            initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 9 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 16,
              delay: 0.25,
            }}
          >
            <Sticker name={chapter.stickers[0]} />
          </m.div>
        </header>

        <ul className="grid grid-flow-dense grid-cols-2 items-center gap-x-4 gap-y-9 md:grid-cols-6 md:gap-x-8 md:gap-y-14 lg:grid-cols-12 lg:gap-x-10">
          {chapter.items.map((item, order) => (
            <Entry
              key={item.id}
              item={item}
              order={order}
              count={chapter.items.length}
              mate={
                chapter.items.length === 2
                  ? chapter.items[1 - order]
                  : undefined
              }
              start={order === 0 ? start : ""}
              sticker={order === stuckOn ? chapter.stickers[1] : undefined}
              onOpen={onOpen}
            />
          ))}
        </ul>

        {stuckOn < 0 ? (
          <m.div
            data-placed
            className="pointer-events-none absolute bottom-6 right-[8%] w-14 sm:w-16 md:w-20 lg:right-[14%]"
            initial={{ opacity: 0, scale: 0.4, rotate: 25 }}
            whileInView={{ opacity: 1, scale: 1, rotate: -11 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ type: "spring", stiffness: 420, damping: 16 }}
          >
            <Sticker name={chapter.stickers[1]} />
          </m.div>
        ) : null}
      </div>
    </section>
  );
}

export function JournalChapters({ chapters }: { chapters: Chapter[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const viewable = useMemo(
    () => chapters.flatMap((c) => c.items).filter((item) => item.media),
    [chapters],
  );
  const at = viewable.findIndex((item) => item.id === openId);
  const open = at >= 0 ? viewable[at] : null;

  return (
    <>
      {chapters.map((chapter, index) => (
        <ChapterSheet
          key={chapter.id}
          chapter={chapter}
          index={index}
          onOpen={setOpenId}
        />
      ))}
      <AnimatePresence>
        {open ? (
          <Lightbox
            key="lightbox"
            item={open}
            onClose={() => setOpenId(null)}
            onStep={(direction) =>
              setOpenId(viewable[at + direction]?.id ?? null)
            }
            hasPrev={at > 0}
            hasNext={at < viewable.length - 1}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
