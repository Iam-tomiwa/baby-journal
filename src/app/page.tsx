import { Plus } from "lucide-react";
import Link from "next/link";
import { BookCover } from "@/components/journal/book-cover";
import { ShelfBook } from "@/components/journal/shelf-book";
import { Sticker } from "@/components/journal/stickers";
import { SiteCredit } from "@/components/site-credit";
import { getChildren } from "@/lib/data";
import { hasDatabase } from "@/lib/env";
import { SITE_NAME } from "@/lib/site";

const TILTS = [-3, 2.5, -1.5, 3.5, -2.5];

const primaryLink =
  "inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-base font-semibold text-paper transition-transform duration-200 ease-out-expo hover:scale-[1.04] active:scale-[0.97]";

/** The shelf before any journal exists: the outline of the first book, waiting for a name. */
function EmptyShelf() {
  return (
    <div className="mt-12 flex flex-1 flex-col items-center gap-10 pb-10 md:mt-6 md:flex-row md:items-center md:justify-center md:gap-16">
      <div className="relative shrink-0">
        <Link
          href="/parents"
          aria-label="Start the first journal"
          className="group relative flex aspect-[3/4] w-[min(64vw,15rem)] -rotate-3 flex-col items-center justify-center gap-5 rounded-l-[4px] rounded-r-xl border-[3px] border-dashed border-ink/70 px-6 text-center text-ink transition-transform duration-300 ease-out-expo hover:-translate-y-2 hover:rotate-0 sm:w-[15rem] lg:w-[17rem]"
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-3 left-[9%] border-l-[3px] border-dashed border-ink/40"
          />
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-ink text-paper transition-transform duration-300 ease-out-expo group-hover:scale-110">
            <Plus aria-hidden="true" className="size-7" strokeWidth={2.75} />
          </span>
          <span className="font-hand text-[1.5rem] leading-tight">
            Their name goes here
          </span>
        </Link>
        <Sticker
          name="duck"
          className="pointer-events-none absolute -bottom-6 -right-8 w-20 rotate-6 sm:w-24"
        />
        <Sticker
          name="star"
          className="pointer-events-none absolute -left-7 -top-6 w-16 -rotate-12 sm:w-20"
        />
      </div>

      <div className="max-w-md text-center md:text-left">
        <h2 className="font-display text-[clamp(1.9rem,5vw,2.75rem)] leading-[1.02] text-ink">
          The first book is still blank
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink">
          Start a journal for your little one: their name, their birthday and a
          cover colour. Then stick in the first photo. It takes about a minute.
        </p>
        {hasDatabase ? null : (
          <p className="mt-4 rounded-2xl bg-paper px-4 py-3 text-base leading-relaxed text-ink">
            The database isn&rsquo;t connected yet. Add{" "}
            <code className="font-semibold">DATABASE_URL</code> to{" "}
            <code className="font-semibold">.env.local</code> and restart before
            starting a journal.
          </p>
        )}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-start">
          <Link href="/parents" className={primaryLink}>
            Start the first journal
          </Link>
          <Link
            href="/demo"
            className="inline-flex min-h-11 items-center text-base font-semibold text-ink underline"
          >
            See a sample journal first
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function ShelfPage() {
  const children = await getChildren();

  return (
    <main
      data-sheet="butter"
      className="sheet relative flex min-h-svh flex-col overflow-hidden px-5 py-10 sm:px-8 sm:py-14"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <header className="relative">
          <h1 className="max-w-[14ch] font-display text-[clamp(2.75rem,10vw,6rem)] leading-[0.92] text-ink">
            {SITE_NAME}
          </h1>
          <p className="mt-4 font-hand text-[1.6rem] leading-tight text-ink">
            {children.length === 0
              ? "An empty shelf, for now."
              : children.length === 1
                ? "One book, still being written."
                : "Pick a book. They're all still being written."}
          </p>
          <Sticker
            name="sun"
            className="absolute -top-4 right-0 w-20 rotate-12 sm:w-28 md:right-10 md:w-36"
          />
        </header>

        {children.length === 0 ? (
          <EmptyShelf />
        ) : (
          <ul className="mt-14 flex flex-1 flex-wrap content-center items-center justify-center gap-x-10 gap-y-12 pb-10 md:mt-10 md:gap-x-16">
            {children.map((child, i) => (
              <li key={child.id} className="flex flex-col items-center gap-4">
                <ShelfBook
                  href={`/${child.slug}`}
                  label={`Open ${child.name}'s journal`}
                  tilt={TILTS[i % TILTS.length]}
                  order={i}
                >
                  <BookCover
                    child={child}
                    sizes="(min-width: 1024px) 160px, 45vw"
                    eager={i < 2}
                  />
                </ShelfBook>
                <p className="font-hand text-[1.3rem] text-ink">
                  {child.memoryCount === 1
                    ? "1 memory"
                    : `${child.memoryCount} memories`}
                </p>
              </li>
            ))}
          </ul>
        )}

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-1 text-sm font-medium text-ink">
          {/* The empty shelf already offers both of these as its main actions. */}
          {children.length > 0 ? (
            <>
              <Link
                href="/parents"
                className="inline-flex min-h-11 items-center underline"
              >
                Parents&rsquo; desk
              </Link>
              <Link
                href="/demo"
                className="inline-flex min-h-11 items-center underline"
              >
                Sample journal
              </Link>
            </>
          ) : null}
          <SiteCredit
            className="basis-full pt-3 text-center text-ink-soft"
            heartClassName="text-tomato"
          />
        </footer>
      </div>
    </main>
  );
}
