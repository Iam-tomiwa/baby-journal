export const COVER_COLORS = [
  "tomato",
  "cobalt",
  "marigold",
  "leaf",
  "plum",
] as const;
export type CoverColor = (typeof COVER_COLORS)[number];

export const MEMORY_KINDS = ["photo", "video", "milestone", "note"] as const;
export type MemoryKind = (typeof MEMORY_KINDS)[number];

export type Media = {
  kind: "image" | "video";
  /** Delivery URL without transformations. */
  src: string;
  width: number;
  height: number;
};

export type Child = {
  id: string;
  slug: string;
  name: string;
  /** ISO date, YYYY-MM-DD */
  birthDate: string;
  coverColor: CoverColor;
  coverPhoto: Media | null;
  memoryCount: number;
};

export type Memory = {
  id: string;
  childId: string;
  kind: MemoryKind;
  title: string;
  body: string | null;
  author: string | null;
  /** ISO date, YYYY-MM-DD */
  happenedOn: string;
  media: Media | null;
  songUrl: string | null;
};

export type Song = {
  id: string;
  childId: string;
  url: string;
  title: string;
  note: string | null;
  thumbnail: string | null;
};

export type Journal = {
  child: Child;
  memories: Memory[];
  songs: Song[];
};

export type ActionState = { ok: boolean; message: string } | null;
