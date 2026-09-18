import {
  BountyLifecycleState,
  PrivacyClass,
  type BountyLifecycleState as LifecycleState,
  type PrivacyClass as BountyPrivacyClass,
} from "./contracts.ts";

export const GovernanceKind = {
  MODERATION: "moderation",
  FINANCIAL: "financial",
  PRECISE_LOCATION: "precise_location",
  IRREVERSIBLE: "irreversible",
} as const;
export type GovernanceKind = (typeof GovernanceKind)[keyof typeof GovernanceKind];

export interface GovernanceApproval {
  readonly approvalId: string;
  readonly approvedBy: string;
  readonly approvedAt: string;
}

export interface TransitionContext {
  readonly actorId: string;
  readonly occurredAt: string;
  readonly privacyClass: BountyPrivacyClass;
  readonly approvals?: Readonly<Partial<Record<GovernanceKind, GovernanceApproval>>>;
}

export interface BountyStateSnapshot {
  readonly state: LifecycleState;
  readonly version: number;
}

export interface BountyStateTransition extends BountyStateSnapshot {
  readonly previousState: LifecycleState;
  readonly changedBy: string;
  readonly changedAt: string;
}

const S = BountyLifecycleState;

/** Exported so callers and tests can inspect the complete lifecycle contract. */
export const ALLOWED_TRANSITIONS: Readonly<Record<LifecycleState, readonly LifecycleState[]>> = {
  [S.DRAFT]: [S.PUBLISHED, S.CANCELLED, S.MODERATION_HOLD],
  [S.PUBLISHED]: [S.OPEN, S.CANCELLED, S.EXPIRED, S.MODERATION_HOLD],
  [S.OPEN]: [S.PAUSED, S.REVIEWING, S.CANCELLED, S.EXPIRED, S.MODERATION_HOLD],
  [S.PAUSED]: [S.OPEN, S.CANCELLED, S.EXPIRED, S.MODERATION_HOLD],
  [S.REVIEWING]: [S.OPEN, S.PAYOUT_PENDING, S.DISPUTED, S.CANCELLED, S.EXPIRED, S.MODERATION_HOLD],
  [S.MODERATION_HOLD]: [S.DRAFT, S.PUBLISHED, S.OPEN, S.PAUSED, S.REVIEWING, S.REJECTED, S.CANCELLED],
  [S.PAYOUT_PENDING]: [S.PAID, S.DISPUTED, S.MODERATION_HOLD],
  [S.DISPUTED]: [S.PAYOUT_PENDING, S.REJECTED, S.CLOSED, S.MODERATION_HOLD],
  [S.PAID]: [S.CLOSED],
  [S.CANCELLED]: [S.ARCHIVED],
  [S.EXPIRED]: [S.ARCHIVED],
  [S.REJECTED]: [S.ARCHIVED],
  [S.CLOSED]: [S.ARCHIVED],
  [S.ARCHIVED]: [],
};

const MODERATION_STATES = new Set<LifecycleState>([S.MODERATION_HOLD, S.REJECTED]);
const FINANCIAL_STATES = new Set<LifecycleState>([S.PAYOUT_PENDING, S.PAID]);
const IRREVERSIBLE_STATES = new Set<LifecycleState>([
  S.PUBLISHED,
  S.CANCELLED,
  S.EXPIRED,
  S.REJECTED,
  S.PAID,
  S.CLOSED,
  S.ARCHIVED,
]);

export class InvalidBountyTransitionError extends Error {
  constructor(from: LifecycleState, to: LifecycleState) {
    super(`Invalid bounty transition: ${from} -> ${to}`);
    this.name = "InvalidBountyTransitionError";
  }
}

export class MissingGovernanceApprovalError extends Error {
  constructor(kind: GovernanceKind, from: LifecycleState, to: LifecycleState) {
    super(`Missing ${kind} approval for bounty transition: ${from} -> ${to}`);
    this.name = "MissingGovernanceApprovalError";
  }
}

function requiredGovernance(
  from: LifecycleState,
  to: LifecycleState,
  privacyClass: BountyPrivacyClass,
): readonly GovernanceKind[] {
  const required = new Set<GovernanceKind>();

  if (MODERATION_STATES.has(from) || MODERATION_STATES.has(to)) {
    required.add(GovernanceKind.MODERATION);
  }
  if (FINANCIAL_STATES.has(from) || FINANCIAL_STATES.has(to)) {
    required.add(GovernanceKind.FINANCIAL);
  }
  if (IRREVERSIBLE_STATES.has(to)) {
    required.add(GovernanceKind.IRREVERSIBLE);
  }
  if (to === S.PUBLISHED && privacyClass === PrivacyClass.PRECISE_LOCATION) {
    required.add(GovernanceKind.PRECISE_LOCATION);
  }

  return [...required];
}

/**
 * Applies no side effects and derives all output from the snapshot and explicit
 * context. Persistence must perform its own compare-and-swap on `version`.
 */
export function transitionBounty(
  current: Readonly<BountyStateSnapshot>,
  to: LifecycleState,
  context: Readonly<TransitionContext>,
): BountyStateTransition {
  if (!ALLOWED_TRANSITIONS[current.state].includes(to)) {
    throw new InvalidBountyTransitionError(current.state, to);
  }

  for (const kind of requiredGovernance(current.state, to, context.privacyClass)) {
    if (!context.approvals?.[kind]) {
      throw new MissingGovernanceApprovalError(kind, current.state, to);
    }
  }

  return {
    previousState: current.state,
    state: to,
    version: current.version + 1,
    changedBy: context.actorId,
    changedAt: context.occurredAt,
  };
}
