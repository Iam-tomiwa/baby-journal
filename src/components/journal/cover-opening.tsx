"use client";

import { ArrowDown } from "lucide-react";
import {
  animate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import * as m from "motion/react-m";
import { createContext, use, useRef, type ReactNode } from "react";

const OpenContext = createContext<() => void>(() => undefined);

/** The cover's one action. Rendered inside the cover, wired to the opening sequence around it. */
export function OpenJournalButton() {
  const open = use(OpenContext);
  return (
    <button
      type="button"
      onClick={open}
      className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-cover-fg px-6 text-base font-semibold text-cover transition-transform duration-200 ease-out-expo hover:scale-[1.04] active:scale-[0.97]"
    >
      Open the journal
      <ArrowDown
        aria-hidden="true"
        className="size-4 transition-transform duration-200 ease-out-expo group-hover:translate-y-0.5"
        strokeWidth={2.75}
      />
    </button>
  );
}

/**
 * The first screen is the closed book. Scrolling (or the button) swings the
 * cover open on its spine and uncovers the nameplate page underneath.
 * Only `transform` and `opacity` change, so it stays on the compositor.
 */
export function CoverOpening({
  cover,
  children,
}: {
  cover: ReactNode;
  children: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });
  const rotateY = useTransform(scrollYProgress, [0, 0.92], [0, -96], {
    clamp: true,
  });
  const shade = useTransform(scrollYProgress, [0, 0.9], [0.5, 0]);
  const closed = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  function open() {
    const el = track.current;
    if (!el) return;
    const end = el.offsetTop + el.offsetHeight - window.innerHeight;
    if (still) {
      window.scrollTo({ top: end });
      return;
    }
    animate(window.scrollY, end, {
      duration: 1.15,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (y) => window.scrollTo(0, y),
    });
  }

  if (still) {
    return (
      <OpenContext value={open}>
        <div ref={track}>
          <div className="relative h-svh">{cover}</div>
          <div className="relative min-h-svh">{children}</div>
        </div>
      </OpenContext>
    );
  }

  return (
    <OpenContext value={open}>
      <div ref={track} className="relative h-[210svh]">
        <div className="sticky top-0 h-svh overflow-hidden [perspective:2400px]">
          <div className="absolute inset-0">{children}</div>
          <m.div
            aria-hidden="true"
            style={{ opacity: shade }}
            className="pointer-events-none absolute inset-0 bg-ink"
          />
          {/* The closed book's page edges, showing past the cover board along the fore-edge and tail. */}
          <m.div
            aria-hidden="true"
            style={{ opacity: closed }}
            className="pointer-events-none absolute inset-0"
          >
            <span className="pageblock absolute inset-y-0 right-0 w-3 sm:w-4" />
            <span className="pageblock absolute inset-x-0 bottom-0 h-3 [--page-dir:0deg] sm:h-4" />
          </m.div>
          <m.div
            style={{ rotateY }}
            className="absolute bottom-2 left-0 right-2 top-0 origin-left overflow-hidden rounded-br-2xl shadow-[14px_10px_30px_-12px_rgb(29_33_69_/_0.6)] will-change-transform [backface-visibility:hidden] sm:bottom-3 sm:right-3"
          >
            {cover}
          </m.div>
        </div>
      </div>
    </OpenContext>
  );
}
