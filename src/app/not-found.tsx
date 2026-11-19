import Link from "next/link";
import { Sticker } from "@/components/journal/stickers";

export default function NotFound() {
  return (
    <main
      data-sheet="rose"
      className="sheet flex min-h-svh items-center px-5 py-16 sm:px-8"
    >
      <div className="mx-auto w-full max-w-3xl">
        <Sticker name="cloud" className="w-24 -rotate-6" />
        <h1 className="mt-6 font-display text-[clamp(2.75rem,10vw,5.5rem)] leading-[0.95] text-ink">
          This page fell out of the book
        </h1>
        <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-ink">
          There is no journal at this address. It may have been renamed, or the
          link was mistyped.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-base font-semibold text-paper transition-transform duration-200 ease-out-expo hover:scale-[1.04] active:scale-[0.97]"
        >
          Back to the shelf
        </Link>
      </div>
    </main>
  );
}
