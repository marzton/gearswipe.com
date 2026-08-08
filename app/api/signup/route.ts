import type { NextRequest } from "next/server";
import { storeRewardSignup } from "../../../lib/rewards-store";

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

  const result = await storeRewardSignup({
    workspace,
    name,
    email,
    interest,
  });

  return Response.json({
    ok: true,
    message: "Welcome aboard — 100 points added to your account.",
    workspace,
    pointsAwarded: result.pointsAwarded,
    storage: result.source,
  });
}

export async function GET() {
  return Response.json({ ok: false, message: "Method not allowed." }, { status: 405 });
}
