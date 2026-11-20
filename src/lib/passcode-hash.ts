import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);

/** A salted scrypt hash, stored as `scrypt:<salt>:<key>` in hex. The passcode itself is never kept. */
export async function hashPasscode(passcode: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await derive(passcode, salt, 64)) as Buffer;
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPasscode(
  passcode: string,
  stored: string,
): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = (await derive(
    passcode,
    Buffer.from(saltHex, "hex"),
    expected.length,
  )) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
