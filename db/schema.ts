import { sql } from "drizzle-orm";
import { check, foreignKey, index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const adminQueueItems = sqliteTable("admin_queue_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace: text("workspace").notNull(),
  title: text("title").notNull(),
  owner: text("owner").notNull(),
  status: text("status").notNull(),
  detail: text("detail").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminStoreItems = sqliteTable("admin_store_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace: text("workspace").notNull(),
  name: text("name").notNull(),
  channel: text("channel").notNull(),
  state: text("state").notNull(),
  value: text("value").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const mailSubmissions = sqliteTable("mail_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace: text("workspace").notNull(),
  formType: text("form_type").notNull(),
  name: text("name").notNull().default(""),
  email: text("email").notNull().default(""),
  company: text("company").notNull().default(""),
  subject: text("subject").notNull().default(""),
  message: text("message").notNull().default(""),
  routeAlias: text("route_alias").notNull().default(""),
  routedTo: text("routed_to").notNull().default(""),
  status: text("status").notNull().default("queued"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const newsletterSignups = sqliteTable("newsletter_signups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace: text("workspace").notNull(),
  email: text("email").notNull(),
  status: text("status").notNull().default("pending"),
  routeAlias: text("route_alias").notNull().default(""),
  routedTo: text("routed_to").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const rewardSignups = sqliteTable("reward_signups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace: text("workspace").notNull(),
  name: text("name").notNull().default(""),
  email: text("email").notNull(),
  interest: text("interest").notNull().default(""),
  points: integer("points").notNull().default(100),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const vendorLicensingItems = sqliteTable("vendor_licensing_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspace: text("workspace").notNull(),
  company: text("company").notNull(),
  vendorType: text("vendor_type").notNull(),
  contactName: text("contact_name").notNull().default(""),
  contactTitle: text("contact_title").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  website: text("website").notNull().default(""),
  territory: text("territory").notNull().default(""),
  productCategories: text("product_categories").notNull().default(""),
  minimumOrderRequirements: text("minimum_order_requirements").notNull().default(""),
  dealerResellerApplicationUrl: text("dealer_reseller_application_url").notNull().default(""),
  currentRelationshipStatus: text("current_relationship_status").notNull().default("Prospect"),
  documents: text("documents").notNull().default(""),
  catalogApiAvailability: text("catalog_api_availability").notNull().default("Unknown"),
  productImageRights: text("product_image_rights").notNull().default("Pending"),
  trademarkLogoPermissions: text("trademark_logo_permissions").notNull().default("Pending"),
  pricingFeedPermissions: text("pricing_feed_permissions").notNull().default("Pending"),
  aiDataProcessingPermissions: text("ai_data_processing_permissions").notNull().default("Pending"),
  agreementEffectiveDate: text("agreement_effective_date").notNull().default(""),
  agreementExpirationDate: text("agreement_expiration_date").notNull().default(""),
  aiVendorBrief: text("ai_vendor_brief").notNull().default(""),
  outreachEmail: text("outreach_email").notNull().default(""),
  requestedPermissions: text("requested_permissions").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** Reviewable operator jobs. AI output is evidence, never canonical truth. */
export const researchJobs = sqliteTable("research_jobs", {
  id: text("id").primaryKey(),
  gsId: text("gs_id").notNull().default(""),
  title: text("title").notNull(),
  query: text("query").notNull(),
  status: text("status").notNull().default("queued"),
  requestedBy: text("requested_by").notNull(),
  inputJson: text("input_json").notNull().default("{}"),
  resultJson: text("result_json").notNull().default("{}"),
  errorCode: text("error_code").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const researchEvidence = sqliteTable("research_evidence", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull().references(() => researchJobs.id, { onDelete: "cascade" }),
  sourceUrl: text("source_url").notNull().default(""),
  title: text("title").notNull().default(""),
  excerpt: text("excerpt").notNull().default(""),
  score: integer("score").notNull().default(0),
  retrievedAt: text("retrieved_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const contentObjects = sqliteTable("gearswipe_content_objects", {
  gsId: text("gs_id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull().default("intake"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const intakeAssets = sqliteTable("gearswipe_intake_assets", {
  id: text("id").primaryKey(),
  gsId: text("gs_id").notNull(),
  objectKey: text("object_key").notNull().unique(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull().default("application/octet-stream"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** Accountable identities that may submit evidence against a bounty. */
export const bountyHunters = sqliteTable("bounty_hunters", {
  hunterId: text("hunter_id").primaryKey(),
  accountSubject: text("account_subject").notNull().unique(),
  publicHandle: text("public_handle").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

/** A request for evidence. Canonical objects are linked through bounty_entity_links. */
export const bounties = sqliteTable("bounties", {
  bountyId: text("bounty_id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status", { enum: ["draft", "open", "paused", "closed"] }).notNull().default("draft"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const bountyEntityLinks = sqliteTable("bounty_entity_links", {
  bountyId: text("bounty_id").notNull().references(() => bounties.bountyId, { onDelete: "cascade" }),
  gsId: text("gs_id").notNull().references(() => contentObjects.gsId, { onDelete: "restrict" }),
  relationship: text("relationship").notNull().default("seeks_evidence_for"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  primaryKey({ columns: [table.bountyId, table.gsId] }),
]);

export const bountySubmissions = sqliteTable("bounty_submissions", {
  submissionId: text("submission_id").primaryKey(),
  bountyId: text("bounty_id").notNull().references(() => bounties.bountyId, { onDelete: "restrict" }),
  hunterId: text("hunter_id").notNull().references(() => bountyHunters.hunterId, { onDelete: "restrict" }),
  statement: text("statement").notNull().default(""),
  submittedAt: text("submitted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("bounty_submissions_bounty_hunter").on(table.bountyId, table.hunterId),
]);

/**
 * A stored evidence state. Originals and derivatives are separate rows; a hash
 * demonstrates integrity of those bytes/metadata, never the truth of a claim.
 */
export const bountyEvidence = sqliteTable("bounty_evidence", {
  evidenceId: text("evidence_id").primaryKey(),
  submissionId: text("submission_id").notNull().references(() => bountySubmissions.submissionId, { onDelete: "restrict" }),
  recordKind: text("record_kind", { enum: ["original", "derivative"] }).notNull(),
  derivativeOfEvidenceId: text("derivative_of_evidence_id"),
  evidenceType: text("evidence_type", { enum: ["image", "video", "audio", "document", "web", "testimony", "other"] }).notNull(),
  origin: text("origin", { enum: ["hunter_capture", "hunter_upload", "external_source", "gearswipe_derivative"] }).notNull(),
  sourceProvider: text("source_provider").notNull().default(""),
  sourceIdentifier: text("source_identifier").notNull().default(""),
  sourceUrl: text("source_url").notNull().default(""),
  capturedAt: text("captured_at"),
  receivedAt: text("received_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  retrievedAt: text("retrieved_at"),
  storageKey: text("storage_key").notNull(),
  mediaHash: text("media_hash").notNull(),
  metadataHash: text("metadata_hash").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  geolocationPrecisionMeters: integer("geolocation_precision_meters"),
  rightsBasis: text("rights_basis").notNull(),
  attribution: text("attribution").notNull().default(""),
  uploaderAssertionsJson: text("uploader_assertions_json").notNull().default("{}"),
  verificationState: text("verification_state", { enum: ["unreviewed", "checking", "verified", "rejected", "inconclusive"] }).notNull().default("unreviewed"),
  confidenceBasisPoints: integer("confidence_basis_points").notNull().default(0),
  redactionState: text("redaction_state", { enum: ["unredacted", "redaction_requested", "redacted"] }).notNull().default("unredacted"),
  normalizationVersion: text("normalization_version").notNull(),
  provenanceJson: text("provenance_json").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("bounty_evidence_submission").on(table.submissionId),
  check("bounty_evidence_confidence_range", sql`${table.confidenceBasisPoints} BETWEEN 0 AND 10000`),
  check("bounty_evidence_geo_precision_nonnegative", sql`${table.geolocationPrecisionMeters} IS NULL OR ${table.geolocationPrecisionMeters} >= 0`),
  check("bounty_evidence_derivative_pointer", sql`(${table.recordKind} = 'original' AND ${table.derivativeOfEvidenceId} IS NULL) OR (${table.recordKind} = 'derivative' AND ${table.derivativeOfEvidenceId} IS NOT NULL)`),
  foreignKey({ columns: [table.derivativeOfEvidenceId], foreignColumns: [table.evidenceId] }).onDelete("restrict"),
]);

/** Append-only transfers and transformations for an evidence record. */
export const bountyEvidenceCustodyEvents = sqliteTable("bounty_evidence_custody_events", {
  custodyEventId: text("custody_event_id").primaryKey(),
  evidenceId: text("evidence_id").notNull().references(() => bountyEvidence.evidenceId, { onDelete: "restrict" }),
  sequence: integer("sequence").notNull(),
  action: text("action").notNull(),
  actorId: text("actor_id").notNull(),
  fromLocation: text("from_location").notNull().default(""),
  toLocation: text("to_location").notNull().default(""),
  stateHash: text("state_hash").notNull(),
  detailsJson: text("details_json").notNull().default("{}"),
  occurredAt: text("occurred_at").notNull(),
  recordedAt: text("recorded_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("bounty_custody_evidence_sequence").on(table.evidenceId, table.sequence)]);

/** Append-only output from a versioned automated integrity or safety check. */
export const bountyEvidenceAutomatedChecks = sqliteTable("bounty_evidence_automated_checks", {
  automatedCheckId: text("automated_check_id").primaryKey(),
  evidenceId: text("evidence_id").notNull().references(() => bountyEvidence.evidenceId, { onDelete: "restrict" }),
  checkType: text("check_type").notNull(),
  handlerVersion: text("handler_version").notNull(),
  result: text("result", { enum: ["pass", "fail", "inconclusive", "error"] }).notNull(),
  confidenceBasisPoints: integer("confidence_basis_points").notNull().default(0),
  outputJson: text("output_json").notNull().default("{}"),
  checkedAt: text("checked_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("bounty_checks_evidence").on(table.evidenceId),
  check("bounty_checks_confidence_range", sql`${table.confidenceBasisPoints} BETWEEN 0 AND 10000`),
]);

/** Append-only human decisions; newer actions supersede rather than overwrite. */
export const bountyEvidenceReviewerActions = sqliteTable("bounty_evidence_reviewer_actions", {
  reviewerActionId: text("reviewer_action_id").primaryKey(),
  evidenceId: text("evidence_id").notNull().references(() => bountyEvidence.evidenceId, { onDelete: "restrict" }),
  reviewerId: text("reviewer_id").notNull(),
  action: text("action").notNull(),
  previousState: text("previous_state").notNull(),
  resultingState: text("resulting_state").notNull(),
  rationale: text("rationale").notNull(),
  supersedesActionId: text("supersedes_action_id"),
  actedAt: text("acted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("bounty_reviewer_actions_evidence").on(table.evidenceId),
  foreignKey({ columns: [table.supersedesActionId], foreignColumns: [table.reviewerActionId] }).onDelete("restrict"),
]);

/** Append-only disclosure of every redaction while retaining the source record. */
export const bountyEvidenceRedactionEvents = sqliteTable("bounty_evidence_redaction_events", {
  redactionEventId: text("redaction_event_id").primaryKey(),
  evidenceId: text("evidence_id").notNull().references(() => bountyEvidence.evidenceId, { onDelete: "restrict" }),
  derivativeEvidenceId: text("derivative_evidence_id").notNull().references(() => bountyEvidence.evidenceId, { onDelete: "restrict" }),
  actorId: text("actor_id").notNull(),
  reason: text("reason").notNull(),
  regionsJson: text("regions_json").notNull().default("[]"),
  occurredAt: text("occurred_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("bounty_redactions_evidence").on(table.evidenceId),
  check("bounty_redactions_distinct_records", sql`${table.evidenceId} <> ${table.derivativeEvidenceId}`),
]);
