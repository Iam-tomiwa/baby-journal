import type { Journal, Media, Memory, Song } from "./types";

/**
 * The sample journal shown at /demo. It is static: nothing here touches the
 * database. Photographs are stock images from Unsplash; names and captions are invented.
 */
const photo = (id: string, width: number, height: number): Media => ({
  kind: "image",
  src: `https://images.unsplash.com/photo-${id}`,
  width,
  height,
});

const ANGEL = "demo-angel";

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

/**
 * JVKE's "her" (feat. ZVC) on Spotify: the journal's own song and the first tape.
 * It plays as audio, and starts at 0:50 (where ZVC's verse comes in) for
 * listeners signed in to Spotify; others hear Spotify's own preview clip.
 */
const HER = "https://open.spotify.com/track/5YdQdAZHSyjp7S85Tzyjeq#t=50";
const COVER_PHOTO = "1590601689970-c298e8bddf12";

const angelMemories = build(ANGEL, [
  {
    kind: "photo",
    title: "Dad says hello",
    body: "He talked to you through the bump every single night.",
    happenedOn: "2026-01-18",
    media: photo("1512094476718-4d8f19366c62", 2848, 4272),
  },
  {
    kind: "note",
    title: "A note before you came",
    body: "The cot is built, the bag is packed, and your dad has practised the car seat four times. We are so ready to meet you.",
    author: "Mum",
    happenedOn: "2026-01-24",
  },
  {
    kind: "milestone",
    title: "Hello, world",
    body: "3.4 kg, 5:12 in the morning.",
    happenedOn: "2026-02-03",
  },
  {
    kind: "photo",
    title: "Fast asleep, day three",
    body: "Wrapped up like a little parcel.",
    happenedOn: "2026-02-05",
    media: photo("1583086762675-5a88bcc72548", 5408, 3600),
    songUrl: HER,
  },
  {
    kind: "photo",
    title: "Wide awake, not impressed",
    happenedOn: "2026-02-20",
    media: photo("1547082722-ebad0c0cb815", 3840, 2160),
  },
  {
    kind: "photo",
    title: "Asleep on Mum's shoulder",
    happenedOn: "2026-03-15",
    media: photo("1548783102-9eed000b70ef", 16000, 9000),
  },
  {
    kind: "note",
    title: "Three in the morning",
    body: "You only sleep on my chest this week. I should mind more than I do.",
    author: "Dad",
    happenedOn: "2026-03-21",
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
    title: "Mum and her girl",
    happenedOn: "2026-05-10",
    media: photo("1591451855781-9eb0f9726a33", 5168, 2912),
  },
  {
    kind: "milestone",
    title: "First laugh",
    body: "Dad sneezed. You lost it.",
    happenedOn: "2026-05-30",
  },
  {
    kind: "photo",
    title: "The flower dress",
    body: "Sunday best, and she knew it.",
    happenedOn: "2026-07-08",
    media: photo("1555093279-99bf405fe600", 3648, 4560),
  },
  {
    kind: "milestone",
    title: "Rolled over",
    body: "Then looked very surprised about it.",
    happenedOn: "2026-07-19",
  },
  {
    kind: "photo",
    title: "First hair bobbles",
    body: "Sat still for all four. A miracle.",
    happenedOn: "2026-09-27",
    media: photo(COVER_PHOTO, 3024, 4032),
  },
  { kind: "milestone", title: "First tooth", happenedOn: "2026-10-06" },
  {
    kind: "photo",
    title: "Best shoes in the house",
    happenedOn: "2026-11-08",
    media: photo("1637230870581-b70067e5ecd0", 6000, 4000),
  },
  {
    kind: "note",
    title: "Nine months in",
    body: "You have been out in the world as long as you were in. You wave at buses now. Every single one.",
    author: "Mum",
    happenedOn: "2026-11-10",
  },
]);

const songs: Song[] = [
  {
    id: "demo-song-1",
    childId: ANGEL,
    url: HER,
    title: "her (feat. ZVC)",
    note: "The one we played the day we brought you home.",
    thumbnail: null,
  },
  {
    id: "demo-song-2",
    childId: ANGEL,
    url: "https://open.spotify.com/playlist/2gcM490lCenbhytuOFlKK6",
    title: "Baby Nursery Rhymes",
    note: "Bath time, car rides, every single nappy change.",
    thumbnail: null,
  },
  {
    id: "demo-song-3",
    childId: ANGEL,
    url: "https://open.spotify.com/playlist/3gU7D5fjxe2Lx8YwNFwNwC",
    title: "Baby Sleep Aid: Gentle Lullabies",
    note: "Our 3am feeding playlist.",
    thumbnail: null,
  },
];

export const demoJournal: Journal = {
  child: {
    id: ANGEL,
    slug: "demo",
    name: "Angel",
    birthDate: "2026-02-03",
    coverColor: "tomato",
    coverPhoto: photo(COVER_PHOTO, 3024, 4032),
    memoryCount: angelMemories.length,
  },
  memories: angelMemories,
  songs,
};
