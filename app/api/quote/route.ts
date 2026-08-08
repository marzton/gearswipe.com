import type { NextRequest } from "next/server";
import { storeMailSubmission } from "../../../lib/mail-store";

export const runtime = "edge";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function combine(values: string[]) {
  return values.filter(Boolean).join(" | ");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return Response.json({ ok: false, message: "Invalid form submission." }, { status: 400 });
  }

  const workspace = asString(formData.get("workspace")) === "Gold Shore" ? "Gold Shore" : "Gearswipe";
  const name = asString(formData.get("name"));
  const email = asString(formData.get("email")).toLowerCase();
  const budget = asString(formData.get("budget"));
  const cpu = asString(formData.get("cpu"));
  const gpu = asString(formData.get("gpu"));
  const workload = asString(formData.get("workload"));
  const aesthetic = asString(formData.get("aesthetic"));
  const storage = asString(formData.get("storage"));
  const monitor = asString(formData.get("monitor"));
  const partsOwned = asString(formData.get("partsOwned"));
  const message = asString(formData.get("message"));

  if (name.length < 2 || !emailPattern.test(email)) {
    return Response.json(
      {
        ok: false,
        message: "Please enter your name and email.",
      },
      { status: 400 },
    );
  }

  const subject = `Custom build quote — ${combine([cpu || "CPU not set", gpu || "GPU not set", budget || "budget pending"])} `;
  const body = [
    `Budget: ${budget || "not provided"}`,
    `CPU preference: ${cpu || "not provided"}`,
    `GPU preference: ${gpu || "not provided"}`,
    `Workload: ${workload || "not provided"}`,
    `Aesthetic: ${aesthetic || "not provided"}`,
    `Storage / RAM: ${storage || "not provided"}`,
    `Monitor requirements: ${monitor || "not provided"}`,
    `Parts already owned: ${partsOwned || "not provided"}`,
    message ? `Notes: ${message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await storeMailSubmission({
    workspace,
    formType: "quote",
    name,
    email,
    company: "",
    subject,
    message: body,
  });

  return Response.json({
    ok: true,
    message: "Quote request saved. We’ll review the build requirements.",
    workspace,
    route: result.route,
    storage: result.source,
  });
}

export async function GET() {
  return Response.json({ ok: false, message: "Method not allowed." }, { status: 405 });
}
