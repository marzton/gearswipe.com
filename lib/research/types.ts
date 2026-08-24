export type AcquisitionRoute =
  | "WEB_RESEARCH"
  | "BUY"
  | "RETAIL_VISIT"
  | "REQUEST_LOANER"
  | "REQUEST_SAMPLE"
  | "SEEK_SPONSORSHIP"
  | "CONTACT_BRAND"
  | "WATCH"
  | "REJECT";

export type EvidenceKind =
  | "manufacturer"
  | "manual"
  | "retailer"
  | "press"
  | "community"
  | "historical"
  | "field-test"
  | "pricing"
  | "other";

export interface EvidenceSource {
  id: string;
  url: string;
  title?: string;
  publisher?: string;
  retrievedAt: string;
  kind: EvidenceKind;
  primary: boolean;
  notes?: string;
}

export interface ClaimEvidence {
  claim: string;
  sourceIds: string[];
  confidence: number;
  contradictedBy?: string[];
}

export interface ProductIdentity {
  name: string;
  brand?: string;
  company?: string;
  category?: string;
  era?: string;
  canonicalUrl?: string;
}

export interface ProductResearchParams {
  product: ProductIdentity;
  requestedBy: string;
  intent?: string;
  seedUrls?: string[];
  forceAcquisitionRoute?: AcquisitionRoute;
}

export interface EvidencePacket {
  product: ProductIdentity;
  sources: EvidenceSource[];
  claims: ClaimEvidence[];
  provenanceSummary?: string;
  useSummary?: string;
  valueSummary?: string;
  overallConfidence: number;
  recommendedRoute: AcquisitionRoute;
  artifactPrefix: string;
}

export interface ProductResearchResult {
  status: "completed" | "waiting-for-acquisition" | "rejected";
  packet: EvidencePacket;
}
