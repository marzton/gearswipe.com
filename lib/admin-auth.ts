import { auth, getCFAccessEmail } from "@/auth";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = new Set(
  (process.env.GEARSWIPE_ADMIN_EMAILS ?? "admin@goldshore.org,admin@gearswipe.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export async function getAdminEmail(): Promise<string | null> {
  // Primary: CF Access email (production, JWT-verified)
  const cfEmail = await getCFAccessEmail();
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
}

export async function getAdminSession() {
  return await auth();
}
