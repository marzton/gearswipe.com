import { auth, getCFAccessEmail } from "@/auth";

export type OperatorIdentity = { email: string };

const ADMIN_EMAILS = new Set(
  (process.env.GEARSWIPE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

const CF_TEAM_NAME = process.env.CLOUDFLARE_TEAM_NAME ?? "gearswipe";

/** Route-level protection remains effective even if deployment middleware is omitted. */
export async function requireOperator(): Promise<OperatorIdentity | Response> {
  // Primary: CF Access email (production, JWT-verified)
  const cfEmail = await getCFAccessEmail(CF_TEAM_NAME);
  if (cfEmail && ADMIN_EMAILS.has(cfEmail.toLowerCase())) {
    return { email: cfEmail.toLowerCase() };
  }

  // NextAuth is local-only; Cloudflare Access owns production identity.
  const session = process.env.NODE_ENV !== "production" ? await auth() : null;
  if (!session?.user?.email || session.user.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { email: session.user.email };
}
