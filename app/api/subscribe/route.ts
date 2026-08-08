import type { NextRequest } from "next/server";
import { storeNewsletterSignup } from "../../../lib/mail-store";

export const runtime = "edge";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function json(message: string, status = 200, extra: Record<string, unknown> = {}) {
  return Response.json({ ok: status < 400, message, ...extra }, { status });
}

export async function POST(request: NextRequest) {
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
