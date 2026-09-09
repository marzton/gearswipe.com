import { auth } from "@/auth";
import { authorizeOperator, operatorApiFailure } from "@/lib/operator-auth";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = new Set(
  (process.env.GEARSWIPE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export default auth(async (request) => {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  const cfEmail = getCFAccessEmailDirect(request.headers)?.toLowerCase();

  // Cloudflare Access owns the unauthenticated challenge before production
  // requests reach this Worker. A supplied edge identity must still pass the
  // application's authorization check.
  if (cfEmail) {
    if (ADMIN_EMAILS.has(cfEmail)) return NextResponse.next();
    if (isAdminApi) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/access-denied", request.nextUrl.origin));
  }

  const decision = await authorizeOperator({
    headers: request.headers,
    session: request.auth,
    environment: process.env.NODE_ENV,
  });

  if (decision.authorized) return NextResponse.next();

  if (isAdminApi) {
    return operatorApiFailure(decision);
  }

  if (isAdminPage) {
    return NextResponse.redirect(new URL("/access-denied", request.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
