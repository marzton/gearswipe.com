export type BountyId = string;
export type SubmissionId = string;
export type HunterId = string;
export type BountyEvidenceId = string;
export type GearSwipeId = string;

export type BountyStatus = "draft" | "open" | "paused" | "closed";
export type EvidenceRecordKind = "original" | "derivative";
export type EvidenceType = "image" | "video" | "audio" | "document" | "web" | "testimony" | "other";
export type EvidenceOrigin = "hunter_capture" | "hunter_upload" | "external_source" | "gearswipe_derivative";
export type VerificationState = "unreviewed" | "checking" | "verified" | "rejected" | "inconclusive";
export type RedactionState = "unredacted" | "redaction_requested" | "redacted";
export type AutomatedCheckResult = "pass" | "fail" | "inconclusive" | "error";

export interface Bounty {
  bountyId: BountyId;
  title: string;
  description: string;
  status: BountyStatus;
  gsIds: GearSwipeId[];
}

export interface BountyHunter {
  hunterId: HunterId;
  /** Stable subject from the accountable identity system; not the public handle. */
  accountSubject: string;
  publicHandle: string;
}

export interface BountySubmission {
  submissionId: SubmissionId;
  bountyId: BountyId;
  hunterId: HunterId;
  statement: string;
  submittedAt: string;
}

export interface UploaderAssertions {
  capturedByUploader?: boolean;
  unalteredToUploaderKnowledge?: boolean;
  consentToShare?: boolean;
  notes?: string;
}

export interface BountyEvidence {
  evidenceId: BountyEvidenceId;
  submissionId: SubmissionId;
  recordKind: EvidenceRecordKind;
  derivativeOfEvidenceId: BountyEvidenceId | null;
  evidenceType: EvidenceType;
  origin: EvidenceOrigin;
  sourceProvider: string;
  sourceIdentifier: string;
  sourceUrl: string;
  capturedAt: string | null;
  receivedAt: string;
  retrievedAt: string | null;
  storageKey: string;
  mediaHash: string;
  metadataHash: string;
  latitude: string | null;
  longitude: string | null;
  geolocationPrecisionMeters: number | null;
  rightsBasis: string;
  attribution: string;
  uploaderAssertions: UploaderAssertions;
  verificationState: VerificationState;
  /** Integer from 0 (no confidence) through 10,000 (100%). */
  confidenceBasisPoints: number;
  redactionState: RedactionState;
  normalizationVersion: string;
  provenance: Record<string, unknown>;
}

export interface EvidenceCustodyEvent {
  custodyEventId: string;
  evidenceId: BountyEvidenceId;
  sequence: number;
  action: string;
  actorId: string;
  stateHash: string;
  occurredAt: string;
  recordedAt: string;
}

export interface EvidenceAutomatedCheck {
  automatedCheckId: string;
  evidenceId: BountyEvidenceId;
  checkType: string;
  handlerVersion: string;
  result: AutomatedCheckResult;
  confidenceBasisPoints: number;
  checkedAt: string;
}

export interface EvidenceReviewerAction {
  reviewerActionId: string;
  evidenceId: BountyEvidenceId;
  reviewerId: string;
  action: string;
  previousState: VerificationState | RedactionState;
  resultingState: VerificationState | RedactionState;
  rationale: string;
  supersedesActionId: string | null;
  actedAt: string;
}

export interface EvidenceRedactionEvent {
  redactionEventId: string;
  evidenceId: BountyEvidenceId;
  derivativeEvidenceId: BountyEvidenceId;
  actorId: string;
  reason: string;
  regions: unknown[];
  occurredAt: string;
}
