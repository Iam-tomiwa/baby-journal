"use client";

import {
  Film,
  Image as ImageIcon,
  Music,
  NotebookPen,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteMemory, deleteSong } from "@/app/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { longDate } from "@/lib/age";
import type { Child, Memory, Song } from "@/lib/types";

const KIND_ICON = {
  photo: ImageIcon,
  video: Film,
  milestone: Sparkles,
  note: NotebookPen,
} as const;

type Target = { type: "memory" | "song"; id: string; title: string };

/** The latest entries, each removable. Removing is the only edit there is, so it asks first. */
export function EntryList({
  memories,
  songs,
  childrenById,
}: {
  memories: Memory[];
  songs: Song[];
  childrenById: Record<string, Child | undefined>;
}) {
  const [target, setTarget] = useState<Target | null>(null);
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!target) return;
    const { type, id } = target;
    startTransition(async () => {
      const result =
        type === "memory" ? await deleteMemory(id) : await deleteSong(id);
      if (result?.ok) toast.success(result.message);
      else
        toast.error(result?.message ?? "That couldn't be removed. Try again.");
      setTarget(null);
    });
  }

  if (memories.length === 0 && songs.length === 0) {
    return (
      <p className="text-base text-ink-soft">
        Nothing added yet. Your newest entries will be listed here.
      </p>
    );
  }

  const rows = [
    ...memories.map((memory) => ({
      key: `m-${memory.id}`,
      Icon: KIND_ICON[memory.kind],
      title:
        memory.kind === "note" ? (memory.body ?? memory.title) : memory.title,
      detail: `${childrenById[memory.childId]?.name ?? "Journal"}, ${longDate(memory.happenedOn)}`,
      target: {
        type: "memory",
        id: memory.id,
        title: memory.title,
      } satisfies Target,
    })),
    ...songs.map((song) => ({
      key: `s-${song.id}`,
      Icon: Music,
      title: song.title,
      detail: `${childrenById[song.childId]?.name ?? "Journal"}'s mixtape`,
      target: { type: "song", id: song.id, title: song.title } satisfies Target,
    })),
  ];

  return (
    <>
      <ul className="divide-y divide-border border-y border-border">
        {rows.map(({ key, Icon, title, detail, target: rowTarget }) => (
          <li key={key} className="flex items-center gap-4 py-3">
            <Icon
              aria-hidden="true"
              className="size-5 shrink-0 text-ink-soft"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-medium text-ink">{title}</p>
              <p className="truncate text-sm text-ink-soft">{detail}</p>
            </div>
            <button
              type="button"
              onClick={() => setTarget(rowTarget)}
              aria-label={`Remove ${rowTarget.title}`}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 aria-hidden="true" className="size-5" />
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={target !== null}
        onOpenChange={(open) => (open ? null : setTarget(null))}
      >
        <DialogContent className="gap-5 rounded-2xl p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-ink">
              Remove &ldquo;{target?.title}&rdquo;?
            </DialogTitle>
            <DialogDescription className="text-base text-ink-soft">
              {target?.type === "song"
                ? "It comes off the mixtape. You can paste the link again later."
                : "It comes out of the journal, and its photo or video is deleted for good."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <button
              type="button"
              onClick={() => setTarget(null)}
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-ink px-5 text-base font-semibold text-ink"
            >
              Keep it
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-destructive px-5 text-base font-semibold text-paper disabled:opacity-50"
            >
              {pending ? "Removing…" : "Remove it"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
