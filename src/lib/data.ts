import { asc, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db, schema } from "@/db";
import { demo } from "./demo-data";
import { isDemo } from "./env";
import {
  COVER_COLORS,
  MEMORY_KINDS,
  type Child,
  type CoverColor,
  type Journal,
  type Media,
  type Memory,
  type MemoryKind,
  type Song,
} from "./types";

/** Every read is cached under this tag; every write expires it. */
export const JOURNAL_TAG = "journal";

type MemoryRow = typeof schema.memories.$inferSelect;
type SongRow = typeof schema.songs.$inferSelect;

function toMedia(row: MemoryRow): Media | null {
  if (!row.mediaUrl || !row.mediaWidth || !row.mediaHeight) return null;
  return {
    kind: row.mediaType === "video" ? "video" : "image",
    src: row.mediaUrl,
    width: row.mediaWidth,
    height: row.mediaHeight,
  };
}

function toMemory(row: MemoryRow): Memory {
  const kind = (MEMORY_KINDS as readonly string[]).includes(row.kind)
    ? (row.kind as MemoryKind)
    : "note";
  return {
    id: row.id,
    childId: row.childId,
    kind,
    title: row.title,
    body: row.body,
    author: row.author,
    happenedOn: row.happenedOn,
    media: toMedia(row),
    songUrl: row.songUrl,
  };
}

function toSong(row: SongRow): Song {
  return {
    id: row.id,
    childId: row.childId,
    url: row.url,
    title: row.title,
    note: row.note,
    thumbnail: row.thumbnail,
  };
}

function toCoverColor(value: string): CoverColor {
  return (COVER_COLORS as readonly string[]).includes(value)
    ? (value as CoverColor)
    : "tomato";
}

export async function getChildren(): Promise<Child[]> {
  "use cache";
  cacheTag(JOURNAL_TAG);
  cacheLife("hours");
  if (isDemo) return demo.children;

  const [childRows, memoryRows] = await Promise.all([
    db().select().from(schema.children).orderBy(asc(schema.children.birthDate)),
    db()
      .select()
      .from(schema.memories)
      .orderBy(asc(schema.memories.happenedOn)),
  ]);

  return childRows.map((child) => {
    const own = memoryRows.filter((m) => m.childId === child.id);
    const cover = own.find((m) => m.mediaType === "image");
    return {
      id: child.id,
      slug: child.slug,
      name: child.name,
      birthDate: child.birthDate,
      coverColor: toCoverColor(child.coverColor),
      coverPhoto: cover ? toMedia(cover) : null,
      memoryCount: own.length,
    };
  });
}

export async function getJournal(slug: string): Promise<Journal | null> {
  "use cache";
  cacheTag(JOURNAL_TAG);
  cacheLife("hours");
  if (isDemo) return demo.journal(slug);

  const child = (await getChildren()).find((c) => c.slug === slug);
  if (!child) return null;

  const [memoryRows, songRows] = await Promise.all([
    db()
      .select()
      .from(schema.memories)
      .where(eq(schema.memories.childId, child.id))
      .orderBy(asc(schema.memories.happenedOn), asc(schema.memories.createdAt)),
    db()
      .select()
      .from(schema.songs)
      .where(eq(schema.songs.childId, child.id))
      .orderBy(asc(schema.songs.createdAt)),
  ]);

  return {
    child,
    memories: memoryRows.map(toMemory),
    songs: songRows.map(toSong),
  };
}

export type RecentEntries = { memories: Memory[]; songs: Song[] };

/** The latest entries across every journal, for the parents' tidy-up list. */
export async function getRecentEntries(): Promise<RecentEntries> {
  "use cache";
  cacheTag(JOURNAL_TAG);
  cacheLife("hours");
  if (isDemo) {
    return { memories: demo.memories.slice(-8).reverse(), songs: demo.songs };
  }

  const [memoryRows, songRows] = await Promise.all([
    db()
      .select()
      .from(schema.memories)
      .orderBy(desc(schema.memories.createdAt))
      .limit(30),
    db()
      .select()
      .from(schema.songs)
      .orderBy(desc(schema.songs.createdAt))
      .limit(30),
  ]);
  return { memories: memoryRows.map(toMemory), songs: songRows.map(toSong) };
}
