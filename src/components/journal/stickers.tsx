import type { ReactNode } from "react";
import type { StickerName } from "@/lib/palette";
import { cn } from "@/lib/utils";

const INK = "#1d2145";

/** Each sticker: the silhouette that becomes its white die-cut edge, then the printed art. */
const ART: Record<StickerName, { edge: ReactNode; art: ReactNode }> = {
  star: {
    edge: (
      <path d="M50 10 61 37l29 2-22 19 7 28-25-15-25 15 7-28L10 39l29-2Z" />
    ),
    art: (
      <>
        <path
          d="M50 10 61 37l29 2-22 19 7 28-25-15-25 15 7-28L10 39l29-2Z"
          fill="#f0a52b"
          stroke="#f0a52b"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <circle cx="42" cy="50" r="3" fill={INK} />
        <circle cx="58" cy="50" r="3" fill={INK} />
        <path
          d="M43 59q7 6 14 0"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </>
    ),
  },
  heart: {
    edge: (
      <path d="M50 86C20 62 10 45 10 32 10 19 20 11 31 11c8 0 15 4 19 11 4-7 11-11 19-11 11 0 21 8 21 21 0 13-10 30-40 54Z" />
    ),
    art: (
      <>
        <path
          d="M50 86C20 62 10 45 10 32 10 19 20 11 31 11c8 0 15 4 19 11 4-7 11-11 19-11 11 0 21 8 21 21 0 13-10 30-40 54Z"
          fill="#c43a23"
        />
        <path
          d="M24 30c0-6 4-10 9-10"
          fill="none"
          stroke="#fff6dc"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </>
    ),
  },
  moon: {
    edge: <path d="M60 10a40 40 0 1 0 30 54A33 33 0 0 1 60 10Z" />,
    art: (
      <>
        <path d="M60 10a40 40 0 1 0 30 54A33 33 0 0 1 60 10Z" fill="#f7d774" />
        <path
          d="M38 58q5 5 10 0"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M33 46q4-4 8 0"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </>
    ),
  },
  sun: {
    edge: <circle cx="50" cy="50" r="41" />,
    art: (
      <>
        <g stroke="#f0a52b" strokeWidth="7" strokeLinecap="round">
          <path d="M50 12v10M50 78v10M12 50h10M78 50h10M23 23l7 7M70 70l7 7M77 23l-7 7M30 70l-7 7" />
        </g>
        <circle cx="50" cy="50" r="21" fill="#f7d774" />
        <circle cx="43" cy="47" r="2.6" fill={INK} />
        <circle cx="57" cy="47" r="2.6" fill={INK} />
        <path
          d="M43 56q7 6 14 0"
          fill="none"
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </>
    ),
  },
  cloud: {
    edge: (
      <path d="M28 74a17 17 0 0 1-2-34 22 22 0 0 1 42-7 20 20 0 0 1 6 41Z" />
    ),
    art: (
      <>
        <path
          d="M28 74a17 17 0 0 1-2-34 22 22 0 0 1 42-7 20 20 0 0 1 6 41Z"
          fill="#dcebfb"
        />
        <path
          d="M30 64h38"
          fill="none"
          stroke="#a9cbef"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </>
    ),
  },
  rainbow: {
    edge: <path d="M8 80a42 42 0 0 1 84 0H66a16 16 0 0 0-32 0Z" />,
    art: (
      <g fill="none" strokeWidth="9">
        <path d="M13 80a37 37 0 0 1 74 0" stroke="#c43a23" />
        <path d="M22 80a28 28 0 0 1 56 0" stroke="#f0a52b" />
        <path d="M31 80a19 19 0 0 1 38 0" stroke="#2f55d4" />
      </g>
    ),
  },
  balloon: {
    edge: (
      <path d="M50 8c16 0 27 13 27 29 0 15-11 28-22 32l4 7H41l4-7C34 65 23 52 23 37 23 21 34 8 50 8Z" />
    ),
    art: (
      <>
        <path
          d="M50 76q-8 8 0 16"
          fill="none"
          stroke={INK}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M50 8c16 0 27 13 27 29 0 15-11 28-22 32l4 7H41l4-7C34 65 23 52 23 37 23 21 34 8 50 8Z"
          fill="#2f55d4"
        />
        <path
          d="M36 32c0-8 5-13 11-14"
          fill="none"
          stroke="#dcebfb"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </>
    ),
  },
  duck: {
    edge: (
      <path d="M52 22a17 17 0 0 1 33 6l9 5-9 5a17 17 0 0 1-6 9c5 6 7 13 7 19 0 12-13 20-34 20S14 78 14 64c0-9 6-15 15-15 7 0 12 4 18 4a17 17 0 0 1 5-31Z" />
    ),
    art: (
      <>
        <path
          d="M14 64c0-9 6-15 15-15 8 0 13 5 21 5 9 0 14-7 23-7 8 0 13 9 13 19 0 12-13 20-34 20S14 78 14 64Z"
          fill="#f0a52b"
        />
        <circle cx="68" cy="30" r="17" fill="#f0a52b" />
        <path d="M83 26l11 6-11 6Z" fill="#c43a23" />
        <circle cx="71" cy="27" r="3" fill={INK} />
        <path
          d="M32 62q10 10 24 2"
          fill="none"
          stroke="#c9841a"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </>
    ),
  },
  flower: {
    edge: (
      <>
        <circle cx="50" cy="26" r="17" />
        <circle cx="73" cy="43" r="17" />
        <circle cx="64" cy="70" r="17" />
        <circle cx="36" cy="70" r="17" />
        <circle cx="27" cy="43" r="17" />
      </>
    ),
    art: (
      <>
        <g fill="#f4b3ad">
          <circle cx="50" cy="26" r="16" />
          <circle cx="73" cy="43" r="16" />
          <circle cx="64" cy="70" r="16" />
          <circle cx="36" cy="70" r="16" />
          <circle cx="27" cy="43" r="16" />
        </g>
        <circle cx="50" cy="51" r="13" fill="#f7d774" />
      </>
    ),
  },
};

/** A die-cut sticker. Decorative, so it is hidden from assistive tech. */
export function Sticker({
  name,
  className,
}: {
  name: StickerName;
  className?: string;
}) {
  const { edge, art } = ART[name];
  return (
    <svg
      viewBox="-4 -4 108 108"
      aria-hidden="true"
      className={cn("drop-shadow-[0_3px_3px_rgb(29_33_69_/_0.3)]", className)}
    >
      <g
        fill="#fff"
        stroke="#fff"
        strokeWidth="11"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {edge}
      </g>
      {art}
    </svg>
  );
}
