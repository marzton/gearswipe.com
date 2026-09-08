import { NextResponse } from "next/server";

/** Legacy entry point: keep authentication ownership at /admin. */
export function GET(request: Request) {
  return NextResponse.redirect(new URL("/admin", request.url), 307);
}
