import { redirect } from "next/navigation";
import { authorizeOperator } from "@/lib/operator-auth";

export async function getAdminEmail(): Promise<string | null> {
  const result = await authorizeOperator();
  return result.authorized ? result.identity.email : null;
}

export async function requireAdminAuth() {
  const result = await authorizeOperator();
  if (result.authorized) return result.identity;

  redirect("/access-denied");
}
