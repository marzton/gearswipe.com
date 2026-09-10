import { authorizeOperator } from "@/lib/operator-auth";
import { redirect } from "next/navigation";

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
