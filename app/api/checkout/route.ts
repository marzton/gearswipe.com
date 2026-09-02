import type { NextRequest } from "next/server";
import { storeMailSubmission } from "../../../lib/mail-store";
import { resolveMailRoute } from "../../../lib/mail-routing";
import { sendMailRouteNotification } from "../../../lib/email-service";
import { formatMoney, summarizeCart, type CartLine } from "../../../lib/cart";

export const runtime = "edge";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseCart(value: string) {
  if (!value) return [];
  const parsed = JSON.parse(value) as CartLine[];
  return Array.isArray(parsed) ? parsed : [];
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return Response.json({ ok: false, message: "Invalid checkout request." }, { status: 400 });
  }

  const workspace = asString(formData.get("workspace")) === "Gold Shore" ? "Gold Shore" : "Gearswipe";
  const name = asString(formData.get("name"));
  const email = asString(formData.get("email")).toLowerCase();
  const message = asString(formData.get("message"));

  if (name.length < 2 || !emailPattern.test(email)) {
    return Response.json(
      { ok: false, message: "Please enter your name and email." },
      { status: 400 },
    );
  }

  let cartLines: CartLine[] = [];
  try {
    cartLines = parseCart(asString(formData.get("cart")));
  } catch {
    return Response.json({ ok: false, message: "Cart contents were invalid." }, { status: 400 });
  }

  const summary = summarizeCart(
    cartLines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
  );

  if (summary.lines.length === 0) {
    return Response.json(
      { ok: false, message: "Add at least one item before checkout." },
      { status: 400 },
    );
  }

  const subject = `Store checkout request — ${formatMoney(summary.subtotalCents)}`;
  const body = [
    `Customer: ${name}`,
    `Email: ${email}`,
    "",
    "Cart:",
    ...summary.lines.map((line) => {
      const lineTotal =
        line.lineTotalCents === null ? line.priceLabel : formatMoney(line.lineTotalCents);
      return `- ${line.name} x${line.quantity} (${lineTotal})`;
    }),
    "",
    `Subtotal: ${formatMoney(summary.subtotalCents)}`,
    message ? `Notes: ${message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await storeMailSubmission({
    workspace,
    formType: "support",
    name,
    email,
    company: "",
    subject,
    message: body,
  });

  await sendMailRouteNotification({
    route: resolveMailRoute(workspace, "support"),
    subject,
    name,
    email,
    message: body,
    formType: "support",
  }).catch(() => null);

  return Response.json({
    ok: true,
    message: "Checkout request sent. We’ll review the cart and follow up.",
    workspace,
    route: result.route,
    storage: result.source,
  });
}

export async function GET() {
  return Response.json({ ok: false, message: "Method not allowed." }, { status: 405 });
}
