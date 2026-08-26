import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
