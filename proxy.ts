import { auth, getCFAccessEmailDirect } from "@/auth";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = new Set(
  (process.env.GEARSWIPE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export default auth((request) => {
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

  // NextAuth is deliberately a local-development fallback, not a second
  // production sign-in path.
  if (process.env.NODE_ENV !== "production" && request.auth?.user?.role === "admin") {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (isAdminPage) {
    return NextResponse.redirect(new URL("/access-denied", request.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
