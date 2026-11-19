import type { Metadata } from "next";
import { JournalView } from "@/components/journal/journal-view";
import { demoJournal } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Sample journal",
  description:
    "A sample baby journal with invented names and stock photographs, to show how a finished one reads.",
};

/** A static sample journal. Nothing on this page reads from or writes to the database. */
export default function DemoPage() {
  return <JournalView journal={demoJournal} sample />;
}
