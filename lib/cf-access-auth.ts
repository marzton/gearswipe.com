import { createVerify } from "crypto";
import { headers } from "next/headers";

interface CFAccessToken {
  aud: string[];
  email: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  type: string;
  [key: string]: unknown;
}

let cachedPublicKey: string | null = null;
let cachedPublicKeyTime = 0;
const JWKS_CACHE_TTL = 3600000; // 1 hour

async function fetchPublicKey(teamName: string): Promise<string> {
  const now = Date.now();
  if (cachedPublicKey && now - cachedPublicKeyTime < JWKS_CACHE_TTL) {
    return cachedPublicKey;
  }

  try {
    const jwksUrl = `https://${teamName}.cloudflareaccess.com/cdn-cgi/access/certs`;
    const response = await fetch(jwksUrl);
    const data = (await response.json()) as {
      certs: Array<{ pub_cert: string }>;
    };

    if (!data.certs || !data.certs[0]) {
      throw new Error("No certificates found in JWKS response");
    }

    cachedPublicKey = data.certs[0].pub_cert;
    cachedPublicKeyTime = now;
    return cachedPublicKey;
  } catch (error) {
    console.error("Failed to fetch CF Access public key:", error);
    throw new Error("CF Access public key fetch failed");
  }
}

function decodeJWT(token: string): CFAccessToken {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    ) as CFAccessToken;
    return payload;
  } catch (error) {
    throw new Error("Failed to decode JWT payload");
  }
}

function verifyJWTSignature(
  token: string,
  publicKey: string
): CFAccessToken {
  const payload = decodeJWT(token);

  // Verify signature
  const [headerB64, payloadB64, signatureB64] = token.split(".");
  const signatureBuffer = Buffer.from(signatureB64, "base64");
  const message = `${headerB64}.${payloadB64}`;

  const verifier = createVerify("RSA-SHA256");
  verifier.update(message);
  const isValid = verifier.verify(publicKey, signatureBuffer);

  if (!isValid) {
    throw new Error("JWT signature verification failed");
  }

  // Verify claims
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error("JWT token expired");
  }

  if (payload.iat && payload.iat > now) {
    throw new Error("JWT token used before valid");
  }

  return payload;
}

export async function getCFAccessEmailVerified(
  teamName: string
): Promise<string | null> {
  try {
    const requestHeaders = await headers();
    const token = requestHeaders.get("CF-Access-Jwt-Assertion");

    if (!token) {
      return null;
    }

    const publicKey = await fetchPublicKey(teamName);
    const payload = verifyJWTSignature(token, publicKey);

    return payload.email || null;
  } catch (error) {
    console.error("CF Access verification failed:", error);
    // Don't return email if verification fails
    return null;
  }
}

export async function getCFAccessUserIdVerified(
  teamName: string
): Promise<string | null> {
  try {
    const requestHeaders = await headers();
    const token = requestHeaders.get("CF-Access-Jwt-Assertion");

    if (!token) {
      return null;
    }

    const publicKey = await fetchPublicKey(teamName);
    const payload = verifyJWTSignature(token, publicKey);

    return payload.sub || null;
  } catch (error) {
    console.error("CF Access verification failed:", error);
    return null;
  }
}

export function getCFAccessEmailUnsafe(requestHeaders: Headers): string | null {
  return requestHeaders.get("CF-Access-Authenticated-User-Email");
}

export function getCFAccessUserIdUnsafe(requestHeaders: Headers): string | null {
  return requestHeaders.get("CF-Access-Authenticated-User-Id");
}
