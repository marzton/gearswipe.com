/** Deterministic bounty policy. This module is pure and must run before AI review. */
export const BOUNTY_POLICY_VERSION = "bounty-policy/phase-0/v1" as const;

export type PolicyDisposition =
  | "allow"
  | "reject"
  | "manual_review"
  | "governed_not_available_in_phase_0";

export type BountyCategory =
  | "ordinary_research"
  | "private_person_location"
  | "doxxing"
  | "stalking"
  | "private_data"
  | "unauthorized_surveillance"
  | "security_testing"
  | "credential_theft"
  | "trespass"
  | "stolen_items"
  | "dangerous_items"
  | "prohibited_promo_method"
  | "sensitive_infrastructure"
  | "minors"
  | "incident_media"
  | "physical_retrieval";

export type ReasonCode =
  | "ALLOWED_PHASE_0_RESEARCH"
  | "PRIVATE_PERSON_PRECISE_LOCATION"
  | "DOXXING_OR_PRIVATE_DATA"
  | "STALKING_OR_TARGETED_SURVEILLANCE"
  | "UNAUTHORIZED_SURVEILLANCE"
  | "CREDENTIAL_THEFT"
  | "TRESPASS_REQUIRED"
  | "STOLEN_OR_DANGEROUS_ITEM"
  | "PROHIBITED_PROMOTIONAL_CODE_METHOD"
  | "SECURITY_AUTHORIZATION_INCOMPLETE"
  | "AUTHORIZED_SECURITY_NOT_AVAILABLE_PHASE_0"
  | "SENSITIVE_INFRASTRUCTURE_REVIEW"
  | "MINOR_SAFETY_REVIEW"
  | "INCIDENT_MEDIA_REVIEW"
  | "PHYSICAL_RETRIEVAL_NOT_AVAILABLE_PHASE_0"
  | "UNRESTRICTED_PRECISE_LOCATION_NOT_AVAILABLE_PHASE_0"
  | "REAL_MONEY_SETTLEMENT_NOT_AVAILABLE_PHASE_0";

export interface SecurityAuthorization {
  authorizedBy: string;
  authorizationReference: string;
  scope: string[];
  safeHarborTerms: string;
  disclosureRules: string;
  testBoundaries: string[];
}

export interface BountyPolicyInput {
  categories: BountyCategory[];
  requestsPreciseLocation?: boolean;
  locationIsPublicOrOwnerAuthorized?: boolean;
  realMoneySettlement?: boolean;
  securityAuthorization?: Partial<SecurityAuthorization>;
}

export interface PolicyDecision {
  disposition: PolicyDisposition;
  /** Convenience boolean; true only when work may proceed without another gate. */
  allow: boolean;
  reasonCodes: ReasonCode[];
  policyVersion: typeof BOUNTY_POLICY_VERSION;
}

const categorySet = (input: BountyPolicyInput) => new Set(input.categories);

function completeSecurityAuthorization(value?: Partial<SecurityAuthorization>): boolean {
  return Boolean(
    value?.authorizedBy?.trim() &&
      value.authorizationReference?.trim() &&
      value.scope?.length &&
      value.scope.every((entry) => entry.trim()) &&
      value.safeHarborTerms?.trim() &&
      value.disclosureRules?.trim() &&
      value.testBoundaries?.length &&
      value.testBoundaries.every((entry) => entry.trim()),
  );
}

function decision(disposition: PolicyDisposition, reasonCodes: ReasonCode[]): PolicyDecision {
  return {
    disposition,
    allow: disposition === "allow",
    reasonCodes: [...new Set(reasonCodes)].sort(),
    policyVersion: BOUNTY_POLICY_VERSION,
  };
}

/**
 * Evaluate explicit, normalized facts. This deliberately does not infer facts
 * from prose; a classifier may suggest categories but cannot change this result.
 */
export function evaluateBountyPolicy(input: BountyPolicyInput): PolicyDecision {
  const categories = categorySet(input);
  const rejectionReasons: ReasonCode[] = [];

  if (categories.has("doxxing") || categories.has("private_data")) rejectionReasons.push("DOXXING_OR_PRIVATE_DATA");
  if (categories.has("stalking")) rejectionReasons.push("STALKING_OR_TARGETED_SURVEILLANCE");
  if (categories.has("unauthorized_surveillance")) rejectionReasons.push("UNAUTHORIZED_SURVEILLANCE");
  if (categories.has("credential_theft")) rejectionReasons.push("CREDENTIAL_THEFT");
  if (categories.has("trespass")) rejectionReasons.push("TRESPASS_REQUIRED");
  if (categories.has("stolen_items") || categories.has("dangerous_items")) rejectionReasons.push("STOLEN_OR_DANGEROUS_ITEM");
  if (categories.has("prohibited_promo_method")) rejectionReasons.push("PROHIBITED_PROMOTIONAL_CODE_METHOD");
  if (categories.has("private_person_location")) rejectionReasons.push("PRIVATE_PERSON_PRECISE_LOCATION");
  if (categories.has("security_testing") && !completeSecurityAuthorization(input.securityAuthorization)) {
    rejectionReasons.push("SECURITY_AUTHORIZATION_INCOMPLETE");
  }
  if (rejectionReasons.length) return decision("reject", rejectionReasons);

  const unavailableReasons: ReasonCode[] = [];
  if (categories.has("security_testing")) unavailableReasons.push("AUTHORIZED_SECURITY_NOT_AVAILABLE_PHASE_0");
  if (categories.has("physical_retrieval")) unavailableReasons.push("PHYSICAL_RETRIEVAL_NOT_AVAILABLE_PHASE_0");
  if (input.requestsPreciseLocation && !input.locationIsPublicOrOwnerAuthorized) {
    unavailableReasons.push("UNRESTRICTED_PRECISE_LOCATION_NOT_AVAILABLE_PHASE_0");
  }
  if (input.realMoneySettlement) unavailableReasons.push("REAL_MONEY_SETTLEMENT_NOT_AVAILABLE_PHASE_0");
  if (unavailableReasons.length) return decision("governed_not_available_in_phase_0", unavailableReasons);

  const reviewReasons: ReasonCode[] = [];
  if (categories.has("sensitive_infrastructure")) reviewReasons.push("SENSITIVE_INFRASTRUCTURE_REVIEW");
  if (categories.has("minors")) reviewReasons.push("MINOR_SAFETY_REVIEW");
  if (categories.has("incident_media")) reviewReasons.push("INCIDENT_MEDIA_REVIEW");
  if (reviewReasons.length) return decision("manual_review", reviewReasons);

  return decision("allow", ["ALLOWED_PHASE_0_RESEARCH"]);
}

export interface AiPolicyRecommendation {
  disposition: PolicyDisposition;
  reason?: string;
}

/** AI is advisory only: this intentionally returns the deterministic decision unchanged. */
export function applyAiRecommendation(
  deterministicDecision: PolicyDecision,
  _recommendation: AiPolicyRecommendation,
): PolicyDecision {
  return deterministicDecision;
}
