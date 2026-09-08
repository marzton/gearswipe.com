import assert from "node:assert/strict";
import test from "node:test";

import {
  createDashboardSummaryHandler,
  loadDashboardSummary,
} from "../lib/admin-dashboard.ts";

const availableReaders = (counts = [4, 3, 2, 5, 1]) => ({
  fieldTests: async () => counts[0],
  products: async () => counts[1],
  comparisons: async () => counts[2],
  subscribers: async () => ({ total: counts[3], confirmed: counts[4] }),
});

const handler = (overrides = {}) => createDashboardSummaryHandler({
  authorize: async () => ({ email: "operator@example.test" }),
  hasDatabase: () => true,
  load: async () => loadDashboardSummary(availableReaders()),
  ...overrides,
});

test("dashboard returns successful, validated count data", async () => {
  const response = await handler()();
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).counts, {
    fieldTests: 4,
    products: 3,
    comparisons: 2,
    subscribers: 5,
    confirmedSubscribers: 1,
  });
});

test("dashboard preserves genuine empty data as available zero counts", async () => {
  const response = await handler({
    load: async () => loadDashboardSummary(availableReaders([0, 0, 0, 0, 0])),
  })();
  const body = await response.json();
  assert.equal(body.health.status, "healthy");
  assert.deepEqual(Object.values(body.counts), [0, 0, 0, 0, 0]);
});

test("dashboard returns the shared authorization denial without reading data", async () => {
  let loaded = false;
  const response = await handler({
    authorize: async () => Response.json({ error: "Unauthorized" }, { status: 401 }),
    load: async () => { loaded = true; return loadDashboardSummary(availableReaders()); },
  })();
  assert.equal(response.status, 401);
  assert.equal(loaded, false);
});

test("dashboard reports a missing D1 binding without displaying empty data", async () => {
  const response = await handler({ hasDatabase: () => false })();
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: { code: "D1_BINDING_MISSING" },
  });
});

test("dashboard exposes available counts during a partial dependency failure", async () => {
  const readers = availableReaders();
  readers.products = async () => { throw new Error("products unavailable"); };
  const response = await handler({
    load: async () => loadDashboardSummary(readers),
  })();
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.health.status, "degraded");
  assert.equal(body.counts.products, null);
  assert.equal(body.counts.fieldTests, 4);
  assert.deepEqual(body.degradedCodes, ["PRODUCTS_UNAVAILABLE"]);
});
