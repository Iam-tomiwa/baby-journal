"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Child } from "@/lib/types";
import {
  ChildForm,
  MediaForm,
  MilestoneForm,
  NoteForm,
  SongForm,
} from "./forms";

const TABS = [
  { value: "media", label: "Photo or video" },
  { value: "milestone", label: "A first" },
  { value: "note", label: "Note" },
  { value: "song", label: "Song" },
  { value: "child", label: "New journal" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

/** Everything a parent can add, one kind at a time. The chosen child carries across tabs. */
export function Desk({
  options,
  chaptersByChild,
  today,
}: {
  options: Child[];
  chaptersByChild: Record<string, number[]>;
  today: string;
}) {
  const hasJournal = options.length > 0;
  const [tab, setTab] = useState<TabValue>(hasJournal ? "media" : "child");
  const [childId, setChildId] = useState(options[0]?.id ?? "");
  // A journal created a moment ago becomes the selection once it arrives from the server.
  const selected = options.some((c) => c.id === childId)
    ? childId
    : (options[0]?.id ?? "");
  const shared = {
    options,
    chaptersByChild,
    childId: selected,
    onChildChange: setChildId,
    today,
  };

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as TabValue)}
      className="gap-8"
    >
      <div>
        <TabsList className="h-auto! w-full flex-wrap justify-start gap-1 rounded-3xl bg-muted p-1.5 sm:w-fit sm:rounded-full">
          {TABS.map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              disabled={!hasJournal && value !== "child"}
              className="h-11! flex-none rounded-full px-4 text-base font-semibold text-ink-soft data-active:bg-ink data-active:text-paper"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="media" className="text-base">
        <MediaForm {...shared} />
      </TabsContent>
      <TabsContent value="milestone" className="text-base">
        <MilestoneForm {...shared} />
      </TabsContent>
      <TabsContent value="note" className="text-base">
        <NoteForm {...shared} />
      </TabsContent>
      <TabsContent value="song" className="text-base">
        <SongForm {...shared} />
      </TabsContent>
      <TabsContent value="child" className="text-base">
        <ChildForm today={today} />
      </TabsContent>
    </Tabs>
  );
}
