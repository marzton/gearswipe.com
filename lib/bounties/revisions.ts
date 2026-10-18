import { evaluateBountyPolicy, type BountyPolicyInput, type PolicyDecision } from "./policy.ts";

export interface BountyRevisionRecord {
  id: string;
  bountyId: string;
  revision: number;
  policyInput: BountyPolicyInput;
  policyDecision: PolicyDecision;
  createdAt: string;
}

export interface BountyAuditEvent {
  id: string;
  bountyId: string;
  bountyRevisionId: string;
  eventType: "bounty.policy_evaluated";
  policyDecision: PolicyDecision;
  createdAt: string;
}

export interface BountyPolicyTransaction {
  insertRevision(record: BountyRevisionRecord): Promise<void>;
  insertAuditEvent(event: BountyAuditEvent): Promise<void>;
}

export interface BountyPolicyStore {
  transaction<T>(operation: (transaction: BountyPolicyTransaction) => Promise<T>): Promise<T>;
}

export interface CreateBountyRevisionInput {
  id: string;
  auditEventId: string;
  bountyId: string;
  revision: number;
  policyInput: BountyPolicyInput;
  createdAt: string;
}

/** Atomically records the immutable policy snapshot beside its matching audit event. */
export async function createBountyRevisionWithPolicy(
  store: BountyPolicyStore,
  input: CreateBountyRevisionInput,
): Promise<BountyRevisionRecord> {
  const policyDecision = evaluateBountyPolicy(input.policyInput);
  const revision: BountyRevisionRecord = {
    id: input.id,
    bountyId: input.bountyId,
    revision: input.revision,
    policyInput: input.policyInput,
    policyDecision,
    createdAt: input.createdAt,
  };

  await store.transaction(async (transaction) => {
    await transaction.insertRevision(revision);
    await transaction.insertAuditEvent({
      id: input.auditEventId,
      bountyId: input.bountyId,
      bountyRevisionId: input.id,
      eventType: "bounty.policy_evaluated",
      policyDecision,
      createdAt: input.createdAt,
    });
  });

  return revision;
}
