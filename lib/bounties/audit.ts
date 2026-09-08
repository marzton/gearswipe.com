/** Phase 0 audit vocabulary. Additive changes require a policy-version bump. */
export const PHASE_0_EVENT_TYPES = [
  "bounty.created",
  "bounty.published",
  "claim.created",
  "claim.released",
  "submission.created",
  "submission.evidence_added",
  "submission.finalized",
  "submission.verified",
  "submission.accepted",
  "dispute.opened",
  "dispute.resolved",
  "payout.authorized",
  "payout.completed",
  "moderation.hold_placed",
  "moderation.hold_released",
  "bounty.closed",
] as const;

export type Phase0EventType = (typeof PHASE_0_EVENT_TYPES)[number];

export interface AuditEvent {
  /** Monotonic authoritative order allocated by D1, never supplied by a client. */
  receiptId: number;
  eventUuid: string;
  eventType: Phase0EventType;
  actorRef: string;
  bountyId: string | null;
  relatedEntityId: string | null;
  /** UTC database timestamp allocated with the receipt. */
  occurredAt: string;
  /** Unique idempotency key for one logical write attempt. */
  requestId: string;
  correlationId: string;
  policyVersion: string;
  provenancePointer: string;
}

export type NewAuditEvent = Omit<AuditEvent, "receiptId" | "occurredAt">;
