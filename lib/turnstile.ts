const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(request: Request, action: string) {
  const formData = await request.clone().formData().catch(() => null);
  const token = formData?.get("cf-turnstile-response");
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (typeof token !== "string" || token.length === 0 || token.length > 2048 || !secret) {
    return false;
  }

  const response = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: request.headers.get("cf-connecting-ip") ?? "",
    }),
  }).catch(() => null);
  if (!response?.ok) return false;
  const result = (await response.json().catch(() => null)) as { success?: boolean; action?: string; hostname?: string } | null;
  return result?.success === true && result.action === action && result.hostname === "gearswipe.com";
}
