import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdminAuth(returnTo = "/admin") {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/admin";
    redirect(`/login?next=${encodeURIComponent(safeReturnTo)}`);
  }
  return session;
}

export async function getAdminSession() {
  return await auth();
}
