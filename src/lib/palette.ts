/** The journal's fixed vocabulary of colours and stickers. Values live in globals.css. */
export const SHEETS = ["sky", "butter", "rose", "mint", "lilac"] as const;
export type Sheet = (typeof SHEETS)[number];

export const TONES = ["tomato", "cobalt", "marigold", "leaf", "plum"] as const;
export type Tone = (typeof TONES)[number];

export const STICKERS = [
  "star",
  "heart",
  "moon",
  "sun",
  "cloud",
  "rainbow",
  "balloon",
  "duck",
  "flower",
] as const;
export type StickerName = (typeof STICKERS)[number];
