import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { lock } from "@/app/actions";
import { Desk } from "@/components/parents/desk";
import { EntryList } from "@/components/parents/entry-list";
import { PasscodeForm } from "@/components/parents/passcode-form";
import { Walkthrough } from "@/components/parents/walkthrough";
import { chapterKeys } from "@/lib/chapters";
import { getChildren, getJournal, getRecentEntries } from "@/lib/data";
import { deskAccess } from "@/lib/session";

export const metadata: Metadata = { title: "Parents' desk" };

export default function ParentsPage() {
  return (
    <main className="min-h-svh px-5 pb-24 pt-6 sm:px-8 sm:pt-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline"
        >
          Back to the shelf
        </Link>
        <Suspense
          fallback={
            <p className="mt-10 text-base text-ink-soft">Opening the desk…</p>
          }
        >
          <DeskContents />
        </Suspense>
      </div>
    </main>
  );
}

function Heading({ children }: { children: string }) {
  return (
    <h1 className="mt-4 font-display text-[clamp(2.25rem,7vw,3.75rem)] leading-none text-ink">
      {children}
    </h1>
  );
}

async function DeskContents() {
  await connection();
  const access = await deskAccess();

  if (access === "needs-setup") {
    return (
      <>
        <Heading>One more key to add</Heading>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-ink">
          The database is connected, but there is no parent passcode yet. Add{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-base">
            PARENT_PASSCODE
          </code>{" "}
          to{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-base">
            .env.local
          </code>{" "}
          and restart the app. Until then nobody can add to the journals.
        </p>
      </>
    );
  }

  if (access === "locked") {
    return (
      <>
        <Heading>Parents only</Heading>
        <div className="mt-8">
          <PasscodeForm />
        </div>
      </>
    );
  }

  const [children, recent] = await Promise.all([
    getChildren(),
    getRecentEntries(),
  ]);
  const journals = await Promise.all(
    children.map((child) => getJournal(child.slug)),
  );
  // Lets the desk preview a new entry on the sheet colour its chapter will have.
  const chaptersByChild = Object.fromEntries(
    children.map((child, i) => [
      child.id,
      journals[i] ? chapterKeys(journals[i]) : [],
    ]),
  );
  const today = new Date().toISOString().slice(0, 10);
  const childrenById = Object.fromEntries(
    children.map((child) => [child.id, child]),
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Heading>Parents&rsquo; desk</Heading>
        <div className="flex flex-wrap items-center gap-2">
          <Walkthrough options={children} />
          {access === "open" ? (
            <form action={lock}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-ink hover:text-paper"
              >
                Lock the desk
              </button>
            </form>
          ) : null}
        </div>
      </div>

      {access === "no-database" ? (
        <p
          data-sheet="butter"
          className="sheet mt-6 max-w-[75ch] rounded-2xl px-5 py-4 text-base leading-relaxed text-ink"
        >
          The database isn&rsquo;t connected yet, so nothing here saves. Add
          your Neon and Cloudinary keys to{" "}
          <code className="font-semibold">.env.local</code> (the README walks
          through it) and restart.
        </p>
      ) : null}

      <section aria-label="Add to a journal" className="mt-10">
        <Desk
          options={children}
          chaptersByChild={chaptersByChild}
          today={today}
        />
      </section>

      <section aria-labelledby="recent-title" className="mt-20 max-w-3xl">
        <h2 id="recent-title" className="text-xl font-semibold text-ink">
          Recently added
        </h2>
        <p className="mb-5 mt-1 text-base text-ink-soft">
          Entries can&rsquo;t be edited yet. Remove one and add it again to
          change it.
        </p>
        <EntryList
          memories={recent.memories}
          songs={recent.songs}
          childrenById={childrenById}
        />
      </section>
    </>
  );
}
