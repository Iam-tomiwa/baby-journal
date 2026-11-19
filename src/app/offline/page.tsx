import { WifiOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PrintFrame } from "@/components/journal/pieces";
import { Sticker } from "@/components/journal/stickers";
import { StatePage, stateLink } from "@/components/state-page";
import { Retry } from "./retry";

export const metadata: Metadata = { title: "Offline" };

/** A print that hasn't developed yet: a dark frame, the moon out, waiting for a connection. */
function UndevelopedPrint() {
  return (
    <div className="relative motion-safe:[animation:drift-down_0.9s_var(--ease-out-expo)_both]">
      <span
        aria-hidden="true"
        data-tone="marigold"
        className="washi absolute -top-3 left-[18%] z-10 block h-6 w-24 -rotate-6"
      />
      <PrintFrame
        caption="Still developing…"
        className="w-[min(70vw,19rem)] -rotate-3 shadow-lifted sm:w-[20rem]"
      >
        <div className="relative flex aspect-[4/3] items-center justify-center bg-ink">
          <Sticker
            name="moon"
            className="w-24 -rotate-12 motion-safe:[animation:bob_5s_ease-in-out_infinite]"
          />
          <span
            aria-hidden="true"
            className="absolute left-[16%] top-[22%] size-1.5 rounded-full bg-butter"
          />
          <span
            aria-hidden="true"
            className="absolute right-[18%] top-[30%] size-1 rounded-full bg-butter"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-[24%] left-[26%] size-1 rounded-full bg-butter"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-[18%] right-[24%] size-1.5 rounded-full bg-butter"
          />
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-semibold text-ink">
            <WifiOff
              aria-hidden="true"
              className="size-3.5"
              strokeWidth={2.5}
            />
            Offline
          </span>
        </div>
      </PrintFrame>
      <Sticker
        name="star"
        className="pointer-events-none absolute -bottom-6 -right-7 w-20 rotate-12 sm:w-24"
      />
    </div>
  );
}

/** Shown by the service worker when a page can't be reached and no saved copy exists. */
export default function OfflinePage() {
  return (
    <StatePage
      sheet="sky"
      title="No signal just now"
      illustration={<UndevelopedPrint />}
      actions={
        <>
          <Retry />
          <Link href="/" className={stateLink}>
            Back to the shelf
          </Link>
        </>
      }
    >
      <p>
        This page hasn&rsquo;t been opened on this device before, so
        there&rsquo;s no saved copy to show.
      </p>
      <p className="mt-3">
        Pages you&rsquo;ve already read still open without a connection. This
        one will load by itself as soon as you&rsquo;re back online.
      </p>
    </StatePage>
  );
}
