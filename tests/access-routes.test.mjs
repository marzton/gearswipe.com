import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("legacy /login performs one safe redirect to the Access entry point", async () => {
  const route = await source("app/login/route.ts");

  assert.match(route, /NextResponse\.redirect\(new URL\("\/admin", request\.url\), 307\)/);
  assert.doesNotMatch(route, /oauth|api\/auth|signIn/i);
  assert.doesNotMatch(route, /new URL\("\/login"/);
});

test("public denial surface is generic and links to the public site", async () => {
  const page = await source("app/access-denied/page.tsx");

  assert.match(page, /Access restricted/i);
  assert.match(page, /href="\/"/);
  assert.doesNotMatch(page, /allowlist|token|policy|@gearswipe|account exists/i);
});

test("admin route protection keeps API failures JSON-only", async () => {
  const proxy = await source("proxy.ts");

  assert.match(proxy, /isAdminApi[\s\S]*NextResponse\.json/);
  assert.match(proxy, /message: "Forbidden"[\s\S]*status: 403/);
  assert.match(proxy, /message: "Unauthorized"[\s\S]*status: 401/);
  assert.doesNotMatch(proxy, /if \(isAdminApi\) \{\s*return NextResponse\.redirect/);
});
