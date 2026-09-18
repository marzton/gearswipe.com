import { verifyCFAccessIdentity } from "./cf-access-auth.ts";

export type OperatorIdentity = {
  email: string;
  source: "cloudflare-access" | "nextauth-development";
};

export type OperatorAuthorization =
  | { authorized: true; identity: OperatorIdentity }
  | { authorized: false; status: 401 | 403; reason: "missing_identity" | "invalid_access_assertion" | "operator_not_allowed" | "development_fallback_disabled" };

type SessionIdentity = { user?: { email?: string | null; role?: string | null } | null } | null;

export type OperatorAuthorizationInput = {
  headers?: Headers;
  session?: SessionIdentity;
  environment?: string;
  verifyAccess?: typeof verifyCFAccessIdentity;
};

const DEFAULT_OPERATOR_EMAILS = "";

export function getOperatorAllowlist(): ReadonlySet<string> {
  return new Set(
    (String((globalThis as typeof globalThis & { __GEARSWIPE_ENV__?: Record<string, unknown> }).__GEARSWIPE_ENV__?.GEARSWIPE_ADMIN_EMAILS ?? process.env.GEARSWIPE_ADMIN_EMAILS ?? DEFAULT_OPERATOR_EMAILS))
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function developmentFallbackAllowed(environment: string): boolean {
  return (environment === "development" || environment === "test") &&
    process.env.GEARSWIPE_ENABLE_NEXTAUTH_OPERATOR_FALLBACK === "true";
}

/**
 * The single authorization decision for every operator page, API, and proxy.
 * Access assertions always take precedence. NextAuth is considered only when
 * it is explicitly enabled outside production, and it never grants access
 * merely because a session exists.
 */
export async function authorizeOperator(input: OperatorAuthorizationInput = {}): Promise<OperatorAuthorization> {
  const headers = input.headers ?? await (await import("next/headers")).headers();
  const assertion = headers.get("cf-access-jwt-assertion");
  const allowlist = getOperatorAllowlist();

  if (assertion) {
    const access = await (input.verifyAccess ?? verifyCFAccessIdentity)(headers);
    if (!access.valid) {
      return { authorized: false, status: 401, reason: "invalid_access_assertion" };
    }
    const email = access.email.toLowerCase();
    return allowlist.has(email)
      ? { authorized: true, identity: { email, source: "cloudflare-access" } }
      : { authorized: false, status: 403, reason: "operator_not_allowed" };
  }

  let session = input.session;
  if (session === undefined && !developmentFallbackAllowed(input.environment ?? process.env.NODE_ENV ?? "production")) {
    return { authorized: false, status: 401, reason: "missing_identity" };
  }
  if (session === undefined) {
    const { auth } = await import("../auth.ts");
    session = await auth();
  }

  const sessionEmail = session?.user?.email?.trim().toLowerCase();
  if (sessionEmail) {
    if (!developmentFallbackAllowed(input.environment ?? process.env.NODE_ENV ?? "development")) {
      return { authorized: false, status: 403, reason: "development_fallback_disabled" };
    }
    return session?.user?.role === "admin" && allowlist.has(sessionEmail)
      ? { authorized: true, identity: { email: sessionEmail, source: "nextauth-development" } }
      : { authorized: false, status: 403, reason: "operator_not_allowed" };
  }

  return { authorized: false, status: 401, reason: "missing_identity" };
}

export function operatorApiFailure(result: Exclude<OperatorAuthorization, { authorized: true }>): Response {
  return Response.json(
    { ok: false, error: result.status === 401 ? "unauthenticated" : "forbidden", reason: result.reason },
    { status: result.status },
  );
}
