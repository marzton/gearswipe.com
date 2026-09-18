import assert from "node:assert/strict";
import test from "node:test";
import { finalizeBounty, selectWinningSubmission } from "../lib/bounties/finalization.ts";

const revision = Object.freeze({
  id: "revision-1",
  bountyId: "bounty-1",
  revision: 1,
  collisionWindowMs: 1_000,
  tiePolicy: "lowest_submission_uuid",
  lockedAt: "2026-09-08T00:00:00.000Z",
});

class MemoryStore {
  #tail = Promise.resolve();
  #receipt = 40;
  finalization;
  events = [];
  submissions;

  constructor(submissions) { this.submissions = submissions; }

  transaction(operation) {
    const run = this.#tail.then(() => operation(this));
    this.#tail = run.catch(() => {});
    return run;
  }
  getLockedRevision(id) { return id === revision.id ? revision : undefined; }
  listValidSubmissions() { return this.submissions; }
  findFinalizationByRequest(requestId) {
    return this.finalization?.requestId === requestId ? this.finalization.result : undefined;
  }
  findFinalization() { return this.finalization?.result; }
  appendAuditEvent(event) {
    const stored = { ...event, receiptId: ++this.#receipt, occurredAt: "2026-09-08 12:00:00" };
    this.events.push(stored);
    return stored;
  }
  insertFinalization(result, requestId) { this.finalization = { result, requestId }; }
}

function input(requestId, eventUuid = `event-${requestId}`) {
  return {
    bountyRevisionId: revision.id,
    eventUuid,
    actorRef: "operator:1",
    requestId,
    correlationId: "correlation-1",
    policyVersion: "phase-0/v1",
    provenancePointer: "evidence://review/1",
  };
}

test("concurrent finalizers produce one stable authoritative receipt", async () => {
  const store = new MemoryStore([
    { submissionId: "submission-b", validReceiptId: 12, validOccurredAtMs: 500 },
    { submissionId: "submission-a", validReceiptId: 11, validOccurredAtMs: 100 },
  ]);
  const results = await Promise.all(Array.from({ length: 24 }, (_, index) =>
    finalizeBounty(store, input(`request-${index}`)),
  ));
  assert.equal(store.events.length, 1);
  assert.equal(new Set(results.map((result) => result.receipt.receiptId)).size, 1);
  assert.equal(results[0].winningSubmissionId, "submission-a");
});

test("retry with the same request id is idempotent", async () => {
  const store = new MemoryStore([
    { submissionId: "submission-a", validReceiptId: 3, validOccurredAtMs: 100 },
  ]);
  const first = await finalizeBounty(store, input("retry"));
  const retry = await finalizeBounty(store, input("retry"));
  assert.deepEqual(retry, first);
  assert.equal(store.events.length, 1);
});

test("selection is earliest valid, not earliest upload", () => {
  const winner = selectWinningSubmission(
    { ...revision, collisionWindowMs: 0, tiePolicy: "earliest_authoritative_receipt" },
    [
      // The early uploader is validated later. Upload timestamps are deliberately absent.
      { submissionId: "early-upload", validReceiptId: 9, validOccurredAtMs: 900 },
      { submissionId: "late-upload", validReceiptId: 4, validOccurredAtMs: 400 },
    ],
  );
  assert.equal(winner.submissionId, "late-upload");
});

test("collision-window result is deterministic across arrival permutations", () => {
  const candidates = [
    { submissionId: "submission-z", validReceiptId: 1, validOccurredAtMs: 1_000 },
    { submissionId: "submission-a", validReceiptId: 2, validOccurredAtMs: 1_900 },
    { submissionId: "submission-0", validReceiptId: 3, validOccurredAtMs: 2_001 },
  ];
  for (const order of [candidates, [...candidates].reverse(), [candidates[1], candidates[2], candidates[0]]]) {
    assert.equal(selectWinningSubmission(revision, order).submissionId, "submission-a");
  }
});
