import { ageLabel, cardDate, chapterFor, longDate, monthRange } from "./age";
import { between, pick, seeded } from "./decor";
import {
  SHEETS,
  STICKERS,
  TONES,
  type Sheet,
  type StickerName,
  type Tone,
} from "./palette";
import type { Journal, Memory } from "./types";

/** A memory plus everything needed to lay it on the page, decided once on the server. */
export type Placed = Memory & {
  age: string;
  dateLong: string;
  dateCard: string;
  /** Resting tilt in degrees. */
  tilt: number;
  /** Vertical nudge in px, so rows don't line up like a grid. */
  nudge: number;
  tone: Tone;
  tapeSide: "left" | "centre" | "right";
};

export type Chapter = {
  id: string;
  title: string;
  tab: string;
  range: string;
  sheet: Sheet;
  stickers: [StickerName, StickerName];
  items: Placed[];
};

/** Groups a journal into age chapters and gives each entry its hand-placed look. */
export function buildChapters({ child, memories }: Journal): Chapter[] {
  const groups = new Map<
    number,
    { title: string; tab: string; items: Memory[] }
  >();
  for (const memory of memories) {
    const info = chapterFor(child.birthDate, memory.happenedOn);
    const group = groups.get(info.key) ?? {
      title: info.title,
      tab: info.tab,
      items: [],
    };
    group.items.push(memory);
    groups.set(info.key, group);
  }

  // One shuffled run of the sticker sheet per journal, dealt two to a chapter, so neighbours never match.
  const deal = seeded(child.id);
  const sheet = [...STICKERS].sort(() => deal() - 0.5);

  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([key, group], index) => {
      const first = sheet[(index * 2) % sheet.length];
      const second = sheet[(index * 2 + 1) % sheet.length];
      return {
        id: `chapter-${key < 0 ? "before" : key}`,
        title: group.title,
        tab: group.tab,
        range: monthRange(group.items.map((m) => m.happenedOn)),
        sheet: SHEETS[index % SHEETS.length],
        stickers: [first, second],
        items: group.items.map((memory): Placed => {
          const r = seeded(memory.id);
          const lean = between(r, 1.2, 3.6);
          return {
            ...memory,
            age: ageLabel(child.birthDate, memory.happenedOn),
            dateLong: longDate(memory.happenedOn),
            dateCard: cardDate(memory.happenedOn),
            tilt: r() > 0.5 ? lean : -lean,
            nudge: Math.round(between(r, -14, 22)),
            tone: pick(r, TONES),
            tapeSide: pick(r, ["left", "centre", "right"] as const),
          };
        }),
      };
    });
}

/**
 * The sheet colour an entry dated `date` would land on, given the chapters a
 * journal already has. Used to preview a new entry on the right paper.
 */
export function sheetForDate(
  birthDate: string,
  existingKeys: number[],
  date: string,
): Sheet {
  const key = chapterFor(birthDate, date).key;
  const keys = [...new Set([...existingKeys, key])].sort((a, b) => a - b);
  return SHEETS[keys.indexOf(key) % SHEETS.length];
}

/** The chapter keys a journal already has, oldest first. */
export function chapterKeys({ child, memories }: Journal): number[] {
  return [
    ...new Set(
      memories.map((m) => chapterFor(child.birthDate, m.happenedOn).key),
    ),
  ].sort((a, b) => a - b);
}
