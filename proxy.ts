import { auth, getCFAccessEmailDirect } from "@/auth";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = new Set(
  (process.env.GEARSWIPE_ADMIN_EMAILS ?? "admin@goldshore.org,admin@gearswipe.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

function isCFAccessAuthed(request: any): boolean {
  // Check if CF Access has authenticated the user
  const cfEmail = getCFAccessEmailDirect(request.headers);
  if (cfEmail && ADMIN_EMAILS.has(cfEmail.toLowerCase())) {
    return true;
  }
  return false;
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  // Check CF Access first (production)
  if (isCFAccessAuthed(request)) {
    return NextResponse.next();
  }

  // Fall back to NextAuth session
  if (request.auth) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (isAdminPage) {
    const loginUrl = new URL("/login", request.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
