import { listMailRoutes } from "../../../lib/mail-routing";

export const runtime = "edge";

function json(message: string, status = 200, extra: Record<string, unknown> = {}) {
  return Response.json({ ok: status < 400, message, ...extra }, { status });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspace = url.searchParams.get("workspace") === "Gold Shore" ? "Gold Shore" : "Gearswipe";
  return Response.json({
    ok: true,
    workspace,
    routes: listMailRoutes(workspace),
  });
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return json("Invalid form submission.", 400);
  }

  const workspace = typeof formData.get("workspace") === "string" && formData.get("workspace") === "Gold Shore" ? "Gold Shore" : "Gearswipe";
  const formType = typeof formData.get("formType") === "string" ? String(formData.get("formType")) : "contact";

  return Response.json({
    ok: true,
    workspace,
    formType,
    routes: listMailRoutes(workspace),
    message: "Mail routing lookup complete.",
  });
}
