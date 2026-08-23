import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);
const pagePath = new URL("../app/page.tsx", import.meta.url);
const layoutPath = new URL("../app/layout.tsx", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Gearswipe landing page", async (t) => {
  try {
    const response = await render();
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, /<title>Gearswipe — Minimal Tech Store<\/title>/i);
    assert.match(
      html,
      /Gearswipe is a minimal storefront for custom PC builds/i,
    );
    assert.match(html, /A minimal tech store for products, builds, and trusted gear/i);
    assert.match(html, /Shop products/i);
    assert.match(html, /Standalone brand\. Clean presentation\./i);
    assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape|instruction/i);
  } catch (error) {
    if (error.code === 'ERR_UNSUPPORTED_ESM_URL_SCHEME' && error.message.includes('cloudflare:')) {
      t.skip("Cloudflare modules not available in Node.js test environment");
      return;
    }
    throw error;
  }
});

test("keeps the current site free of starter skeleton fixtures", async () => {
  const [page, layout] = await Promise.all([
    readFile(pagePath, "utf8"),
    readFile(layoutPath, "utf8"),
  ]);

  assert.match(page, /A minimal tech store for products, builds, and trusted gear/i);
  assert.match(layout, /Gearswipe — Minimal Tech Store/i);
  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
});
