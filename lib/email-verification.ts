import { desc, eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { getDb } from "../db";
import { sendVerificationCodeEmail } from "./email-service";

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export type SignupPayload = {
  workspace: "Gearswipe" | "Gold Shore";
  name: string;
  interest: string;
};

function generateCode(): string {
  // crypto.getRandomValues, not Math.random — this gates account creation.
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(bytes[0] % 1_000_000).padStart(6, "0");
}

async function hashCode(email: string, code: string): Promise<string> {
  const data = new TextEncoder().encode(`${email.toLowerCase()}:${code}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generates a code, stores its hash (never the plaintext code) alongside the
 * signup form data, and emails it to the address that requested it.
 */
export async function startEmailVerification(
  email: string,
  payload: SignupPayload,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const db = getDb();
  const code = generateCode();
  const codeHash = await hashCode(email, code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  await db.insert(schema.emailVerifications).values({
    email: email.toLowerCase(),
    codeHash,
    payloadJson: JSON.stringify(payload),
    expiresAt,
  });

  const result = await sendVerificationCodeEmail(email, code, "Gearswipe");
  if (!result.success) {
    return { ok: false, message: "Could not send the verification email. Please try again." };
  }

  return { ok: true };
}

/**
 * Checks a submitted code against the most recent unconsumed verification
 * row for that email. Fails closed: missing row, expired code, exhausted
 * attempts, or a mismatch are all rejected. On success, consumes the row and
 * returns the signup payload captured in startEmailVerification so the
 * caller can finish account creation without asking the user to re-enter it.
 */
export async function verifyEmailCode(
  email: string,
  code: string,
): Promise<{ ok: true; payload: SignupPayload } | { ok: false; message: string }> {
  const db = getDb();
  const normalizedEmail = email.toLowerCase();

  const [row] = await db
    .select()
    .from(schema.emailVerifications)
    .where(eq(schema.emailVerifications.email, normalizedEmail))
    .orderBy(desc(schema.emailVerifications.createdAt), desc(schema.emailVerifications.id))
    .limit(1);

  if (!row || row.consumedAt) {
    return { ok: false, message: "Request a new verification code." };
  }

  if (new Date(row.expiresAt).getTime() < Date.now()) {
    return { ok: false, message: "That code has expired. Request a new one." };
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    return { ok: false, message: "Too many incorrect attempts. Request a new code." };
  }

  const submittedHash = await hashCode(normalizedEmail, code.trim());
  if (submittedHash !== row.codeHash) {
    await db
      .update(schema.emailVerifications)
      .set({ attempts: row.attempts + 1 })
      .where(eq(schema.emailVerifications.id, row.id));
    return { ok: false, message: "Incorrect code." };
  }

  await db
    .update(schema.emailVerifications)
    .set({ consumedAt: new Date().toISOString() })
    .where(eq(schema.emailVerifications.id, row.id));

  let payload: SignupPayload;
  try {
    payload = JSON.parse(row.payloadJson) as SignupPayload;
  } catch {
    return { ok: false, message: "Signup details were lost. Please start over." };
  }

  return { ok: true, payload };
}
