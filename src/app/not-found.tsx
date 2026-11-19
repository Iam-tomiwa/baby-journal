import type { Metadata } from "next";
import Link from "next/link";
import { Sticker } from "@/components/journal/stickers";
import { StatePage, stateButton, stateLink } from "@/components/state-page";

export const metadata: Metadata = { title: "Page not found" };

/** A sheet torn out of the journal: the tape that held it, an empty photo space, and nothing stuck in. */
function LoosePage() {
  return (
    <div className="relative motion-safe:[animation:drift-down_0.9s_var(--ease-out-expo)_both]">
      <div className="relative aspect-[3/4] w-[min(64vw,17rem)] rotate-[5deg] bg-paper px-6 pb-6 pt-9 shadow-lifted sm:w-[18rem]">
        {/* The edge it was torn along. */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-2.5 bg-[linear-gradient(45deg,var(--sheet)_50%,transparent_50.5%),linear-gradient(135deg,var(--sheet)_50%,transparent_50.5%)] bg-[length:10px_20px,10px_20px] bg-[position:0_0,0_10px] bg-repeat-y"
        />
        <span
          aria-hidden="true"
          data-tone="cobalt"
          className="washi absolute -top-3 left-1/2 block h-6 w-24 -translate-x-1/2 -rotate-3"
        />
        <div className="flex aspect-[4/3] items-center justify-center rounded-[2px] border-[3px] border-dashed border-ink/45">
          <p className="font-display text-[3.5rem] leading-none text-ink">
            404
          </p>
        </div>
        <p className="mt-5 font-hand text-[1.45rem] leading-tight text-ink">
          Nothing stuck in here
        </p>
        <div aria-hidden="true" className="mt-4 space-y-3">
          <span className="block h-px bg-cobalt/35" />
          <span className="block h-px bg-cobalt/35" />
          <span className="block h-px w-2/3 bg-cobalt/35" />
        </div>
      </div>
      <Sticker
        name="cloud"
        className="pointer-events-none absolute -bottom-7 -right-9 w-24 rotate-6 sm:w-28"
      />
    </div>
  );
}

export default function NotFound() {
  return (
    <StatePage
      sheet="rose"
      title="This page fell out of the book"
      illustration={<LoosePage />}
      actions={
        <>
          <Link href="/" className={stateButton}>
            Back to the shelf
          </Link>
          <Link href="/demo" className={stateLink}>
            See the sample journal
          </Link>
        </>
      }
    >
      <p>
        There&rsquo;s no journal or page at this address. The link may be
        mistyped, or the journal it pointed to was renamed.
      </p>
    </StatePage>
  );
}
