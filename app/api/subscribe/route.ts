import type { NextRequest } from "next/server";
import { storeNewsletterSignup } from "../../../lib/mail-store";
import { resolveMailRoute } from "../../../lib/mail-routing";
import { sendMailRouteNotification } from "../../../lib/email-service";
import { verifyTurnstile } from "../../../lib/turnstile";

export const runtime = "edge";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: FormDataEntryValue | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function json(message: string, status = 200, extra: Record<string, unknown> = {}) {
  return Response.json({ ok: status < 400, message, ...extra }, { status });
}

export async function POST(request: NextRequest) {
  const runtimeEnv = (globalThis as typeof globalThis & { __GEARSWIPE_ENV__?: { GS_API?: { fetch(input: Request): Promise<Response> } } }).__GEARSWIPE_ENV__;
  if (runtimeEnv?.GS_API) {
    const formData = await request.clone().formData().catch(() => null);
    const email = asString(formData?.get("email")).toLowerCase();
    const name = asString(formData?.get("name"));
    const turnstileToken = asString(formData?.get("cf-turnstile-response"));
    const response = await runtimeEnv.GS_API.fetch(new Request("https://gs-api.internal/v1/forms/newsletter/submissions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, name, source: "gearswipe-subscribe", turnstileToken }) }));
    return new Response(response.body, { status: response.status, headers: response.headers });
  }
  if (!(await verifyTurnstile(request, "subscribe"))) return json("Please complete the bot verification.", 403);
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return json("Invalid form submission.", 400);
  }

  const workspace = asString(formData.get("workspace")) === "Gold Shore" ? "Gold Shore" : "Gearswipe";
  const email = asString(formData.get("email")).toLowerCase();

  if (!emailPattern.test(email)) {
    return json("Please enter a valid email address.", 400, {
      fieldErrors: {
        email: true,
      },
    });
  }

  const result = await storeNewsletterSignup({ workspace, email });

  await sendMailRouteNotification({
    route: resolveMailRoute(workspace, "subscribe"),
    subject: `${workspace} newsletter signup`,
    name: "",
    email,
    message: `Newsletter signup received for ${workspace}.`,
    formType: "subscribe",
  }).catch(() => null);

  return Response.json({
    ok: true,
    message: "Subscription saved. Check your inbox for updates.",
    workspace,
    route: result.route,
    storage: result.source,
  });
}

export async function GET() {
  return json("Method not allowed.", 405);
}
