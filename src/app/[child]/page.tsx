import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JournalView } from "@/components/journal/journal-view";
import { getJournal } from "@/lib/data";

export async function generateMetadata({
  params,
}: PageProps<"/[child]">): Promise<Metadata> {
  const { child: slug } = await params;
  const journal = await getJournal(slug);
  if (!journal) return { title: "Journal not found" };
  return {
    title: `${journal.child.name}'s journal`,
    description: `Photos, firsts and notes from ${journal.child.name}'s first years.`,
  };
}

export default function JournalPage({ params }: PageProps<"/[child]">) {
  return (
    <Suspense
      fallback={
        <div className="bookcloth h-svh" data-cover="tomato" aria-busy="true" />
      }
    >
      <Journal params={params} />
    </Suspense>
  );
}

async function Journal({ params }: Pick<PageProps<"/[child]">, "params">) {
  const { child: slug } = await params;
  const journal = await getJournal(slug);
  if (!journal) notFound();
  return <JournalView journal={journal} />;
}
