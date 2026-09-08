import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("every registered admin module resolves to an implemented page", async () => {
  const registry = await readFile(new URL("app/admin/modules.ts", root), "utf8");
  const routes = [...registry.matchAll(/href:\s*"(\/admin\/[a-z-]+)"/g)].map((match) => match[1]);

  assert.deepEqual(routes, [...new Set(routes)], "dashboard routes must not be duplicated");
  assert.deepEqual(routes.sort(), [
    "/admin/articles",
    "/admin/assets",
    "/admin/bounties",
    "/admin/production",
    "/admin/products",
    "/admin/quotes",
    "/admin/research",
    "/admin/vendors",
  ]);

  await Promise.all(routes.map((route) => access(new URL(`app${route}/page.tsx`, root))));
});

test("the dashboard derives navigation from the typed registry", async () => {
  const dashboard = await readFile(new URL("app/admin/page.tsx", root), "utf8");
  assert.match(dashboard, /loadAdminModuleStatuses/);
  assert.match(dashboard, /module\.href/);
  assert.doesNotMatch(dashboard, /admin\/(field-tests|comparisons|subscribers|campaigns)/);
});
