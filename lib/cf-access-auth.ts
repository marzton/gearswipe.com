import { importJWK, jwtVerify, type JWK, type JWTPayload } from "jose";

const ACCESS_ALGORITHM = "RS256";
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000;
const MAX_CACHED_TEAMS = 4;
const MAX_KEYS_PER_TEAM = 16;

interface CFAccessToken extends JWTPayload {
  aud: string | string[];
  email?: string;
  exp: number;
  iat: number;
  iss: string;
  sub?: string;
  type?: string;
}

interface AccessConfiguration {
  audience: string;
  teamDomain: string;
}

interface CachedJwks {
  expiresAt: number;
  keys: JWK[];
}

interface VerifyOptions extends AccessConfiguration {
  fetcher?: typeof fetch;
  now?: number;
}

const jwksCache = new Map<string, CachedJwks>();

function normalizeTeamDomain(value: string): string {
  const raw = value.trim().toLowerCase();
  if (!raw) throw new Error("Cloudflare Access team domain is not configured");

  let hostname: string;
  try {
    hostname = new URL(raw.includes("://") ? raw : `https://${raw}`).hostname;
  } catch {
    throw new Error("Cloudflare Access team domain is invalid");
  }

  if (!hostname.endsWith(".cloudflareaccess.com") || hostname === "cloudflareaccess.com") {
    throw new Error("Cloudflare Access team domain must end in .cloudflareaccess.com");
  }
  return hostname;
}

function getBinding(name: "CLOUDFLARE_ACCESS_AUDIENCE" | "CLOUDFLARE_ACCESS_TEAM_DOMAIN"):
  string | undefined {
  const workerEnv = (globalThis as typeof globalThis & {
    __GEARSWIPE_ENV__?: Record<string, unknown>;
  }).__GEARSWIPE_ENV__;
  const value = workerEnv?.[name] ?? process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getAccessConfiguration(): AccessConfiguration {
  const audience = getBinding("CLOUDFLARE_ACCESS_AUDIENCE");
  const teamDomain = getBinding("CLOUDFLARE_ACCESS_TEAM_DOMAIN");
  if (!audience || !teamDomain) {
    throw new Error("Cloudflare Access bindings are not configured");
  }
  return { audience, teamDomain: normalizeTeamDomain(teamDomain) };
}

function parseProtectedHeader(token: string): { alg: string; kid: string } {
  const segments = token.split(".");
  if (segments.length !== 3 || segments.some((segment) => !segment)) {
    throw new Error("Invalid JWT format");
  }

  let header: unknown;
  try {
    const base64 = segments[0].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
    header = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error("Invalid JWT header");
  }

  if (!header || typeof header !== "object") throw new Error("Invalid JWT header");
  const { alg, kid } = header as Record<string, unknown>;
  if (alg !== ACCESS_ALGORITHM) throw new Error("Unsupported JWT signature algorithm");
  if (typeof kid !== "string" || !kid) throw new Error("JWT key ID is missing");
  return { alg, kid };
}

async function fetchJwks(teamDomain: string, fetcher: typeof fetch): Promise<JWK[]> {
  const response = await fetcher(`https://${teamDomain}/cdn-cgi/access/certs`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error("Cloudflare Access JWKS request failed");

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("Cloudflare Access JWKS response is invalid");
  }
  const keys = (body as { keys?: unknown })?.keys;
  if (!Array.isArray(keys) || keys.length === 0 || keys.length > MAX_KEYS_PER_TEAM) {
    throw new Error("Cloudflare Access JWKS contains an invalid key set");
  }
  if (keys.some((key) => !key || typeof key !== "object")) {
    throw new Error("Cloudflare Access JWKS contains an invalid key");
  }
  return keys as JWK[];
}

function cacheJwks(teamDomain: string, keys: JWK[], now: number): void {
  jwksCache.delete(teamDomain);
  jwksCache.set(teamDomain, { expiresAt: now + JWKS_CACHE_TTL_MS, keys });
  while (jwksCache.size > MAX_CACHED_TEAMS) {
    const oldest = jwksCache.keys().next().value as string | undefined;
    if (!oldest) break;
    jwksCache.delete(oldest);
  }
}

async function selectJwk(
  teamDomain: string,
  kid: string,
  fetcher: typeof fetch,
  now: number,
): Promise<JWK> {
  let cached = jwksCache.get(teamDomain);
  if (!cached || cached.expiresAt <= now) {
    const keys = await fetchJwks(teamDomain, fetcher);
    cacheJwks(teamDomain, keys, now);
    cached = jwksCache.get(teamDomain);
  }

  let matches = cached?.keys.filter((candidate) => candidate.kid === kid) ?? [];
  if (matches.length === 0) {
    // A missing kid may be a rotation event. Refresh once even inside the TTL.
    const keys = await fetchJwks(teamDomain, fetcher);
    cacheJwks(teamDomain, keys, now);
    matches = keys.filter((candidate) => candidate.kid === kid);
  }
  if (matches.length === 0) throw new Error("Cloudflare Access signing key was not found");
  if (matches.length !== 1) throw new Error("Cloudflare Access signing key is ambiguous");
  const key = matches[0];
  if (key.kty !== "RSA" || (key.alg !== undefined && key.alg !== ACCESS_ALGORITHM) ||
      (key.use !== undefined && key.use !== "sig")) {
    throw new Error("Cloudflare Access signing key is invalid");
  }
  return key;
}

/** Verify a Cloudflare Access application token using only Worker Web APIs. */
export async function verifyCFAccessToken(
  token: string,
  options: VerifyOptions,
): Promise<CFAccessToken> {
  const teamDomain = normalizeTeamDomain(options.teamDomain);
  if (!options.audience.trim()) throw new Error("Cloudflare Access audience is not configured");
  const nowMs = options.now ?? Date.now();
  const { kid } = parseProtectedHeader(token);
  const jwk = await selectJwk(teamDomain, kid, options.fetcher ?? fetch, nowMs);
  const key = await importJWK(jwk, ACCESS_ALGORITHM);
  const issuer = `https://${teamDomain}`;
  const { payload } = await jwtVerify(token, key, {
    algorithms: [ACCESS_ALGORITHM],
    audience: options.audience,
    issuer,
    currentDate: new Date(nowMs),
  });

  const now = Math.floor(nowMs / 1000);
  if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp) || payload.exp <= now) {
    throw new Error("JWT has expired");
  }
  if (typeof payload.iat !== "number" || !Number.isFinite(payload.iat) || payload.iat > now) {
    throw new Error("JWT issued-at is invalid");
  }
  if (payload.nbf !== undefined &&
      (typeof payload.nbf !== "number" || !Number.isFinite(payload.nbf) || payload.nbf > now)) {
    throw new Error("JWT not-before is invalid");
  }
  return payload as CFAccessToken;
}

export type CFAccessVerification = { valid: true; email: string } | { valid: false };

export async function verifyCFAccessIdentity(requestHeaders: Headers): Promise<CFAccessVerification> {
  const token = requestHeaders.get("cf-access-jwt-assertion");
  if (!token) return { valid: false };
  try {
    const payload = await verifyCFAccessToken(token, getAccessConfiguration());
    if (typeof payload.email !== "string" || !payload.email.trim()) return { valid: false };
    return { valid: true, email: payload.email.trim().toLowerCase() };
  } catch { return { valid: false }; }
}

async function getVerifiedTokenFromRequest(): Promise<CFAccessToken | null> {
  try {
    const { headers } = await import("next/headers");
    const token = (await headers()).get("CF-Access-Jwt-Assertion");
    if (!token) return null;
    return await verifyCFAccessToken(token, getAccessConfiguration());
  } catch (error) {
    console.error("CF Access verification failed:", error);
    return null;
  }
}

export async function getCFAccessEmailVerified(): Promise<string | null> {
  const payload = await getVerifiedTokenFromRequest();
  return typeof payload?.email === "string" && payload.email ? payload.email : null;
}

export async function getCFAccessUserIdVerified(): Promise<string | null> {
  const payload = await getVerifiedTokenFromRequest();
  return typeof payload?.sub === "string" && payload.sub ? payload.sub : null;
}

export function getCFAccessEmailUnsafe(requestHeaders: Headers): string | null {
  return requestHeaders.get("CF-Access-Authenticated-User-Email");
}

export function getCFAccessUserIdUnsafe(requestHeaders: Headers): string | null {
  return requestHeaders.get("CF-Access-Authenticated-User-Id");
}

export function clearCFAccessJwksCacheForTests(): void {
  jwksCache.clear();
}
