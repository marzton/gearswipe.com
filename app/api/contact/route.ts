import type { NextRequest } from "next/server";
import { storeMailSubmission } from "../../../lib/mail-store";

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
  const name = asString(formData.get("name"));
  const email = asString(formData.get("email")).toLowerCase();
  const company = asString(formData.get("company"));
  const subject = asString(formData.get("subject"));
  const message = asString(formData.get("message"));

  if (name.length < 2 || !emailPattern.test(email) || message.length < 10) {
    return json("Please complete the required fields.", 400, {
      fieldErrors: {
        name: name.length < 2,
        email: !emailPattern.test(email),
        message: message.length < 10,
      },
    });
  }

  const result = await storeMailSubmission({
    workspace,
    formType: "contact",
    name,
    email,
    company,
    subject: subject || `${workspace} contact request`,
    message,
  });

  return Response.json({
    ok: true,
    message: "Thanks — your message has been routed.",
    workspace,
    route: result.route,
    storage: result.source,
  });
}

export async function GET() {
  return json("Method not allowed.", 405);
}
