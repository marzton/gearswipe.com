import { headers } from "next/headers";

/**
 * Admin auth for gearswipe.com, delegated to the same Cloudflare Access team
 * that gates goldshore.ai admin surfaces (goldshore.cloudflareaccess.com).
 * Access blocks unauthenticated requests at the edge in production; this
 * verifies the resulting Cf-Access-Jwt-Assertion so the app never trusts an
 * unverified network position (matches goldshore-ai/apps/gs-api's
 * lib/access.ts, and the standalone goldshore-api's src/lib/access.ts).
 */

const ACCESS_JWKS_URL = process.env.GEARSWIPE_ACCESS_JWKS_URL?.trim();
const ACCESS_ISSUER = process.env.GEARSWIPE_ACCESS_ISSUER?.trim();
const ACCESS_AUDIENCE = process.env.GEARSWIPE_ACCESS_AUDIENCE?.trim();

// Defense-in-depth on top of the Access Application's own policy: even a
// validly-signed Access JWT only proves *who* authenticated, not that they're
// one of gearswipe's admins. Required — an empty allowlist fails closed.
const adminEmails = new Set(
  (process.env.GEARSWIPE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export type AdminSession = { user: { email: string; role: "admin" } };

type JwkKey = {
  kid: string;
  kty: string;
  alg?: string;
  n?: string;
  e?: string;
};

const jwksCache = new Map<string, { keys: JwkKey[]; fetchedAt: number }>();
const JWKS_TTL = 5 * 60 * 1000;

const RSA_ALGORITHM_HASH = {
  RS256: "SHA-256",
  RS384: "SHA-384",
  RS512: "SHA-512",
} as const;

function isAlgorithmAllowed(alg: string): alg is keyof typeof RSA_ALGORITHM_HASH {
  return alg in RSA_ALGORITHM_HASH;
}

function base64UrlToBytes(input: string): Uint8Array {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const output = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    output[i] = binary.charCodeAt(i);
  }
  return output;
}

function decodeSection(section: string): Record<string, unknown> {
  const bytes = base64UrlToBytes(section);
  return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
}

async function fetchJwks(jwksUrl: string): Promise<JwkKey[] | undefined> {
  try {
    const resp = await fetch(jwksUrl, { cf: { cacheTtl: 300, cacheEverything: false } } as RequestInit);
    if (!resp.ok) return undefined;
    const body = (await resp.json()) as { keys?: JwkKey[] };
    return body.keys;
  } catch {
    return undefined;
  }
}

async function getKey(kid: string, jwksUrl: string): Promise<JwkKey | undefined> {
  const cached = jwksCache.get(jwksUrl);
  if (cached && cached.fetchedAt + JWKS_TTL >= Date.now()) {
    return cached.keys.find((key) => key.kid === kid);
  }

  const keys = await fetchJwks(jwksUrl);
  if (!keys) return undefined;
  jwksCache.set(jwksUrl, { keys, fetchedAt: Date.now() });
  return keys.find((key) => key.kid === kid);
}

async function verifyAssertion(token: string): Promise<string | undefined> {
  if (!ACCESS_JWKS_URL) return undefined;

  const parts = token.split(".");
  if (parts.length !== 3) return undefined;

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = decodeSection(parts[0]);
    payload = decodeSection(parts[1]);
  } catch {
    return undefined;
  }

  if (typeof header.kid !== "string") return undefined;

  const jwk = await getKey(header.kid, ACCESS_JWKS_URL);
  if (!jwk) return undefined;

  const algorithmCandidate = (header.alg as string | undefined) ?? jwk.alg ?? "RS256";
  if (!isAlgorithmAllowed(algorithmCandidate)) return undefined;

  try {
    const verifier = await crypto.subtle.importKey(
      "jwk",
      { ...jwk, alg: algorithmCandidate, ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: { name: RSA_ALGORITHM_HASH[algorithmCandidate] } },
      false,
      ["verify"],
    );

    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`).buffer as ArrayBuffer;
    const signature = base64UrlToBytes(parts[2]).buffer as ArrayBuffer;
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", verifier, signature, data);
    if (!valid) return undefined;
  } catch {
    return undefined;
  }

  if (ACCESS_ISSUER && payload.iss !== ACCESS_ISSUER) return undefined;

  if (ACCESS_AUDIENCE) {
    const expectedAudiences = ACCESS_AUDIENCE.split(",").map((v) => v.trim()).filter(Boolean);
    const tokenAudiences = Array.isArray(payload.aud)
      ? payload.aud.filter((v): v is string => typeof v === "string")
      : typeof payload.aud === "string"
        ? [payload.aud]
        : [];
    if (!tokenAudiences.some((aud) => expectedAudiences.includes(aud))) return undefined;
  }

  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) return undefined;

  const email = typeof payload.email === "string" ? payload.email : undefined;
  return email;
}

/**
 * Verifies the caller's Cloudflare Access identity from the signed JWT.
 *
 * The Cf-Access-Authenticated-User-Email header is deliberately NOT trusted
 * on its own — it's caller-suppliable on any request that reaches this
 * Worker without transiting an Access-enforcing hostname (workers.dev,
 * local dev, a misconfigured route), so treating its mere presence as proof
 * of identity is a spoofable-header auth bypass. Only a JWT that verifies
 * against Access's JWKS counts as proof.
 *
 * Fails closed if JWKS/issuer/audience aren't configured, and again if the
 * verified email isn't on the explicit admin allowlist — a valid Access
 * login proves identity, not that this app has granted that identity admin.
 */
export async function auth(): Promise<AdminSession | null> {
  if (!ACCESS_JWKS_URL || !ACCESS_ISSUER || !ACCESS_AUDIENCE) return null;
  if (adminEmails.size === 0) return null;

  const h = await headers();
  const assertion = h.get("cf-access-jwt-assertion");
  if (!assertion) return null;

  const email = await verifyAssertion(assertion);
  if (!email || !adminEmails.has(email.toLowerCase())) return null;

  return { user: { email, role: "admin" } };
}
