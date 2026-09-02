import { auth, getCFAccessEmail } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const ADMIN_EMAILS = new Set(
  (process.env.GEARSWIPE_ADMIN_EMAILS ?? "admin@goldshore.org,admin@gearswipe.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export async function getAdminEmail(): Promise<string | null> {
  const requestHeaders = await headers();

  // Primary: CF Access header (production)
  const cfEmail = getCFAccessEmail(requestHeaders);
  if (cfEmail) return cfEmail.toLowerCase();

  // Fallback: NextAuth session (local dev)
  const session = await auth();
  return session?.user?.email?.toLowerCase() ?? null;
}

export async function requireAdminAuth() {
  const email = await getAdminEmail();

  if (!email || !ADMIN_EMAILS.has(email)) {
    redirect("/login");
  }

  return { email };
}

export async function getAdminSession() {
  return await auth();
}
