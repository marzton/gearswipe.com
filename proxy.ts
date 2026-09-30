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
    // Access challenges anonymous requests at the edge; rejected assertions fail closed.
    return NextResponse.redirect(new URL("/access-denied", request.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
