import type { NextRequest } from "next/server";
import { verifyEmailCode } from "../../../../lib/email-verification";
import { storeRewardSignup } from "../../../../lib/rewards-store";

export const runtime = "edge";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!emailPattern.test(email) || !/^\d{6}$/.test(code)) {
    return Response.json({ ok: false, message: "Enter the 6-digit code from your email." }, { status: 400 });
  }

  const result = await verifyEmailCode(email, code).catch((error: unknown) => {
    console.error("Failed to verify email code:", error);
    return { ok: false as const, message: "Verification is temporarily unavailable. Please try again shortly." };
  });

  if (!result.ok) {
    return Response.json({ ok: false, message: result.message }, { status: 400 });
  }

  const signup = await storeRewardSignup({
    workspace: result.payload.workspace,
    name: result.payload.name,
    email,
    interest: result.payload.interest,
  });

  return Response.json({
    ok: true,
    message: "Email verified — welcome aboard.",
    pointsAwarded: signup.pointsAwarded,
    storage: signup.source,
  });
}

export async function GET() {
  return Response.json({ ok: false, message: "Method not allowed." }, { status: 405 });
}
