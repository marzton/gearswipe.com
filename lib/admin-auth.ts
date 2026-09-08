import { auth, getCFAccessEmail } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authorizeOperator } from "@/lib/operator-auth";

const ADMIN_EMAILS = new Set(
  (process.env.GEARSWIPE_ADMIN_EMAILS ?? "admin@goldshore.org,admin@gearswipe.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

const CF_TEAM_NAME = process.env.CLOUDFLARE_TEAM_NAME ?? "gearswipe";

export async function getAdminEmail(): Promise<string | null> {
  // Primary: CF Access email (production, JWT-verified)
  const cfEmail = await getCFAccessEmail(CF_TEAM_NAME);
  if (cfEmail) return cfEmail.toLowerCase();

  // Fallback: NextAuth session (local dev)
  const session = await auth();
  return session?.user?.email?.toLowerCase() ?? null;
}

export async function requireAdminAuth() {
  const email = await getAdminEmail();

  if (!email || !ADMIN_EMAILS.has(email)) {
    redirect("/");
  }

  return { email };
  // NextAuth is an explicitly enabled local-development fallback. Production
  // identity is established only by Cloudflare Access before this app runs.
  if (process.env.NODE_ENV !== "production") {
    const session = await auth();
    return session?.user?.role === "admin"
      ? session.user.email?.toLowerCase() ?? null
      : null;
  }

  return null;
}

export async function requireAdminAuth() {
  const result = await authorizeOperator();
  if (result.authorized) return result.identity;

  if (!email || !ADMIN_EMAILS.has(email)) {
    redirect("/access-denied");
  }
  redirect("/access-denied");
}
