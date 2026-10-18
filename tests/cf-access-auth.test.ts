import assert from "node:assert/strict";
import { before, beforeEach, test } from "node:test";
import { exportJWK, generateKeyPair, SignJWT, type JWK } from "jose";
import {
  clearCFAccessJwksCacheForTests,
  verifyCFAccessToken,
} from "../lib/cf-access-auth.ts";

const TEAM_DOMAIN = "unit-test.cloudflareaccess.com";
const ISSUER = `https://${TEAM_DOMAIN}`;
const AUDIENCE = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const NOW_SECONDS = 2_000_000_000;
const NOW_MS = NOW_SECONDS * 1000;

type GeneratedKey = {
  kid: string;
  privateKey: CryptoKey;
  publicJwk: JWK;
};

let currentKey: GeneratedKey;
let rotatedKey: GeneratedKey;

async function generatedKey(kid: string): Promise<GeneratedKey> {
  const pair = await generateKeyPair("RS256", { extractable: true });
  return {
    kid,
    privateKey: pair.privateKey,
    publicJwk: {
      ...await exportJWK(pair.publicKey),
      alg: "RS256",
      kid,
      use: "sig",
    },
  };
}

before(async () => {
  [currentKey, rotatedKey] = await Promise.all([
    generatedKey("current-key"),
    generatedKey("rotated-key"),
  ]);
});

beforeEach(() => clearCFAccessJwksCacheForTests());

function jwksFetcher(...keySets: JWK[][]): typeof fetch {
  let request = 0;
  return (async () => {
    const keys = keySets[Math.min(request, keySets.length - 1)];
    request += 1;
    return Response.json({ keys });
  }) as typeof fetch;
}

async function token(
  overrides: Record<string, unknown> = {},
  signingKey = currentKey,
  headerKid = signingKey.kid,
): Promise<string> {
  return new SignJWT({
    email: "admin@gearswipe.com",
    type: "app",
    ...overrides,
  })
    .setProtectedHeader({ alg: "RS256", kid: headerKid, typ: "JWT" })
    .setSubject("access-user-id")
    .setIssuer((overrides.iss as string | undefined) ?? ISSUER)
    .setAudience((overrides.aud as string | undefined) ?? AUDIENCE)
    .setIssuedAt((overrides.iat as number | undefined) ?? NOW_SECONDS - 30)
    .setExpirationTime((overrides.exp as number | undefined) ?? NOW_SECONDS + 300)
    .sign(signingKey.privateKey);
}

function verify(jwt: string, fetcher = jwksFetcher([currentKey.publicJwk])) {
  return verifyCFAccessToken(jwt, {
    audience: AUDIENCE,
    fetcher,
    now: NOW_MS,
    teamDomain: TEAM_DOMAIN,
  });
}

test("accepts a valid Cloudflare Access token for the configured audience", async () => {
  const payload = await verify(await token());
  assert.equal(payload.email, "admin@gearswipe.com");
  assert.equal(payload.sub, "access-user-id");
});

test("rejects the wrong audience", async () => {
  await assert.rejects(verify(await token({ aud: "different-application" })));
});

test("rejects the wrong issuer", async () => {
  await assert.rejects(verify(await token({ iss: "https://other.cloudflareaccess.com" })));
});

test("rejects an expired token", async () => {
  await assert.rejects(verify(await token({ exp: NOW_SECONDS - 1 })));
});

test("rejects a future token using issued-at and not-before constraints", async () => {
  await assert.rejects(verify(await token({
    iat: NOW_SECONDS + 60,
    nbf: NOW_SECONDS + 60,
  })));
});

test("rejects an unknown signing key", async () => {
  const jwt = await token({}, rotatedKey, "unknown-key");
  await assert.rejects(verify(jwt), /signing key was not found/);
});

test("refreshes a warm JWKS cache when Access rotates to a new kid", async () => {
  const fetcher = jwksFetcher(
    [currentKey.publicJwk],
    [currentKey.publicJwk, rotatedKey.publicJwk],
  );
  await verify(await token(), fetcher);
  const payload = await verify(await token({}, rotatedKey), fetcher);
  assert.equal(payload.sub, "access-user-id");
});

test("rejects a malformed token before requesting keys", async () => {
  let fetched = false;
  const fetcher = (async () => {
    fetched = true;
    return Response.json({ keys: [] });
  }) as typeof fetch;
  await assert.rejects(verify("not-a-jwt", fetcher), /Invalid JWT format/);
  assert.equal(fetched, false);
});

test("rejects an invalid signature even when kid matches", async () => {
  const jwt = await token({}, rotatedKey, currentKey.kid);
  await assert.rejects(verify(jwt));
});

test("rejects a signature algorithm other than RS256 before requesting keys", async () => {
  const jwt = await new SignJWT({ aud: AUDIENCE, iss: ISSUER })
    .setProtectedHeader({ alg: "HS256", kid: currentKey.kid })
    .setIssuedAt(NOW_SECONDS - 30)
    .setExpirationTime(NOW_SECONDS + 300)
    .sign(new TextEncoder().encode("fixture-only-signing-secret"));
  await assert.rejects(verify(jwt), /Unsupported JWT signature algorithm/);
});
