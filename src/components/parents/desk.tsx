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
import { ChangePasscodeForm, JournalManager } from "./manage";

const TABS = [
  { value: "media", label: "Photo or video" },
  { value: "milestone", label: "A first" },
  { value: "note", label: "Note" },
  { value: "song", label: "Song" },
  { value: "child", label: "New journal" },
  { value: "settings", label: "Settings" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

/** Everything a parent can add, one kind at a time, plus a Settings tab. The chosen child carries across tabs. */
export function Desk({
  options,
  chaptersByChild,
  today,
  canManage,
}: {
  options: Child[];
  chaptersByChild: Record<string, number[]>;
  today: string;
  /** Whether this visitor is a signed-in parent, who may delete journals and change the passcode. */
  canManage: boolean;
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
          {TABS.filter(({ value }) => value !== "settings" || canManage).map(
            ({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                // With no journal yet there is nothing to add to; starting one and settings stay open.
                disabled={
                  !hasJournal && value !== "child" && value !== "settings"
                }
                className="h-11! flex-none rounded-full px-4 text-base font-semibold text-ink-soft data-active:bg-ink data-active:text-paper"
              >
                {label}
              </TabsTrigger>
            ),
          )}
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
      {canManage ? (
        <TabsContent value="settings" className="text-base">
          <div className="grid max-w-3xl gap-16">
            <section aria-labelledby="journals-title">
              <h2
                id="journals-title"
                className="text-xl font-semibold text-ink"
              >
                Journals
              </h2>
              <p className="mb-5 mt-1 text-base text-ink-soft">
                Deleting a journal removes everything in it for good.
              </p>
              <JournalManager journals={options} />
            </section>

            <section aria-labelledby="passcode-title">
              <h2
                id="passcode-title"
                className="text-xl font-semibold text-ink"
              >
                Parent passcode
              </h2>
              <p className="mb-5 mt-1 max-w-[60ch] text-base text-ink-soft">
                Changing it signs out every other phone and computer. Share the
                new one with whoever else adds to the journals.
              </p>
              <ChangePasscodeForm />
            </section>
          </div>
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
