import { createHash, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { hasDatabase, hasEnvPasscode } from "./env";
import { hashPasscode, verifyPasscode } from "./passcode-hash";

/**
 * The parent passcode.
 *
 * It starts as PARENT_PASSCODE in the environment. Once a parent changes it in
 * the app, a salted hash is kept in the `settings` table and takes over; the
 * environment value is then ignored. Deleting that row restores the
 * environment passcode, which is the way back in if the new one is forgotten.
 */
const KEY = "parent_passcode";
const sha256 = (value: string) => createHash("sha256").update(value).digest();

export const MIN_PASSCODE_LENGTH = 6;

/** The hash of a passcode set in the app, or null if none has been (or the table does not exist yet). */
async function storedHash(): Promise<string | null> {
  if (!hasDatabase) return null;
  try {
    const rows = await db()
      .select()
      .from(schema.settings)
      .where(eq(schema.settings.key, KEY))
      .limit(1);
    return rows[0]?.value ?? null;
  } catch {
    // Before `pnpm db:push` has created the settings table, fall back to the environment passcode.
    return null;
  }
}

/** True when any passcode exists, so the desk can be unlocked at all. */
export async function hasPasscode(): Promise<boolean> {
  return hasEnvPasscode || (await storedHash()) !== null;
}

export async function passcodeMatches(attempt: string): Promise<boolean> {
  const stored = await storedHash();
  if (stored) return verifyPasscode(attempt, stored);
  const expected = process.env.PARENT_PASSCODE;
  if (!expected) return false;
  return timingSafeEqual(sha256(attempt), sha256(expected));
}

/**
 * A short tag that changes whenever the passcode does. Sessions carry it, so
 * changing the passcode signs every other device out.
 */
export async function passcodeFingerprint(): Promise<string> {
  const material = (await storedHash()) ?? process.env.PARENT_PASSCODE ?? "";
  return sha256(material).toString("hex").slice(0, 16);
}

export async function setPasscode(passcode: string): Promise<void> {
  const value = await hashPasscode(passcode);
  await db()
    .insert(schema.settings)
    .values({ key: KEY, value })
    .onConflictDoUpdate({
      target: schema.settings.key,
      set: { value, updatedAt: new Date() },
    });
}
