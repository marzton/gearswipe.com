import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  BOUNTY_POLICY_VERSION,
  applyAiRecommendation,
  evaluateBountyPolicy,
  type BountyPolicyInput,
  type PolicyDisposition,
  type ReasonCode,
} from "../lib/bounties/policy.ts";
import {
  createBountyRevisionWithPolicy,
  type BountyAuditEvent,
  type BountyPolicyStore,
  type BountyRevisionRecord,
} from "../lib/bounties/revisions.ts";

interface Fixture {
  name: string;
  input: BountyPolicyInput;
  expected: PolicyDisposition;
  reason: ReasonCode;
}

const fixtureUrl = new URL("./fixtures/bounty-policy.json", import.meta.url);
const fixtures = JSON.parse(await readFile(fixtureUrl, "utf8")) as Fixture[];

for (const fixture of fixtures) {
  test(`bounty policy: ${fixture.name}`, () => {
    const result = evaluateBountyPolicy(fixture.input);
    assert.equal(result.disposition, fixture.expected);
    assert.equal(result.allow, fixture.expected === "allow");
    assert.ok(result.reasonCodes.includes(fixture.reason));
    assert.equal(result.policyVersion, BOUNTY_POLICY_VERSION);
  });
}

test("authorization requires every metadata field and non-empty boundaries", () => {
  const result = evaluateBountyPolicy({
    categories: ["security_testing"],
    securityAuthorization: {
      authorizedBy: "owner",
      authorizationReference: "auth-1",
      scope: ["example.test"],
      safeHarborTerms: "Authorized",
      disclosureRules: "Private disclosure",
      testBoundaries: [],
    },
  });
  assert.equal(result.disposition, "reject");
  assert.deepEqual(result.reasonCodes, ["SECURITY_AUTHORIZATION_INCOMPLETE"]);
});

test("AI cannot override deterministic rejection", () => {
  const deterministic = evaluateBountyPolicy({ categories: ["credential_theft"] });
  const combined = applyAiRecommendation(deterministic, { disposition: "allow", reason: "model said safe" });
  assert.strictEqual(combined, deterministic);
  assert.equal(combined.disposition, "reject");
});

test("AI cannot override required manual or governed review", () => {
  for (const deterministic of [
    evaluateBountyPolicy({ categories: ["minors"] }),
    evaluateBountyPolicy({ categories: ["physical_retrieval"] }),
  ]) {
    assert.strictEqual(applyAiRecommendation(deterministic, { disposition: "allow" }), deterministic);
    assert.notEqual(deterministic.disposition, "allow");
  }
});

test("revision persistence atomically writes matching decision and audit event", async () => {
  const revisions: BountyRevisionRecord[] = [];
  const events: BountyAuditEvent[] = [];
  let transactions = 0;
  const store: BountyPolicyStore = {
    async transaction(operation) {
      transactions += 1;
      return operation({
        async insertRevision(record) { revisions.push(record); },
        async insertAuditEvent(event) { events.push(event); },
      });
    },
  };

  const revision = await createBountyRevisionWithPolicy(store, {
    id: "revision-1",
    auditEventId: "event-1",
    bountyId: "bounty-1",
    revision: 1,
    policyInput: { categories: ["incident_media"] },
    createdAt: "2026-09-08T00:00:00.000Z",
  });

  assert.equal(transactions, 1);
  assert.deepEqual(revisions, [revision]);
  assert.equal(events[0]?.bountyRevisionId, revision.id);
  assert.deepEqual(events[0]?.policyDecision, revision.policyDecision);
  assert.equal(events[0]?.eventType, "bounty.policy_evaluated");
});
