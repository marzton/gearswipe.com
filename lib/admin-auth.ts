import { authorizeOperator } from "@/lib/operator-auth";
import { redirect } from "next/navigation";

export async function requireAdminAuth() {
  const result = await authorizeOperator();
  if (result.authorized) return result.identity;

  redirect("/access-denied");
}
