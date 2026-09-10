import assert from "node:assert/strict";
import test from "node:test";
import { authorizeOperator, operatorApiFailure } from "../lib/operator-auth.ts";

const allowedEmail = "admin@gearswipe.com";
process.env.GEARSWIPE_ADMIN_EMAILS = allowedEmail;
const assertionHeaders = () => new Headers({ "cf-access-jwt-assertion": "header.payload.signature" });
const accessVerifier = (email) => async () => ({ valid: true, email });

async function withFallback(value, callback) {
  const previous = process.env.GEARSWIPE_ENABLE_NEXTAUTH_OPERATOR_FALLBACK;
  process.env.GEARSWIPE_ENABLE_NEXTAUTH_OPERATOR_FALLBACK = value;
  try {
    await callback();
  } finally {
    if (previous === undefined) delete process.env.GEARSWIPE_ENABLE_NEXTAUTH_OPERATOR_FALLBACK;
    else process.env.GEARSWIPE_ENABLE_NEXTAUTH_OPERATOR_FALLBACK = previous;
  }
}

test("authorized Cloudflare Access identity passes the shared allowlist", async () => {
  const result = await authorizeOperator({
    headers: assertionHeaders(), session: null, verifyAccess: accessVerifier(allowedEmail), environment: "production",
  });
  assert.deepEqual(result, { authorized: true, identity: { email: allowedEmail, source: "cloudflare-access" } });
});

test("authenticated but unauthorized Access identity is forbidden", async () => {
  const result = await authorizeOperator({
    headers: assertionHeaders(), session: null, verifyAccess: accessVerifier("reader@example.com"), environment: "production",
  });
  assert.equal(result.authorized, false);
  assert.equal(result.status, 403);
});

test("authorized local-development admin session requires explicit fallback", async () => {
  await withFallback("true", async () => {
    const result = await authorizeOperator({
      headers: new Headers(), session: { user: { email: allowedEmail, role: "admin" } }, environment: "development",
    });
    assert.equal(result.authorized, true);
    assert.equal(result.identity.source, "nextauth-development");
  });
});

test("ordinary signed-in user cannot cross the operator boundary", async () => {
  await withFallback("true", async () => {
    const result = await authorizeOperator({
      headers: new Headers(), session: { user: { email: allowedEmail, role: "user" } }, environment: "development",
    });
    assert.equal(result.authorized, false);
    assert.equal(result.status, 403);
  });
});

test("malformed Access assertion is unauthenticated and produces structured JSON", async () => {
  const result = await authorizeOperator({
    headers: assertionHeaders(), session: { user: { email: allowedEmail, role: "admin" } },
    verifyAccess: async () => ({ valid: false }), environment: "development",
  });
  assert.equal(result.authorized, false);
  assert.equal(result.status, 401);
  const response = operatorApiFailure(result);
  assert.equal(response.status, 401);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.deepEqual(await response.json(), { ok: false, error: "unauthenticated", reason: "invalid_access_assertion" });
});

test("missing identity is unauthenticated", async () => {
  const result = await authorizeOperator({ headers: new Headers(), session: null, environment: "production" });
  assert.deepEqual(result, { authorized: false, status: 401, reason: "missing_identity" });
});

test("production rejects local credentials even when fallback is configured", async () => {
  await withFallback("true", async () => {
    const result = await authorizeOperator({
      headers: new Headers(), session: { user: { email: allowedEmail, role: "admin" } }, environment: "production",
    });
    assert.deepEqual(result, { authorized: false, status: 403, reason: "development_fallback_disabled" });
  });
});
