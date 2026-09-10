import { auth } from "@/auth";
import { authorizeOperator, operatorApiFailure } from "@/lib/operator-auth";
import { NextResponse } from "next/server";

export default auth(async (request) => {
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
