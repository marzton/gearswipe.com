import type { NextRequest } from "next/server";
import { startEmailVerification } from "../../../lib/email-verification";
import { resolveMailRoute } from "../../../lib/mail-routing";
import { sendMailRouteNotification } from "../../../lib/email-service";

export const runtime = "edge";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return Response.json({ ok: false, message: "Invalid form submission." }, { status: 400 });
  }

  const workspace = asString(formData.get("workspace")) === "Gold Shore" ? "Gold Shore" : "Gearswipe";
  const name = asString(formData.get("name"));
  const email = asString(formData.get("email")).toLowerCase();
  const interest = asString(formData.get("interest"));

  if (name.length < 2 || !emailPattern.test(email)) {
    return Response.json(
      {
        ok: false,
        message: "Please complete your name and email.",
      },
      { status: 400 },
    );
  }

  const verification = await startEmailVerification(email, { workspace, name, interest }).catch(
    (error: unknown) => {
      console.error("Failed to start email verification:", error);
      return { ok: false as const, message: "Signup is temporarily unavailable. Please try again shortly." };
    },
  );

  if (!verification.ok) {
    return Response.json({ ok: false, message: verification.message }, { status: 503 });
  }

  await sendMailRouteNotification({
    route: resolveMailRoute(workspace, "auth"),
    subject: `${workspace} signup started`,
    name,
    email,
    message: `Signup started, verification code sent.\nInterest: ${interest || "not provided"}`,
    formType: "auth",
  }).catch(() => null);

  return Response.json({
    ok: true,
    message: "Check your email for a 6-digit verification code.",
    workspace,
  });
}

export async function GET() {
  return Response.json({ ok: false, message: "Method not allowed." }, { status: 405 });
}
