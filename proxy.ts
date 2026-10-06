import { NextRequest, NextResponse } from "next/server";

/**
 * Cheap presence check only — this middleware runs before lib/access-auth's
 * JWKS-verified check in each route/layout, which is the actual authority.
 * Its job is just to short-circuit obviously-unauthenticated requests before
 * they reach a handler, mirroring the edge-level block Cloudflare Access
 * itself performs in production once the Access Application is configured.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  // Only the signed JWT counts here too — see lib/access-auth.ts for why the
  // authenticated-user-email header alone is not treated as proof of identity.
  const hasAccessIdentity = request.headers.has("cf-access-jwt-assertion");

  if (hasAccessIdentity) {
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
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
