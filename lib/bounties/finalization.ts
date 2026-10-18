import type { AuditEvent, NewAuditEvent } from "./audit";

export type TiePolicy = "earliest_authoritative_receipt" | "lowest_submission_uuid";

export interface LockedBountyRevision {
  id: string;
  bountyId: string;
  revision: number;
  collisionWindowMs: number;
  tiePolicy: TiePolicy;
  lockedAt: string;
}

export interface ValidSubmission {
  submissionId: string;
  /** Receipt for the server-side validation event, not upload initiation. */
  validReceiptId: number;
  validOccurredAtMs: number;
}

export interface FinalizationResult {
  bountyRevisionId: string;
  winningSubmissionId: string;
  receipt: AuditEvent;
}

export interface FinalizationTransaction {
  getLockedRevision(id: string): LockedBountyRevision | undefined;
  listValidSubmissions(revisionId: string): readonly ValidSubmission[];
  findFinalizationByRequest(requestId: string): FinalizationResult | undefined;
  findFinalization(revisionId: string): FinalizationResult | undefined;
  /** Atomically allocates the next receipt and a database UTC timestamp. */
  appendAuditEvent(event: NewAuditEvent): AuditEvent;
  insertFinalization(result: FinalizationResult, requestId: string): void;
}

export interface FinalizationStore {
  /** D1 implementations must use one serializable transaction/Durable Object. */
  transaction<T>(operation: (tx: FinalizationTransaction) => T | Promise<T>): Promise<T>;
}

export interface FinalizeBountyInput {
  bountyRevisionId: string;
  eventUuid: string;
  actorRef: string;
  requestId: string;
  correlationId: string;
  policyVersion: string;
  provenancePointer: string;
}

export function selectWinningSubmission(
  revision: LockedBountyRevision,
  submissions: readonly ValidSubmission[],
): ValidSubmission {
  if (!Number.isSafeInteger(revision.collisionWindowMs) || revision.collisionWindowMs < 0) {
    throw new Error("Locked revision has an invalid collision window");
  }
  if (submissions.length === 0) throw new Error("No valid submissions to finalize");

  const ordered = [...submissions].sort(
    (a, b) => a.validReceiptId - b.validReceiptId || a.submissionId.localeCompare(b.submissionId),
  );
  const earliest = ordered[0];
  const colliding = ordered.filter(
    (submission) => submission.validOccurredAtMs - earliest.validOccurredAtMs <= revision.collisionWindowMs,
  );

  if (revision.tiePolicy === "earliest_authoritative_receipt") return colliding[0];
  if (revision.tiePolicy === "lowest_submission_uuid") {
    return colliding.sort((a, b) => a.submissionId.localeCompare(b.submissionId))[0];
  }
  throw new Error("Locked revision has an unsupported tie policy");
}

/**
 * Finalizes once under a locked policy. The client cannot provide occurrence,
 * receipt, upload-start, or timezone fields; the store assigns both atomically.
 */
export async function finalizeBounty(
  store: FinalizationStore,
  input: FinalizeBountyInput,
): Promise<FinalizationResult> {
  return store.transaction(async (tx) => {
    const retry = tx.findFinalizationByRequest(input.requestId);
    if (retry) return retry;
    const revision = tx.getLockedRevision(input.bountyRevisionId);
    if (!revision) throw new Error("Bounty revision is not locked");
    const existing = tx.findFinalization(revision.id);
    if (existing) return existing;

    const winner = selectWinningSubmission(revision, tx.listValidSubmissions(revision.id));
    const receipt = tx.appendAuditEvent({
      eventUuid: input.eventUuid,
      eventType: "submission.accepted",
      actorRef: input.actorRef,
      bountyId: revision.bountyId,
      relatedEntityId: winner.submissionId,
      requestId: input.requestId,
      correlationId: input.correlationId,
      policyVersion: input.policyVersion,
      provenancePointer: input.provenancePointer,
    });
    const result = { bountyRevisionId: revision.id, winningSubmissionId: winner.submissionId, receipt };
    tx.insertFinalization(result, input.requestId);
    return result;
  });
}
