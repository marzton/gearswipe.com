import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { authorizeOperator } from "@/lib/operator-auth";

function accessLoginUrl(requestUrl: string | null): string {
  const configured = process.env.CLOUDFLARE_ACCESS_LOGIN_URL?.trim();
  if (configured) return configured;
  const returnTo = requestUrl?.startsWith("/") ? requestUrl : "/admin";
  return `/cdn-cgi/access/login?redirect_url=${encodeURIComponent(returnTo)}`;
}

export async function getAdminEmail(): Promise<string | null> {
  const result = await authorizeOperator();
  return result.authorized ? result.identity.email : null;
}

export async function requireAdminAuth() {
  const result = await authorizeOperator();
  if (result.authorized) return result.identity;

  if (result.status === 401) {
    const request = await headers();
    redirect(accessLoginUrl(request.get("x-pathname")));
  }
  redirect("/access-denied");
}
