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
