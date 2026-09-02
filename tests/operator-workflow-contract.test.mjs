import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("production admin auth has no shipped default credential", async () => {
  const auth = await source("auth.ts");
  assert.doesNotMatch(auth, /gearswipe-local-auth-secret|gearswipe-admin/);
  assert.match(auth, /AUTH_GOOGLE_ID/);
  assert.match(auth, /GEARSWIPE_ADMIN_EMAILS/);
  assert.match(auth, /GEARSWIPE_ENABLE_LOCAL_CREDENTIALS/);
});

test("research agent remains evidence-only", async () => {
  const [agent, route] = await Promise.all([
    source("lib/research/ai-search-agent.ts"),
    source("app/api/admin/research/jobs/route.ts"),
  ]);
  assert.match(agent, /namespace\.get\(instanceName\)\.search/);
  assert.doesNotMatch(agent, /\.create\(|uploadAndPoll/);
  assert.match(route, /requireOperator/);
  assert.match(route, /researchEvidence/);
});
