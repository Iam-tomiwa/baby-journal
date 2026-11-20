# Baby journal

A family baby journal that behaves like the physical book: a cloth cover you open, then one sheet of coloured paper per age with photos, videos, firsts and handwritten notes stuck in, and a mixtape of the songs that went with them, kept on a floating music button.

- **Next.js 16** (App Router, Cache Components), **React 19**, **Tailwind CSS 4**, **shadcn/ui**
- **Motion** for the cover opening, the prints settling onto the page and the reader
- **Neon Postgres** through **Drizzle ORM**
- **Cloudinary** for storing, resizing and streaming photos and videos

## Run it

```bash
pnpm install
pnpm dev
```

A static **sample journal** (stock photos, invented names) is always available at `/demo`. The shelf at `/` shows only your own journals, and an empty state until the first one is started.

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
| `/demo` | A static sample journal; never touches the database |
| `/[child]` | A journal: cover, age chapters, and a floating mixtape button. Public to anyone with the link |
| `/parents` | The parents' desk: add a photo or video, a first, a note, a song, or a new journal. Passcode protected |

- `src/db/schema.ts` has three tables: `children`, `memories`, `songs`.
- `src/lib/data.ts` holds every read. Each is cached with `use cache` under one tag; every server action in `src/app/actions.ts` expires that tag, so a new memory appears immediately.
- The photo form takes up to 12 photos or videos at once. Each gets its own caption and becomes its own memory; they share one date. A story or a song can be attached when a single file is added.
- Uploads go from the browser straight to Cloudinary. The server only signs the request (`getUploadTicket`) and stores the returned URL and dimensions.
- `src/lib/image-loader.ts` is the `next/image` loader: Cloudinary picks the format and size for each screen.
- `src/lib/chapters.ts` groups memories by the child's age and gives each one its tilt, tape and colour from a seeded random, so pages look hand-arranged but render identically on server and client.
- The parents' desk opens a five-step walkthrough the first time a parent visits (remembered in the browser) and again from "How this works" (`src/components/parents/walkthrough.tsx`).
- Songs (`src/lib/songs.ts`, `src/components/journal/use-song-engine.ts`) come from three places:
  - **Spotify links** play as audio through Spotify's embed controller. Visitors signed in to Spotify hear the full song; everyone else hears Spotify's ~30-second preview.
  - **Uploaded recordings** (an audio file sent to Cloudinary from the Song form) play in full for everyone through an `<audio>` element. Upload only recordings you made or have the right to share.
  - **YouTube links** still work, as a video player.
  - A start time is kept on the link as `#t=50`. Opening a journal starts its first song; browsers only allow sound after a tap, click or key press, so a reader who scrolls in without touching anything hears it on their first tap.

## Installable app (PWA)

The journal can be installed to a phone's home screen or a desktop dock.

- `src/app/manifest.ts` is the web app manifest; names come from `src/lib/site.ts`.
- The logo is `public/icons/logo.svg` (also `src/app/icon.svg`). `icon-192.png`, `icon-512.png`, `maskable-512.png`, `src/app/apple-icon.png` and `src/app/favicon.ico` are rendered from it.
- `public/sw.js` is the service worker. Pages are fetched fresh when there is a connection and fall back to the last copy seen, then to `/offline`. Photos, videos and the parents' desk are never cached by it.
- `src/components/install-prompt.tsx` offers to install the journal after about 12 seconds on a page. Where the browser supports it (Chrome, Edge, Android) its button installs directly; on iPhone and iPad it shows the Share → Add to Home Screen steps. It never shows once installed, and stays away for 30 days after "Not now".
- The service worker only registers in production builds (`pnpm build && pnpm start`, or a deployment), and installing needs HTTPS or localhost.

## Motion

Animations use `transform` and `opacity` only, load the Motion feature bundle lazily (`LazyMotion`), and respect the reduced-motion system setting: the cover becomes a static first screen and entries fade in without movement.

## Passcode and deleting journals

Both are at the bottom of the parents' desk.

- **Parent passcode.** `PARENT_PASSCODE` in the environment is the starting passcode. Changing it in the app stores a salted scrypt hash in the `settings` table, which then takes over; the environment value is ignored from then on. Every other signed-in device is signed out.
- **Forgotten passcode.** Delete the `parent_passcode` row from the `settings` table (Neon console, SQL editor: `delete from settings where key = 'parent_passcode';`). The environment passcode works again.
- **Deleting a journal** asks you to type the child's name, then removes the child, every memory and song, and their files on Cloudinary. It cannot be undone.

## Not built yet

- Editing an entry (remove it and add it again).
- Choosing the cover photo by hand; it uses the earliest photo in the journal.
- Rate limiting on the passcode form beyond a short delay.

## Sample journal credits

The sample journal in `src/lib/demo-data.ts` is not real family content. Its photographs are hot-linked stock images from Unsplash (`images.unsplash.com/photo-…`, used under the Unsplash licence), its one video is Cloudinary's public demo clip (`res.cloudinary.com/demo/video/upload/dog.mp4`), and its names, dates and captions are invented. It is shown only at `/demo`.
