import Link from "next/link";
import { BookCover } from "@/components/journal/book-cover";
import { ChapterTabs, type TabLink } from "@/components/journal/chapter-tabs";
import { JournalChapters } from "@/components/journal/chapters";
import {
  CoverOpening,
  OpenJournalButton,
} from "@/components/journal/cover-opening";
import { Mixtape } from "@/components/journal/mixtape";
import { Sticker } from "@/components/journal/stickers";
import { SiteCredit } from "@/components/site-credit";
import { longDate } from "@/lib/age";
import { buildChapters } from "@/lib/chapters";
import type { Child, Journal } from "@/lib/types";

const cornerLink =
  "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-cover-fg underline decoration-cover-fg/50 hover:decoration-cover-fg";

function Nameplate({
  child,
  count,
  sample,
}: {
  child: Child;
  count: number;
  sample: boolean;
}) {
  return (
    <div
      data-cover={child.coverColor}
      className="endpaper flex h-full min-h-svh items-center justify-center p-6"
    >
      <div className="relative w-full max-w-md -rotate-2 border-[3px] border-double border-ink bg-paper px-6 py-10 text-center text-ink shadow-print sm:px-10 sm:py-12">
        <p className="font-hand text-[1.5rem] leading-tight">
          This journal belongs to
        </p>
        <p className="mt-2 font-display text-[clamp(3rem,14vw,5rem)] leading-[0.95]">
          {child.name}
        </p>
        <p className="mt-4 text-base">Born {longDate(child.birthDate)}</p>
        <p className="mt-1 text-base">
          {count === 0
            ? "The first page is waiting."
            : `${count === 1 ? "1 memory" : `${count} memories`} so far, and room for more.`}
        </p>
        {sample ? (
          <p className="mt-4 text-sm font-semibold">
            A sample journal with invented names and stock photos.
          </p>
        ) : null}
        <Sticker
          name="heart"
          className="absolute -right-6 -top-7 w-16 rotate-12 sm:w-20"
        />
        <Sticker
          name="star"
          className="absolute -bottom-7 -left-5 w-16 -rotate-12 sm:w-20"
        />
      </div>
    </div>
  );
}

/**
 * A whole journal: cover, nameplate, age chapters, and the floating mixtape. Used for real
 * journals and, with `sample`, for the static one at /demo.
 */
export function JournalView({
  journal,
  sample = false,
}: {
  journal: Journal;
  sample?: boolean;
}) {
  const { child, memories, songs } = journal;
  const chapters = buildChapters(journal);
  const tabs: TabLink[] = chapters.map((c) => ({
    id: c.id,
    label: c.tab,
    title: c.title,
    sheet: c.sheet,
  }));

  return (
    <main className="relative overflow-x-clip">
      <CoverOpening
        cover={
          <>
            <BookCover child={child} heading="h1" eager sizes="min(90vw, 62vh)">
              <OpenJournalButton />
            </BookCover>
            <nav
              aria-label="Journal"
              className="absolute inset-x-0 top-0 flex justify-between p-3 pl-[max(1.25rem,7vw)] sm:p-5 sm:pl-[max(1.25rem,7vw)]"
              data-cover={child.coverColor}
            >
              <Link href="/" className={cornerLink}>
                All journals
              </Link>
              <Link href="/parents" className={cornerLink}>
                Parents&rsquo; desk
              </Link>
            </nav>
          </>
        }
      >
        <Nameplate child={child} count={memories.length} sample={sample} />
      </CoverOpening>

      {chapters.length === 0 ? (
        <section
          data-sheet="sky"
          className="sheet pinked relative px-5 py-24 sm:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-[clamp(2.6rem,9vw,5.5rem)] leading-[0.95] text-ink">
              Page one
            </h2>
            <p className="mt-4 max-w-[38ch] text-lg leading-relaxed text-ink">
              Nothing is stuck in yet. The first photo, a first, or a few
              written lines will start {child.name}&rsquo;s first chapter.
            </p>
            <Link
              href="/parents"
              className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-base font-semibold text-paper transition-transform duration-200 ease-out-expo hover:scale-[1.04] active:scale-[0.97]"
            >
              Add the first memory
            </Link>
          </div>
        </section>
      ) : (
        <JournalChapters chapters={chapters} />
      )}

      {songs.length > 0 ? (
        <Mixtape songs={songs} childName={child.name} />
      ) : null}

      <footer
        data-sheet="album"
        className="sheet pinked relative px-5 pb-28 pt-10 text-paper sm:px-8 lg:pb-12"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 text-sm font-medium">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center underline"
          >
            Back to the shelf
          </Link>
          <Link
            href="/parents"
            className="inline-flex min-h-11 items-center underline"
          >
            {sample ? "Start your own journal" : "Add a memory"}
          </Link>
          {sample ? (
            <p className="basis-full pt-2 text-paper">
              This is a sample journal. The names and captions are invented, the
              photographs are stock images from Unsplash, and the video is
              Cloudinary&rsquo;s demo clip.
            </p>
          ) : null}
          <SiteCredit
            className="basis-full pt-3 text-center text-butter"
            heartClassName="text-rose"
          />
        </div>
      </footer>

      {tabs.length > 1 ? <ChapterTabs tabs={tabs} /> : null}
    </main>
  );
}
