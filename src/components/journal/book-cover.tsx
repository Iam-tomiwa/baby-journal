import Image from "next/image";
import type { ReactNode } from "react";
import { longDate } from "@/lib/age";
import type { Child } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sticker } from "./stickers";

/**
 * A journal's cloth cover: stitched spine, die-cut photo window, stamped name.
 * Sizes itself from its container, so the same cover fills a window or sits on the shelf.
 */
export function BookCover({
  child,
  heading = "h2",
  eager = false,
  sizes,
  children,
  className,
}: {
  child: Child;
  heading?: "h1" | "h2";
  /** Load the cover photo straight away; use for covers visible on arrival. */
  eager?: boolean;
  sizes: string;
  /** Rendered under the birth date: the action that opens the book. */
  children?: ReactNode;
  className?: string;
}) {
  const Heading = heading;
  // Long names step down so they stay on one line of the cover.
  const nameSize = Math.min(
    26,
    Math.round(150 / Math.max(child.name.length, 4)),
  );

  return (
    <div
      data-cover={child.coverColor}
      className={cn(
        "bookcloth relative h-full w-full overflow-hidden text-cover-fg [container-type:size]",
        className,
      )}
    >
      {/* The spine is the same cloth, in the shade of the hinge, sewn down with thread. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[max(0.9rem,5.5cqi)] bg-ink/25"
      >
        <span className="stitches hidden @[9rem]:block absolute inset-y-[2cqb] right-[max(1px,0.6cqi)] w-2.5 translate-x-px translate-y-px text-ink/50" />
        <span className="stitches hidden @[9rem]:block absolute inset-y-[2cqb] right-[max(1px,0.6cqi)] w-2.5 text-cover-fg" />
      </div>
      <div className="relative flex h-full flex-col items-center justify-center gap-[clamp(0.5rem,3.5cqb,2rem)] py-[6cqb] pl-[max(1.75rem,11cqi)] pr-[6cqi] text-center">
        {/* The window is cut through the board: a rim of board edge, then the photo set back behind it. */}
        <div className="aspect-square w-[min(58cqi,38cqb)] shrink-0 rounded-full bg-cover-deep p-[max(3px,1.1cqi)]">
          <div className="relative size-full overflow-hidden rounded-full bg-cover-deep">
            {child.coverPhoto ? (
              <Image
                src={child.coverPhoto.src}
                alt=""
                fill
                sizes={sizes}
                preload={eager}
                loading={eager ? "eager" : "lazy"}
                className="object-cover"
              />
            ) : (
              <Sticker name="star" className="absolute inset-[18%]" />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full shadow-[inset_0_max(4px,1.6cqi)_max(6px,2cqi)_-2px_rgb(29_33_69_/_0.55)]"
            />
          </div>
        </div>
        <div>
          <Heading
            className="font-display leading-[0.9]"
            style={{ fontSize: `min(${nameSize}cqi, 22cqb, 11rem)` }}
          >
            {child.name}
          </Heading>
          <p className="mt-[1.5cqb] hidden font-hand @[9rem]:block text-[clamp(0.6rem,5.5cqi,1.75rem)] leading-tight">
            born {longDate(child.birthDate)}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
