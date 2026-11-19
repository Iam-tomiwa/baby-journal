"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import type { ReactNode } from "react";

/** A journal lying on the shelf page. It straightens and lifts when you reach for it. */
export function ShelfBook({
  href,
  label,
  tilt,
  order,
  children,
}: {
  href: string;
  label: string;
  tilt: number;
  order: number;
  children: ReactNode;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 40, rotate: tilt * 2.5 }}
      animate={{ opacity: 1, y: 0, rotate: tilt }}
      whileHover={{ rotate: 0, y: -10, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 22,
        delay: 0.08 * order,
      }}
      className="relative w-[min(72vw,17rem)] sm:w-[15rem] lg:w-[17rem]"
    >
      {/* The page block, a little smaller than the boards, showing along the fore-edge and tail. */}
      <span
        aria-hidden="true"
        className="pageblock absolute -bottom-1.5 left-3 right-0 top-2 translate-x-1.5 rounded-r-lg shadow-lifted"
      />
      <Link
        href={href}
        aria-label={label}
        className="relative block aspect-[3/4] overflow-hidden rounded-l-[4px] rounded-r-xl shadow-print"
      >
        {children}
      </Link>
    </m.div>
  );
}
