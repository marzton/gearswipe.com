import { auth } from "@/auth";
import { authorizeOperator, operatorApiFailure } from "@/lib/operator-auth";
import { NextResponse } from "next/server";

export default auth(async (request) => {
  const { pathname } = request.nextUrl;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  const decision = await authorizeOperator({ headers: request.headers, session: request.auth });
  if (decision.authorized) return NextResponse.next();

  if (isAdminApi) {
    return operatorApiFailure(decision);
  }

  if (isAdminPage) {
    const destination = decision.status === 401
      ? `/cdn-cgi/access/login?redirect_url=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`
      : "/access-denied";
    return NextResponse.redirect(new URL(destination, request.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
