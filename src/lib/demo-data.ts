import type { Child, Journal, Media, Memory, Song } from "./types";

/**
 * The sample journal shown until a database is connected. Photographs are
 * stock images from Unsplash; names and captions are invented.
 */
const photo = (id: string, width: number, height: number): Media => ({
  kind: "image",
  src: `https://images.unsplash.com/photo-${id}`,
  width,
  height,
});

const ZURI = "demo-zuri";
const TOBI = "demo-tobi";

type Draft = Omit<
  Memory,
  "id" | "childId" | "body" | "author" | "media" | "songUrl"
> &
  Partial<Pick<Memory, "body" | "author" | "media" | "songUrl">>;

const build = (childId: string, drafts: Draft[]): Memory[] =>
  drafts.map((d, i) => ({
    body: null,
    author: null,
    media: null,
    songUrl: null,
    ...d,
    id: `${childId}-${i + 1}`,
    childId,
  }));

const zuriMemories = build(ZURI, [
  {
    kind: "note",
    title: "A note before you came",
    body: "The cot is built, the bag is packed, and your dad has practised the car seat four times. We are so ready to meet you.",
    author: "Mum",
    happenedOn: "2026-01-24",
  },
  {
    kind: "photo",
    title: "Ten tiny toes",
    body: "Counted them twice, just to be sure.",
    happenedOn: "2026-02-03",
    media: photo("1510154221590-ff63e90a136f", 5184, 3456),
  },
  {
    kind: "milestone",
    title: "Hello, world",
    body: "3.4 kg, 5:12 in the morning.",
    happenedOn: "2026-02-03",
  },
  {
    kind: "photo",
    title: "You held on tight",
    happenedOn: "2026-02-05",
    media: photo("1470116945706-e6bf5d5a53ca", 4000, 3000),
  },
  {
    kind: "photo",
    title: "Grandma's knitted hat",
    body: "She started it the day we told her.",
    happenedOn: "2026-02-16",
    media: photo("1604917621956-10dfa7cce2e7", 3585, 5751),
    songUrl: "https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2",
  },
  {
    kind: "photo",
    title: "The biggest yawn",
    happenedOn: "2026-03-09",
    media: photo("1480985041486-c65b20c01d1f", 4928, 3264),
  },
  {
    kind: "note",
    title: "Three in the morning",
    body: "You only sleep on my chest this week. I should mind more than I do.",
    author: "Dad",
    happenedOn: "2026-03-21",
  },
  {
    kind: "photo",
    title: "The three of us",
    happenedOn: "2026-04-11",
    media: photo("1543342384-1f1350e27861", 3712, 5568),
  },
  {
    kind: "milestone",
    title: "First smile",
    body: "At the ceiling fan. We'll take it.",
    happenedOn: "2026-04-14",
  },
  {
    kind: "video",
    title: "Biscuit keeps watch",
    body: "He has not left the side of your basket since you came home.",
    happenedOn: "2026-04-26",
    media: {
      kind: "video",
      src: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
      width: 1280,
      height: 720,
    },
  },
  {
    kind: "photo",
    title: "Tummy time champion",
    happenedOn: "2026-05-12",
    media: photo("1608365151231-7dbed3034787", 5184, 3456),
  },
  {
    kind: "milestone",
    title: "First laugh",
    body: "Dad sneezed. You lost it.",
    happenedOn: "2026-05-30",
  },
  {
    kind: "photo",
    title: "The heart onesie",
    body: "Outgrown nine days later.",
    happenedOn: "2026-06-21",
    media: photo("1617268604962-a2878c372cc7", 5304, 7952),
  },
  {
    kind: "photo",
    title: "Dreaming of milk",
    happenedOn: "2026-07-08",
    media: photo("1649880210584-3365f4c4c08b", 3800, 5700),
  },
  {
    kind: "milestone",
    title: "Rolled over",
    body: "Then looked very surprised about it.",
    happenedOn: "2026-07-19",
  },
  {
    kind: "photo",
    title: "Off across the lawn",
    body: "Nothing is safe now.",
    happenedOn: "2026-09-27",
    media: photo("1571211468362-33f20cb1982f", 3648, 5472),
  },
  { kind: "milestone", title: "First tooth", happenedOn: "2026-10-06" },
  {
    kind: "photo",
    title: "Best shoes in the house",
    happenedOn: "2026-11-08",
    media: photo("1608093602519-ccd31f515f83", 5464, 8192),
  },
  {
    kind: "note",
    title: "Nine months in",
    body: "You have been out in the world as long as you were in. You wave at buses now. Every single one.",
    author: "Mum",
    happenedOn: "2026-11-10",
  },
]);

const tobiMemories = build(TOBI, [
  {
    kind: "milestone",
    title: "First steps",
    body: "Four of them, from the sofa to Auntie Kemi.",
    happenedOn: "2025-09-02",
  },
  {
    kind: "photo",
    title: "Walking everywhere now",
    happenedOn: "2025-10-18",
    media: photo("1598427448556-03e1e3279bd3", 4000, 6000),
  },
  {
    kind: "photo",
    title: "The yellow cup phase",
    body: "No other cup will do.",
    happenedOn: "2026-01-11",
    media: photo("1600880291319-1a7499c191e8", 5304, 7952),
  },
  {
    kind: "milestone",
    title: "First word",
    body: 'It was "ball". Obviously.',
    happenedOn: "2026-02-20",
  },
  {
    kind: "photo",
    title: "Found the flowers",
    happenedOn: "2026-05-23",
    media: photo("1526864972308-bf02b0c2ab8c", 4929, 4000),
  },
  {
    kind: "note",
    title: "Big brother",
    body: 'You kissed Zuri\'s head today and whispered "mine". We will work on sharing.',
    author: "Dad",
    happenedOn: "2026-06-02",
  },
  {
    kind: "photo",
    title: "Your favourite tree",
    happenedOn: "2026-09-14",
    media: photo("1543636200-64e72565dc16", 3884, 2600),
  },
]);

const yt = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

const songs: Song[] = [
  {
    id: "demo-song-1",
    childId: ZURI,
    url: "https://open.spotify.com/track/6dGnYIeXmHdcikdzNNDMm2",
    title: "Here Comes the Sun",
    note: "Playing in the car on the way home from hospital.",
    thumbnail: null,
  },
  {
    id: "demo-song-2",
    childId: ZURI,
    url: "https://www.youtube.com/watch?v=yCjJyiqpAuU",
    title: "Twinkle Twinkle Little Star",
    note: "The only thing that works at bath time.",
    thumbnail: yt("yCjJyiqpAuU"),
  },
  {
    id: "demo-song-3",
    childId: ZURI,
    url: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO",
    title: "Peaceful Piano",
    note: "Our 3am feeding playlist.",
    thumbnail: null,
  },
  {
    id: "demo-song-4",
    childId: TOBI,
    url: "https://www.youtube.com/watch?v=zaGUr6wzyT8",
    title: "Three Little Birds",
    note: "You dance to this one with your whole body.",
    thumbnail: yt("zaGUr6wzyT8"),
  },
];

const firstPhoto = (memories: Memory[]): Media | null =>
  memories.find((m) => m.media?.kind === "image")?.media ?? null;

const children: Child[] = [
  {
    id: ZURI,
    slug: "zuri",
    name: "Zuri",
    birthDate: "2026-02-03",
    coverColor: "tomato",
    coverPhoto: zuriMemories[12].media,
    memoryCount: zuriMemories.length,
  },
  {
    id: TOBI,
    slug: "tobi",
    name: "Tobi",
    birthDate: "2024-08-19",
    coverColor: "cobalt",
    coverPhoto: firstPhoto(tobiMemories),
    memoryCount: tobiMemories.length,
  },
];

const allMemories = [...zuriMemories, ...tobiMemories];

export const demo = {
  children,
  journal(slug: string): Journal | null {
    const child = children.find((c) => c.slug === slug);
    if (!child) return null;
    return {
      child,
      memories: allMemories.filter((m) => m.childId === child.id),
      songs: songs.filter((s) => s.childId === child.id),
    };
  },
  memories: allMemories,
  songs,
};
