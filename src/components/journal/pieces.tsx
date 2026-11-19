import {
  Baby,
  Footprints,
  Laugh,
  MessageCircle,
  RotateCw,
  Smile,
  Sparkles,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Tone } from "@/lib/palette";
import { cn } from "@/lib/utils";

/** The white-bordered print a photo or video sits in, with its handwritten caption. */
export function PrintFrame({
  caption,
  detail,
  children,
  className,
}: {
  caption: string;
  detail?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "rounded-[3px] bg-paper p-2 pb-2.5 shadow-print sm:p-2.5 sm:pb-3",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[2px] bg-ink/10">
        {children}
      </div>
      <figcaption className="flex items-end justify-between gap-3 px-1 pt-2">
        <span className="font-hand text-[1.2rem] leading-[1.15] text-ink sm:text-[1.3rem]">
          {caption || "Add a caption"}
        </span>
        {detail}
      </figcaption>
    </figure>
  );
}

const MILESTONE_ICONS = [
  { match: /smile/i, icon: Smile },
  { match: /laugh|giggle/i, icon: Laugh },
  { match: /step|walk|crawl|stood|stand/i, icon: Footprints },
  { match: /word|said|talk/i, icon: MessageCircle },
  { match: /roll/i, icon: RotateCw },
  { match: /hello|born|arriv/i, icon: Baby },
  { match: /birthday|year/i, icon: Star },
];

/** A first, written on a rounded date card. */
export function MilestoneCard({
  title,
  date,
  age,
  note,
  tone,
  className,
}: {
  title: string;
  /** Already formatted for the face of the card, e.g. "May 12". */
  date: string;
  age: string;
  note?: string | null;
  tone: Tone;
  className?: string;
}) {
  const Icon =
    MILESTONE_ICONS.find((entry) => entry.match.test(title))?.icon ?? Sparkles;
  return (
    <article
      data-tone={tone}
      className={cn(
        "@container flex aspect-square flex-col justify-between rounded-[1.6rem] bg-tone p-[9%] text-tone-fg shadow-print",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[clamp(0.8rem,7.5cqi,1rem)] font-medium leading-tight">
          {age}
        </p>
        <Icon
          aria-hidden="true"
          className="size-[clamp(1.1rem,11cqi,1.6rem)] shrink-0"
          strokeWidth={2.25}
        />
      </div>
      <div>
        <p className="font-display text-[clamp(1.5rem,25cqi,3.75rem)] leading-[0.95]">
          {date}
        </p>
        <h3 className="mt-[4cqi] font-hand text-[clamp(1rem,11.5cqi,1.6rem)] leading-[1.05]">
          {title || "Name the milestone"}
        </h3>
        {note ? (
          <p className="mt-1 hidden text-[0.875rem] leading-snug @[13rem]:block">
            {note}
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** A handwritten note on a slip of ruled paper. */
export function NoteSlip({
  body,
  author,
  date,
  className,
}: {
  body: string;
  author?: string | null;
  date: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "ruled relative bg-paper px-5 pb-4 pt-[2.15rem] shadow-print",
        className,
      )}
    >
      <p className="whitespace-pre-line font-hand text-[1.3rem] leading-[1.75rem] text-ink">
        {body || "Write a few lines they can read when they're older."}
      </p>
      <p className="mt-[1.75rem] flex items-baseline justify-between gap-3 font-hand text-[1.15rem] leading-[1.75rem] text-ink-soft">
        <span>{date}</span>
        {author ? <span className="text-ink">Love, {author}</span> : null}
      </p>
    </article>
  );
}
