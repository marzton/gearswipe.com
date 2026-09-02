import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdminAuth() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }
  return session;
}

export async function getAdminSession() {
  return await auth();
}
