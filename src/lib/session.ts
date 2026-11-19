import { createHash, timingSafeEqual } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { hasDatabase, hasPasscode } from "./env";

const COOKIE = "journal_parent";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

function secret(): Uint8Array {
  const value =
    process.env.SESSION_SECRET ?? `${process.env.PARENT_PASSCODE}:baby-journal`;
  return new TextEncoder().encode(value);
}

const digest = (value: string) => createHash("sha256").update(value).digest();

export function passcodeMatches(attempt: string): boolean {
  const expected = process.env.PARENT_PASSCODE;
  if (!expected) return false;
  return timingSafeEqual(digest(attempt), digest(expected));
}

export async function startParentSession(): Promise<void> {
  const token = await new SignJWT({ role: "parent" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${THIRTY_DAYS}s`)
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function endParentSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** True when this request carries a valid parent session. */
export async function isParent(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !hasPasscode) return false;
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ["HS256"],
    });
    return payload.role === "parent";
  } catch {
    return false;
  }
}

export type DeskAccess = "no-database" | "needs-setup" | "locked" | "open";

/** What the parents' desk should show for this request. */
export async function deskAccess(): Promise<DeskAccess> {
  if (!hasDatabase) return "no-database";
  if (!hasPasscode) return "needs-setup";
  return (await isParent()) ? "open" : "locked";
}
