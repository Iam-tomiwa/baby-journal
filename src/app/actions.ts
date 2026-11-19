"use server";

import { v2 as cloudinary } from "cloudinary";
import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/db";
import { JOURNAL_TAG } from "@/lib/data";
import { hasCloudinary, hasDatabase } from "@/lib/env";
import {
  endParentSession,
  isParent,
  passcodeMatches,
  startParentSession,
} from "@/lib/session";
import { oembedUrl, parseSongUrl } from "@/lib/songs";
import { COVER_COLORS, type ActionState } from "@/lib/types";

const NO_DATABASE_MESSAGE =
  "The database isn't connected yet. Add DATABASE_URL to .env.local and restart to start saving.";
const LOCKED_MESSAGE =
  "Your parent session has ended. Enter the passcode again.";
const UPLOAD_FOLDER = "baby-journal";

const fail = (message: string): ActionState => ({ ok: false, message });
const done = (message: string): ActionState => ({ ok: true, message });

/** Every write goes through this: no database, or no parent session, means no write. */
async function guard(): Promise<ActionState> {
  if (!hasDatabase) return fail(NO_DATABASE_MESSAGE);
  if (!(await isParent())) return fail(LOCKED_MESSAGE);
  return null;
}

function firstIssue(error: z.ZodError): ActionState {
  return fail(
    error.issues[0]?.message ?? "Something in the form needs another look.",
  );
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v));

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick the date this happened.");

// ---------------------------------------------------------------- session

export async function unlock(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const attempt = String(formData.get("passcode") ?? "");
  if (!passcodeMatches(attempt)) {
    // Slow down guessing a little.
    await new Promise((resolve) => setTimeout(resolve, 700));
    return fail(
      "That passcode doesn't match. Check with whoever set up the journal.",
    );
  }
  await startParentSession();
  return done("Welcome back.");
}

export async function lock(): Promise<void> {
  await endParentSession();
}

// ----------------------------------------------------------------- upload

export type UploadTicket =
  | { ok: false; message: string }
  | {
      ok: true;
      cloudName: string;
      apiKey: string;
      timestamp: number;
      folder: string;
      signature: string;
    };

/** Signs one direct browser-to-Cloudinary upload, so the API secret never leaves the server. */
export async function getUploadTicket(): Promise<UploadTicket> {
  const blocked = await guard();
  if (blocked) return { ok: false, message: blocked.message };
  if (!hasCloudinary) {
    return {
      ok: false,
      message: "Cloudinary keys are missing from .env.local.",
    };
  }
  configureCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: UPLOAD_FOLDER },
    process.env.CLOUDINARY_API_SECRET!,
  );
  return {
    ok: true,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    folder: UPLOAD_FOLDER,
    signature,
  };
}

// --------------------------------------------------------------- memories

const mediaSchema = z.object({
  publicId: z.string().min(1).max(300),
  url: z.url(),
  type: z.enum(["image", "video"]),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/** A photo or video with its own caption; several can be added in one go. */
const captionedMediaSchema = mediaSchema.extend({
  title: z
    .string()
    .trim()
    .min(1, "Give every photo and video a caption.")
    .max(80, "Keep captions under 80 characters."),
});
const MAX_MEDIA = 12;

const memorySchema = z.object({
  childId: z.uuid("Choose whose journal this goes in."),
  kind: z.enum(["media", "milestone", "note"]),
  title: z
    .string()
    .trim()
    .max(80, "Keep the caption under 80 characters.")
    .default(""),
  body: optionalText(600),
  author: optionalText(40),
  happenedOn: isoDate,
  songUrl: optionalText(300),
  media: z.string().optional(),
});

export async function createMemory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;

  const parsed = memorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return firstIssue(parsed.error);
  const input = parsed.data;

  if (input.songUrl && !parseSongUrl(input.songUrl)) {
    return fail("That song link isn't a YouTube or Spotify link.");
  }

  if (input.kind === "media") {
    let raw: unknown = null;
    try {
      raw = JSON.parse(input.media ?? "");
    } catch {
      /* handled by the check below */
    }
    const list = z.array(z.unknown()).min(1).max(MAX_MEDIA).safeParse(raw);
    if (!list.success) {
      return fail(
        `Add between 1 and ${MAX_MEDIA} photos or videos, and wait for them to finish uploading.`,
      );
    }
    const parsedMedia = z.array(captionedMediaSchema).safeParse(list.data);
    if (!parsedMedia.success) return firstIssue(parsedMedia.error);
    const media = parsedMedia.data;

    const ours = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;
    if (media.some((m) => !m.url.startsWith(ours))) {
      return fail(
        "One of those uploads didn't come from this journal's Cloudinary.",
      );
    }

    // A story and a song belong to one memory; with several files they would be repeated on each.
    const single = media.length === 1;
    await db()
      .insert(schema.memories)
      .values(
        media.map((m) => ({
          childId: input.childId,
          kind: m.type === "video" ? "video" : "photo",
          title: m.title,
          body: single ? input.body : null,
          author: input.author,
          happenedOn: input.happenedOn,
          songUrl: single ? input.songUrl : null,
          mediaPublicId: m.publicId,
          mediaUrl: m.url,
          mediaType: m.type,
          mediaWidth: m.width,
          mediaHeight: m.height,
        })),
      );

    updateTag(JOURNAL_TAG);
    return done(
      single
        ? "Stuck in the journal."
        : `${media.length} memories stuck in the journal.`,
    );
  }

  if (input.kind === "note" && !input.body)
    return fail("Write the note before adding it.");
  if (input.kind === "milestone" && !input.title)
    return fail("Name the milestone.");

  await db()
    .insert(schema.memories)
    .values({
      childId: input.childId,
      kind: input.kind,
      title: input.title || "A note",
      body: input.body,
      author: input.author,
      happenedOn: input.happenedOn,
      songUrl: input.songUrl,
    });

  updateTag(JOURNAL_TAG);
  return done("Stuck in the journal.");
}

export async function deleteMemory(id: string): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  if (!z.uuid().safeParse(id).success)
    return fail("That entry no longer exists.");

  const [removed] = await db()
    .delete(schema.memories)
    .where(eq(schema.memories.id, id))
    .returning();
  if (removed?.mediaPublicId && hasCloudinary) {
    configureCloudinary();
    // The entry is already gone; a failed cleanup only leaves an unused file behind.
    await cloudinary.uploader
      .destroy(removed.mediaPublicId, {
        resource_type: removed.mediaType === "video" ? "video" : "image",
      })
      .catch(() => undefined);
  }
  updateTag(JOURNAL_TAG);
  return done("Removed from the journal.");
}

// ------------------------------------------------------------------ songs

const songSchema = z.object({
  childId: z.uuid("Choose whose mixtape this goes on."),
  url: z.string().trim().min(1, "Paste a YouTube or Spotify link.").max(300),
  title: z.string().trim().max(120),
  note: optionalText(200),
});

async function lookUpSong(url: string, provider: "youtube" | "spotify") {
  try {
    const response = await fetch(oembedUrl(url, provider), {
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      title?: string;
      thumbnail_url?: string;
    };
    return { title: data.title ?? null, thumbnail: data.thumbnail_url ?? null };
  } catch {
    return null;
  }
}

export async function createSong(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;

  const parsed = songSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return firstIssue(parsed.error);
  const input = parsed.data;

  const embed = parseSongUrl(input.url);
  if (!embed)
    return fail(
      "That isn't a YouTube or Spotify link. Paste the share link for a song or playlist.",
    );

  const found = await lookUpSong(input.url, embed.provider);
  const title = input.title || found?.title;
  if (!title)
    return fail(
      "We couldn't read the title from that link. Type a name for it.",
    );

  await db()
    .insert(schema.songs)
    .values({
      childId: input.childId,
      url: input.url,
      title: title.slice(0, 120),
      note: input.note,
      thumbnail: found?.thumbnail ?? null,
    });

  updateTag(JOURNAL_TAG);
  return done("Added to the mixtape.");
}

export async function deleteSong(id: string): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;
  if (!z.uuid().safeParse(id).success)
    return fail("That song no longer exists.");
  await db().delete(schema.songs).where(eq(schema.songs.id, id));
  updateTag(JOURNAL_TAG);
  return done("Taken off the mixtape.");
}

// --------------------------------------------------------------- children

const childSchema = z.object({
  name: z.string().trim().min(1, "What's your little one called?").max(40),
  birthDate: isoDate,
  coverColor: z.enum(COVER_COLORS),
});

function slugify(name: string): string {
  return (
    name
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "little-one"
  );
}

const RESERVED = new Set([
  "parents",
  "demo",
  "offline",
  "icons",
  "api",
  "_next",
]);

export async function createChild(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const blocked = await guard();
  if (blocked) return blocked;

  const parsed = childSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return firstIssue(parsed.error);
  const input = parsed.data;

  const taken = new Set(
    (
      await db().select({ slug: schema.children.slug }).from(schema.children)
    ).map((r) => r.slug),
  );
  const base = slugify(input.name);
  let slug = base;
  for (let n = 2; taken.has(slug) || RESERVED.has(slug); n++)
    slug = `${base}-${n}`;

  await db()
    .insert(schema.children)
    .values({ ...input, slug });
  updateTag(JOURNAL_TAG);
  return done(`${input.name}'s journal is on the shelf.`);
}
