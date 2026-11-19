import { Heart } from "lucide-react";
import { SITE_MAKERS } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * "Created with love by …", with the word love drawn as a small beating heart.
 * Screen readers still hear the word; the beat stops under reduced motion.
 */
export function SiteCredit({
  className,
  heartClassName,
}: {
  className?: string;
  heartClassName?: string;
}) {
  return (
    <p className={cn("font-hand text-[1.05rem] font-normal", className)}>
      Created with <span className="sr-only">love</span>
      <Heart
        aria-hidden="true"
        className={cn(
          "mx-0.5 inline-block size-[1.05em] -translate-y-px fill-current motion-safe:[animation:heartbeat_1.4s_ease-in-out_infinite]",
          heartClassName,
        )}
        strokeWidth={0}
      />{" "}
      by {SITE_MAKERS}
    </p>
  );
}
