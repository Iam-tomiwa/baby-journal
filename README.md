# Baby journal

A family baby journal that behaves like the physical book: a cloth cover you open, then one sheet of coloured paper per age with photos, videos, firsts and handwritten notes stuck in, and a mixtape of the songs that went with them.

- **Next.js 16** (App Router, Cache Components), **React 19**, **Tailwind CSS 4**, **shadcn/ui**
- **Motion** for the cover opening, the prints settling onto the page and the reader
- **Neon Postgres** through **Drizzle ORM**
- **Cloudinary** for storing, resizing and streaming photos and videos

## Run it

```bash
pnpm install
pnpm dev
```

With no keys set, the app serves a read-only **sample journal** (stock photos, invented names) so you can see everything working straight away.

## Connect your own data

1. Copy the template: `cp .env.example .env.local`
2. **Neon**: create a project at console.neon.tech and paste the pooled connection string into `DATABASE_URL`.
3. **Cloudinary**: from Settings → API Keys, fill in `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. No upload preset is needed; uploads are signed by the server.
4. Choose a `PARENT_PASSCODE` and set a long random `SESSION_SECRET` (`openssl rand -base64 32`).
5. Create the tables: `pnpm db:push`
6. Restart `pnpm dev`, open `/parents`, enter the passcode and start the first journal.

## How it fits together

| Route | What it is |
| --- | --- |
| `/` | The shelf: one book per child |
| `/[child]` | A journal: cover, age chapters, mixtape. Public to anyone with the link |
| `/parents` | The parents' desk: add a photo or video, a first, a note, a song, or a new journal. Passcode protected |

- `src/db/schema.ts` has three tables: `children`, `memories`, `songs`.
- `src/lib/data.ts` holds every read. Each is cached with `use cache` under one tag; every server action in `src/app/actions.ts` expires that tag, so a new memory appears immediately.
- The photo form takes up to 12 photos or videos at once. Each gets its own caption and becomes its own memory; they share one date. A story or a song can be attached when a single file is added.
- Uploads go from the browser straight to Cloudinary. The server only signs the request (`getUploadTicket`) and stores the returned URL and dimensions.
- `src/lib/image-loader.ts` is the `next/image` loader: Cloudinary picks the format and size for each screen.
- `src/lib/chapters.ts` groups memories by the child's age and gives each one its tilt, tape and colour from a seeded random, so pages look hand-arranged but render identically on server and client.
- The parents' desk opens a five-step walkthrough the first time a parent visits (remembered in the browser) and again from "How this works" (`src/components/parents/walkthrough.tsx`).
- Songs accept YouTube and Spotify links for single tracks or playlists (`src/lib/songs.ts`). Players load only when someone presses play.

## Motion

Animations use `transform` and `opacity` only, load the Motion feature bundle lazily (`LazyMotion`), and respect the reduced-motion system setting: the cover becomes a static first screen and entries fade in without movement.

## Not built yet

- Editing an entry (remove it and add it again).
- Choosing the cover photo by hand; it uses the earliest photo in the journal.
- Rate limiting on the passcode form beyond a short delay.

## Sample journal credits

The sample journal in `src/lib/demo-data.ts` is not real family content. Its photographs are hot-linked stock images from Unsplash (`images.unsplash.com/photo-…`, used under the Unsplash licence), its one video is Cloudinary's public demo clip (`res.cloudinary.com/demo/video/upload/dog.mp4`), and its names, dates and captions are invented. It disappears as soon as `DATABASE_URL` is set.
