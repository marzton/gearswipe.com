import { createVerify } from "crypto";

interface CFAccessToken {
  aud?: string | string[];
  email?: string;
  exp?: number;
  iat?: number;
  iss?: string;
}

type AccessCertificate = { kid?: string; cert?: string; pub_cert?: string };
let cachedCertificates: AccessCertificate[] | null = null;
let cachedCertificateTime = 0;
const JWKS_CACHE_TTL = 3_600_000;

function accessConfig() {
  const teamName = (process.env.CLOUDFLARE_TEAM_NAME ?? "gearswipe").trim();
  return {
    teamName,
    issuer: `https://${teamName}.cloudflareaccess.com`,
    audience: process.env.CLOUDFLARE_ACCESS_AUD?.trim() || null,
  };
}

async function fetchCertificates(teamName: string): Promise<AccessCertificate[]> {
  const now = Date.now();
  if (cachedCertificates && now - cachedCertificateTime < JWKS_CACHE_TTL) return cachedCertificates;

  const response = await fetch(`https://${teamName}.cloudflareaccess.com/cdn-cgi/access/certs`);
  if (!response.ok) throw new Error("CF Access certificate fetch failed");
  const data = await response.json() as {
    public_certs?: AccessCertificate[];
    certs?: AccessCertificate[];
    public_cert?: string;
  };
  const certificates = data.public_certs ?? data.certs ?? (data.public_cert ? [{ cert: data.public_cert }] : []);
  if (!certificates.length) throw new Error("CF Access returned no certificates");
  cachedCertificates = certificates;
  cachedCertificateTime = now;
  return certificates;
}

function decodePart<T>(part: string): T {
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as T;
}

export type CFAccessVerification =
  | { valid: true; email: string }
  | { valid: false };

/** Verifies the Access signature and security claims before exposing identity. */
export async function verifyCFAccessIdentity(requestHeaders: Headers): Promise<CFAccessVerification> {
  const token = requestHeaders.get("cf-access-jwt-assertion");
  if (!token) return { valid: false };

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };
    const header = decodePart<{ alg?: string; kid?: string }>(parts[0]);
    const payload = decodePart<CFAccessToken>(parts[1]);
    if (header.alg !== "RS256") return { valid: false };

    const config = accessConfig();
    const certificates = await fetchCertificates(config.teamName);
    const candidates = header.kid ? certificates.filter((certificate) => certificate.kid === header.kid) : certificates;
    const signature = Buffer.from(parts[2], "base64url");
    const signed = `${parts[0]}.${parts[1]}`;
    const signatureValid = candidates.some((certificate) => {
      const key = certificate.cert ?? certificate.pub_cert;
      if (!key) return false;
      const verifier = createVerify("RSA-SHA256");
      verifier.update(signed);
      verifier.end();
      return verifier.verify(key, signature);
    });
    if (!signatureValid) return { valid: false };

    const now = Math.floor(Date.now() / 1000);
    const audiences = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
    if (!payload.email || !payload.exp || payload.exp <= now || (payload.iat && payload.iat > now)) return { valid: false };
    if (payload.iss !== config.issuer && payload.iss !== `${config.issuer}/`) return { valid: false };
    if (config.audience && !audiences.includes(config.audience)) return { valid: false };
    if (process.env.NODE_ENV === "production" && !config.audience) return { valid: false };
    return { valid: true, email: payload.email.trim().toLowerCase() };
  } catch (error) {
    console.error("CF Access verification failed", error);
    return { valid: false };
  }
}
