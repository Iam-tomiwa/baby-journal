# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, shadcn/ui (Base UI), Motion, Drizzle ORM on Neon Postgres, Cloudinary for photo and video storage and delivery. Chosen by the owner.

## Users

Parents keeping a journal for their children, usually on a phone in spare minutes, and the family and friends they share the link with (grandparents on tablets and desktops included).

## Product Purpose

A private-feeling family baby journal on the web that behaves like the physical book parents would otherwise keep: photos, videos, milestone "firsts", written notes, and the songs that belonged to that time. Success is a parent adding a memory in under a minute and a relative happily reading the whole journal from a shared link.

## Positioning

It is a book per child, read by age, rather than a photo feed or a shared album.

## Operating Context

- Anyone with the link can read a journal. Only parents holding the parent passcode can add or remove entries.
- Several children, each with their own journal and cover colour.
- Readers open a cover, then scroll through chapters grouped by the child's age, with an index to jump between chapters.
- Songs: a per-journal mixtape of YouTube or Spotify links, and an optional song attached to a single memory.

## Capabilities and Constraints

- Entry types: photo, video, milestone, written note, song. A song is a Spotify or YouTube link, or an uploaded audio recording. No growth measurements and no parent-chosen stickers (declined by the owner).
- Up to 12 photos or videos can be added in one pass; each is its own memory with its own caption, sharing one date.
- Media is uploaded straight from the browser to Cloudinary with a signed request; the database stores only the delivery URL and dimensions.
- A static sample journal lives at `/demo`. The shelf shows only real journals, with an empty state before the first one.
- Editing an existing entry is not built yet; entries can be removed and re-added.

## Brand Commitments

- It should simulate a physical baby journal.
- Joyful and animated, with motion that stays smooth on phones, tablets and desktops.
- References supplied by the owner: a collage "Moments" phone app and the "Memory Lane" landing page (tilted prints, handwritten captions, die-cut stickers, coloured date cards).

## Evidence on Hand

No real family content yet. The sample journal at `/demo` uses stock photographs from Unsplash and one Cloudinary demo video, labelled as a sample; the names and captions in it are invented.

## Product Principles

1. The journal is the child's book: everything is organised by their age, not by upload date.
2. Adding a memory must be quicker than finding a pen.
3. Readers never need an account.
4. The family's media stays the family's: nothing is shown that a parent did not add.

## Accessibility & Inclusion

Honour reduced-motion preferences; keyboard access to every memory and control; text contrast of at least 4.5:1.
