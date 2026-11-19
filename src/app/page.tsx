import Link from "next/link";
import { BookCover } from "@/components/journal/book-cover";
import { ShelfBook } from "@/components/journal/shelf-book";
import { Sticker } from "@/components/journal/stickers";
import { getChildren } from "@/lib/data";
import { isDemo } from "@/lib/env";

const TILTS = [-3, 2.5, -1.5, 3.5, -2.5];

export default async function ShelfPage() {
  const children = await getChildren();

  return (
    <main
      data-sheet="butter"
      className="sheet relative flex min-h-svh flex-col overflow-hidden px-5 py-10 sm:px-8 sm:py-14"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
        <header className="relative">
          <h1 className="max-w-[12ch] font-display text-[clamp(2.75rem,10vw,6rem)] leading-[0.92] text-ink">
            The family journals
          </h1>
          <p className="mt-4 font-hand text-[1.6rem] leading-tight text-ink">
            {children.length === 0
              ? "No books on the shelf yet."
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
          <div className="mt-16 max-w-md">
            <p className="text-lg leading-relaxed text-ink">
              Start a journal for your little one, then add the first photo. It
              takes about a minute.
            </p>
            <Link
              href="/parents"
              className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-base font-semibold text-paper transition-transform duration-200 ease-out-expo hover:scale-[1.04] active:scale-[0.97]"
            >
              Start the first journal
            </Link>
          </div>
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

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-sm font-medium text-ink">
          <Link
            href="/parents"
            className="inline-flex min-h-11 items-center underline"
          >
            Parents&rsquo; desk
          </Link>
          {isDemo ? (
            <p className="max-w-[46ch]">
              This is a sample journal with invented names. Photographs are from
              Unsplash.
            </p>
          ) : null}
        </footer>
      </div>
    </main>
  );
}
