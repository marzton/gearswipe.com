import assert from "node:assert/strict";
import test from "node:test";

import {
  BountyLifecycleState,
  PrivacyClass,
} from "../lib/bounties/contracts.ts";
import {
  ALLOWED_TRANSITIONS,
  GovernanceKind,
  InvalidBountyTransitionError,
  MissingGovernanceApprovalError,
  transitionBounty,
} from "../lib/bounties/state-machine.ts";

const approvals = Object.fromEntries(
  Object.values(GovernanceKind).map((kind) => [
    kind,
    { approvalId: `${kind}-approval`, approvedBy: "governor-1", approvedAt: "2026-09-08T12:00:00Z" },
  ]),
);

const governedContext = {
  actorId: "operator-1",
  occurredAt: "2026-09-08T12:01:00Z",
  privacyClass: PrivacyClass.PRECISE_LOCATION,
  approvals,
};

test("every declared lifecycle transition is accepted", () => {
  for (const [from, targets] of Object.entries(ALLOWED_TRANSITIONS)) {
    for (const to of targets) {
      const result = transitionBounty({ state: from, version: 7 }, to, governedContext);
      assert.deepEqual(result, {
        previousState: from,
        state: to,
        version: 8,
        changedBy: governedContext.actorId,
        changedAt: governedContext.occurredAt,
      });
    }
  }
});

test("representative forbidden transitions and terminal reopening are rejected", () => {
  const S = BountyLifecycleState;
  for (const [from, to] of [
    [S.DRAFT, S.PAID],
    [S.OPEN, S.PAID],
    [S.PAUSED, S.PAYOUT_PENDING],
    [S.CANCELLED, S.OPEN],
    [S.EXPIRED, S.OPEN],
    [S.REJECTED, S.OPEN],
    [S.PAID, S.OPEN],
    [S.CLOSED, S.OPEN],
    [S.ARCHIVED, S.DRAFT],
  ]) {
    assert.throws(
      () => transitionBounty({ state: from, version: 1 }, to, governedContext),
      InvalidBountyTransitionError,
      `${from} -> ${to}`,
    );
  }
});

test("moderation, financial, precise-location, and irreversible actions require governance", () => {
  const S = BountyLifecycleState;
  const cases = [
    [S.OPEN, S.MODERATION_HOLD, GovernanceKind.MODERATION, PrivacyClass.PUBLIC],
    [S.REVIEWING, S.PAYOUT_PENDING, GovernanceKind.FINANCIAL, PrivacyClass.PUBLIC],
    [S.DRAFT, S.PUBLISHED, GovernanceKind.PRECISE_LOCATION, PrivacyClass.PRECISE_LOCATION],
    [S.OPEN, S.CANCELLED, GovernanceKind.IRREVERSIBLE, PrivacyClass.PUBLIC],
  ];

  for (const [from, to, missingKind, privacyClass] of cases) {
    const withoutRequiredApproval = { ...approvals };
    delete withoutRequiredApproval[missingKind];
    assert.throws(
      () => transitionBounty(
        { state: from, version: 1 },
        to,
        { ...governedContext, privacyClass, approvals: withoutRequiredApproval },
      ),
      (error) => error instanceof MissingGovernanceApprovalError && error.message.includes(missingKind),
      `${from} -> ${to} must require ${missingKind}`,
    );
  }
});

test("the pure transition does not mutate its inputs", () => {
  const current = Object.freeze({ state: BountyLifecycleState.OPEN, version: 2 });
  const context = Object.freeze({
    actorId: "operator-1",
    occurredAt: "2026-09-08T12:01:00Z",
    privacyClass: PrivacyClass.PUBLIC,
  });

  const result = transitionBounty(current, BountyLifecycleState.PAUSED, context);
  assert.deepEqual(current, { state: BountyLifecycleState.OPEN, version: 2 });
  assert.equal(result.state, BountyLifecycleState.PAUSED);
  assert.notEqual(result, current);
});
