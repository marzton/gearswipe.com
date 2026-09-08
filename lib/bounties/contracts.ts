/**
 * Domain contracts for Bounty Hunter.
 *
 * These types deliberately describe the canonical GearSwipe contract rather
 * than a payment-provider, moderation-provider, or storage representation.
 */

export const BountyCategory = {
  OBJECT_IDENTIFICATION: "object_identification",
  PROVENANCE_RESEARCH: "provenance_research",
  FIELD_DOCUMENTATION: "field_documentation",
  TECHNICAL_VERIFICATION: "technical_verification",
  MARKET_RESEARCH: "market_research",
  CREATIVE_DOCUMENTATION: "creative_documentation",
} as const;
export type BountyCategory = (typeof BountyCategory)[keyof typeof BountyCategory];

export const BountyVisibility = {
  PUBLIC: "public",
  UNLISTED: "unlisted",
  INVITE_ONLY: "invite_only",
} as const;
export type BountyVisibility = (typeof BountyVisibility)[keyof typeof BountyVisibility];

export const PrivacyClass = {
  PUBLIC: "public",
  ACCOUNTABLE: "accountable",
  SENSITIVE: "sensitive",
  PRECISE_LOCATION: "precise_location",
} as const;
export type PrivacyClass = (typeof PrivacyClass)[keyof typeof PrivacyClass];

export const ModerationRisk = {
  STANDARD: "standard",
  ELEVATED: "elevated",
  RESTRICTED: "restricted",
} as const;
export type ModerationRisk = (typeof ModerationRisk)[keyof typeof ModerationRisk];

export const FundingState = {
  UNFUNDED: "unfunded",
  AUTHORIZED: "authorized",
  ESCROWED: "escrowed",
  PARTIALLY_RELEASED: "partially_released",
  RELEASED: "released",
  REFUNDED: "refunded",
} as const;
export type FundingState = (typeof FundingState)[keyof typeof FundingState];

export const TiePolicy = {
  FIRST_ACCEPTED: "first_accepted",
  HIGHEST_RUBRIC_SCORE: "highest_rubric_score",
  SPLIT_EQUALLY: "split_equally",
  SPONSOR_FUNDED_MULTIPLE: "sponsor_funded_multiple",
} as const;
export type TiePolicy = (typeof TiePolicy)[keyof typeof TiePolicy];

export const EvidenceType = {
  SOURCE_RECORD: "source_record",
  PHOTOGRAPH: "photograph",
  VIDEO: "video",
  DOCUMENT: "document",
  MEASUREMENT: "measurement",
  EXPERT_ATTESTATION: "expert_attestation",
  PHYSICAL_INSPECTION: "physical_inspection",
  LOCATION_OBSERVATION: "location_observation",
} as const;
export type EvidenceType = (typeof EvidenceType)[keyof typeof EvidenceType];

export const BountyLifecycleState = {
  DRAFT: "draft",
  PUBLISHED: "published",
  OPEN: "open",
  PAUSED: "paused",
  REVIEWING: "reviewing",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  MODERATION_HOLD: "moderation_hold",
  REJECTED: "rejected",
  DISPUTED: "disputed",
  PAYOUT_PENDING: "payout_pending",
  PAID: "paid",
  CLOSED: "closed",
  ARCHIVED: "archived",
} as const;
export type BountyLifecycleState =
  (typeof BountyLifecycleState)[keyof typeof BountyLifecycleState];

export interface EvidenceRequirementSchema {
  readonly type: EvidenceType;
  readonly description: string;
  readonly minimumCount: number;
  readonly sourceIndependenceRequired: boolean;
}

export interface AcceptanceRubricCriterionSchema {
  readonly criterionId: string;
  readonly description: string;
  readonly weight: number;
  readonly passingScore: number;
}

export interface EconomicsSchema {
  readonly currency: string;
  readonly awardAmount: number;
  readonly platformFee: number;
  readonly processingFee: number;
  readonly taxWithholding: number;
  readonly expenseReserve: number;
  readonly maximumTotalLiability: number;
}

export interface ReimbursementRulesSchema {
  readonly permitted: boolean;
  readonly eligibleExpenseTypes: readonly string[];
  readonly receiptRequired: boolean;
  readonly perSubmissionCap: number;
  readonly aggregateCap: number;
  readonly preapprovalRequired: boolean;
}

export interface RightsTermsSchema {
  readonly contributorRetainsOwnership: boolean;
  readonly licenseGrant: string;
  readonly licenseScope: readonly string[];
  readonly attributionRequired: boolean;
  readonly exclusivityPeriodDays: number;
}

export interface DeterministicConcurrencyPolicySchema {
  readonly tiePolicy: TiePolicy;
  readonly maximumAcceptedSubmissions: number;
  readonly orderingKey: "submitted_at_then_submission_id";
  readonly scorePrecision: number;
}

/**
 * A published revision is an immutable statement of the acceptance bargain.
 * Changes are represented by appending another revision, never by editing one.
 */
export interface PublishedBountyRevisionSchema {
  readonly revisionId: string;
  readonly revisionNumber: number;
  readonly publishedAt: string;
  readonly publishedBy: string;
  readonly objective: string;
  readonly targetDescription: string;
  readonly prohibitedMethods: readonly string[];
  readonly acceptedEvidence: readonly EvidenceType[];
  readonly minimumEvidence: readonly EvidenceRequirementSchema[];
  readonly lockedAcceptanceRubric: readonly AcceptanceRubricCriterionSchema[];
  readonly deadline: string;
  readonly economics: Readonly<EconomicsSchema>;
  readonly reimbursementRules: Readonly<ReimbursementRulesSchema>;
  readonly rightsTerms: Readonly<RightsTermsSchema>;
  readonly disputeWindowDays: number;
  readonly concurrencyPolicy: Readonly<DeterministicConcurrencyPolicySchema>;
}

/** The declared identity and governance classification of one bounty. */
export interface DeclaredBountyContractSchema {
  readonly bountyId: string;
  readonly category: BountyCategory;
  readonly visibility: BountyVisibility;
  readonly privacyClass: PrivacyClass;
  readonly moderationRisk: ModerationRisk;
  readonly fundingState: FundingState;
  readonly currentRevisionNumber: number;
  readonly revisions: readonly Readonly<PublishedBountyRevisionSchema>[];
}
