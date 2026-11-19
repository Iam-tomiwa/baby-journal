"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

const loadFeatures = () =>
  import("@/lib/motion-features").then((mod) => {
    // Lets globals.css keep entries visible until they can actually animate.
    document.documentElement.dataset.motion = "ready";
    return mod.default;
  });

/** How things settle onto a page: quick, with the slightest give. */
export const SETTLE = {
  type: "spring",
  stiffness: 300,
  damping: 26,
  mass: 0.9,
} as const;

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={SETTLE}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
