/**
 * Database schema for CMS auth, sessions, and user preferences
 * Uses Drizzle ORM with D1 (Cloudflare SQLite)
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  passwordHash: text('password_hash'),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  role: text('role').default('user'), // 'user' | 'editor' | 'admin'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Sessions table (NextAuth)
export const sessions = sqliteTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Verification tokens (for email verification, password resets)
export const verificationTokens = sqliteTable('verification_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  type: text('type').notNull(), // 'email_verify' | 'password_reset'
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// User preferences
export const userPreferences = sqliteTable('user_preferences', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  theme: text('theme').default('light'), // 'light' | 'dark' | 'system'
  locale: text('locale').default('en'),
  emailNotifications: integer('email_notifications', { mode: 'boolean' }).default(true),
  newsLetterSubscribed: integer('newsletter_subscribed', { mode: 'boolean' }).default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Email logs (audit trail)
export const emailLogs = sqliteTable('email_logs', {
  id: text('id').primaryKey(),
  to: text('to').notNull(),
  subject: text('subject').notNull(),
  type: text('type').notNull(), // 'welcome' | 'password_reset' | 'contact_response' | 'newsletter'
  status: text('status').notNull(), // 'sent' | 'failed' | 'pending'
  resendMessageId: text('resend_message_id'),
  error: text('error'),
  sentAt: integer('sent_at', { mode: 'timestamp' }).notNull(),
})

// API logs (for monitoring and debugging)
export const apiLogs = sqliteTable('api_logs', {
  id: text('id').primaryKey(),
  method: text('method').notNull(), // 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: text('path').notNull(),
  status: integer('status').notNull(),
  duration: integer('duration').notNull(), // milliseconds
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  error: text('error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Content audit trail (who edited what and when)
export const contentAudit = sqliteTable('content_audit', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(), // Sanity document ID
  documentType: text('document_type').notNull(), // 'page' | 'post' | 'settings'
  action: text('action').notNull(), // 'created' | 'updated' | 'published' | 'deleted'
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  changes: text('changes'), // JSON diff
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  preferences: one(userPreferences),
  verificationTokens: many(verificationTokens),
  auditLog: many(contentAudit),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const verificationTokensRelations = relations(
  verificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [verificationTokens.userId],
      references: [users.id],
    }),
  })
)

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}))

export const contentAuditRelations = relations(contentAudit, ({ one }) => ({
  user: one(users, {
    fields: [contentAudit.userId],
    references: [users.id],
  }),
}))

// ============================================================================
// MARKETPLACE: Products, Assets, Vendors, Quotes
// ============================================================================

// Asset licensing table (tracks provenance and approval status)
export const assetLicenses = sqliteTable('asset_licenses', {
  id: text('id').primaryKey(),
  // Asset info
  assetUrl: text('asset_url').notNull(),
  assetType: text('asset_type').notNull(), // 'hero_render' | 'photo' | 'diagram' | etc
  // Provenance
  source: text('source').notNull(), // 'original' | 'vendor' | 'manufacturer' | 'stock' | 'ai_generated' | 'customer'
  creator: text('creator'), // name/company
  originalUrl: text('original_url'),
  originalFile: text('original_file'),
  // Licensing
  licenseType: text('license_type').notNull(), // 'proprietary' | 'cc_by' | 'cc_by_sa' | 'public_domain' | etc
  allowedUses: text('allowed_uses'), // JSON array
  attributionRequired: integer('attribution_required', { mode: 'boolean' }).default(false),
  attributionText: text('attribution_text'),
  // Geographic / channel restrictions
  restrictedGeographies: text('restricted_geographies'), // JSON array
  restrictedChannels: text('restricted_channels'), // JSON array
  // Status workflow
  status: text('status').notNull().default('submitted'), // 'submitted' | 'rights_unknown' | 'source_verified' | 'license_reviewed' | 'approved' | 'published' | 'expiring' | 'archived'
  statusReason: text('status_reason'), // explanation for rejection or review note
  expirationDate: integer('expiration_date', { mode: 'timestamp' }),
  // Metadata
  linkedProductId: text('linked_product_id'), // reference to product
  linkedSkus: text('linked_skus'), // JSON array of SKUs
  // Approval
  reviewedBy: text('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: integer('approved_at', { mode: 'timestamp' }),
  // Timestamps
  acquisitionDate: integer('acquisition_date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Vendors / Partners table
export const vendors = sqliteTable('vendors', {
  id: text('id').primaryKey(),
  // Company info
  companyName: text('company_name').notNull(),
  vendorType: text('vendor_type').notNull(), // 'manufacturer' | 'distributor' | 'wholesaler' | 'reseller' | 'affiliate' | 'supplier'
  website: text('website'),
  territory: text('territory'), // JSON array of regions/countries
  // Contact
  contactName: text('contact_name'),
  contactTitle: text('contact_title'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  // Business details
  productCategories: text('product_categories'), // JSON array
  minimumOrderQty: integer('minimum_order_qty'),
  dealerApplicationUrl: text('dealer_application_url'),
  catalogAvailable: integer('catalog_available', { mode: 'boolean' }).default(false),
  apiAvailable: integer('api_available', { mode: 'boolean' }).default(false),
  // Relationship
  relationshipStatus: text('relationship_status').notNull().default('prospect'), // 'prospect' | 'researching' | 'ready_for_outreach' | 'contacted' | 'replied' | 'application_required' | 'negotiating' | 'documents_pending' | 'approved' | 'integration_pending' | 'active' | 'renewal_due' | 'rejected'
  // Permissions
  resellAuthorized: integer('resell_authorized', { mode: 'boolean' }).default(false),
  advertiseAuthorized: integer('advertise_authorized', { mode: 'boolean' }).default(false),
  productImageRights: integer('product_image_rights', { mode: 'boolean' }).default(false),
  trademarkRights: integer('trademark_rights', { mode: 'boolean' }).default(false),
  pricingFeedRights: integer('pricing_feed_rights', { mode: 'boolean' }).default(false),
  aiDataProcessingRights: integer('ai_data_processing_rights', { mode: 'boolean' }).default(false),
  // Agreement dates
  agreementEffectiveDate: integer('agreement_effective_date', { mode: 'timestamp' }),
  agreementExpirationDate: integer('agreement_expiration_date', { mode: 'timestamp' }),
  // Document tracking
  agreementDocumentUrl: text('agreement_document_url'),
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Outreach tracking
export const vendorOutreach = sqliteTable('vendor_outreach', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id')
    .notNull()
    .references(() => vendors.id, { onDelete: 'cascade' }),
  outreachType: text('outreach_type').notNull(), // 'email' | 'call' | 'meeting' | 'followup'
  subject: text('subject'),
  body: text('body'),
  requestedPermissions: text('requested_permissions'), // JSON array
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  sentBy: text('sent_by').references(() => users.id, { onDelete: 'set null' }),
  repliedAt: integer('replied_at', { mode: 'timestamp' }),
  replyBody: text('reply_body'),
  extractedRequirements: text('extracted_requirements'), // JSON
  status: text('status').notNull().default('draft'), // 'draft' | 'sent' | 'replied' | 'followup_needed'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Products table
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  sanityId: text('sanity_id'), // reference to Sanity document
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  productType: text('product_type').notNull(), // 'standard' | 'custom_pc' | 'configured'
  // Pricing (for standard products)
  basePrice: real('base_price'),
  salePrice: real('sale_price'),
  margin: real('margin'), // percentage
  // Category
  category: text('category'),
  subcategories: text('subcategories'), // JSON array
  // Media
  heroImageId: text('hero_image_id').references(() => assetLicenses.id, { onDelete: 'set null' }),
  relatedImageIds: text('related_image_ids'), // JSON array
  // Vendor
  primaryVendorId: text('primary_vendor_id').references(() => vendors.id, { onDelete: 'set null' }),
  // Status
  published: integer('published', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Custom PC build configurations
export const buildConfigurations = sqliteTable('build_configurations', {
  id: text('id').primaryKey(),
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  useCases: text('use_cases'), // JSON array: 'gaming' | 'cad' | 'ai' | 'workstation' | 'streaming'
  cpuPreference: text('cpu_preference'), // 'intel' | 'amd' | 'any'
  gpuPreference: text('gpu_preference'), // vendor or 'any'
  budgetRange: text('budget_range'), // JSON: {min, max}
  storageOptions: text('storage_options'), // JSON array
  ramOptions: text('ram_options'), // JSON array
  monitorIncluded: integer('monitor_included', { mode: 'boolean' }).default(false),
  aestheticPreference: text('aesthetic_preference'),
  allowExistingComponents: integer('allow_existing_components', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

// Build quotes / custom orders
export const quotes = sqliteTable('quotes', {
  id: text('id').primaryKey(),
  buildConfigId: text('build_config_id')
    .notNull()
    .references(() => buildConfigurations.id, { onDelete: 'restrict' }),
  customerId: text('customer_id'),
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name').notNull(),
  // Requirements
  budget: real('budget'),
  specifications: text('specifications'), // JSON
  additionalNotes: text('additional_notes'),
  // Admin workflow
  status: text('status').notNull().default('submitted'), // 'submitted' | 'under_review' | 'parts_sourced' | 'compatibility_checked' | 'quote_ready' | 'awaiting_approval' | 'approved' | 'payment_pending' | 'procurement' | 'assembly' | 'qa' | 'shipment' | 'completed'
  // Quote details
  selectedParts: text('selected_parts'), // JSON array of {partId, quantity, unitCost}
  billOfMaterials: text('bill_of_materials'), // JSON
  estimatedCost: real('estimated_cost'),
  quotedPrice: real('quoted_price'),
  margin: real('margin'), // percentage
  // Workflow tracking
  assignedTo: text('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  approvedBy: text('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: integer('approved_at', { mode: 'timestamp' }),
  // Milestones
  submittedAt: integer('submitted_at', { mode: 'timestamp' }).notNull(),
  assemblyStartedAt: integer('assembly_started_at', { mode: 'timestamp' }),
  qaCompletedAt: integer('qa_completed_at', { mode: 'timestamp' }),
  shippedAt: integer('shipped_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  // Delivery tracking
  trackingNumber: text('tracking_number'),
  completionImageId: text('completion_image_id').references(() => assetLicenses.id, { onDelete: 'set null' }),
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

// Relations
export const assetLicensesRelations = relations(assetLicenses, ({ one }) => ({
  reviewer: one(users, {
    fields: [assetLicenses.reviewedBy],
    references: [users.id],
  }),
}))

export const vendorsRelations = relations(vendors, ({ many }) => ({
  outreach: many(vendorOutreach),
}))

export const vendorOutreachRelations = relations(vendorOutreach, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorOutreach.vendorId],
    references: [vendors.id],
  }),
  sentByUser: one(users, {
    fields: [vendorOutreach.sentBy],
    references: [users.id],
  }),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  heroImage: one(assetLicenses, {
    fields: [products.heroImageId],
    references: [assetLicenses.id],
  }),
  vendor: one(vendors, {
    fields: [products.primaryVendorId],
    references: [vendors.id],
  }),
  builds: many(buildConfigurations),
}))

export const buildConfigurationsRelations = relations(buildConfigurations, ({ one, many }) => ({
  product: one(products, {
    fields: [buildConfigurations.productId],
    references: [products.id],
  }),
  quotes: many(quotes),
}))

export const quotesRelations = relations(quotes, ({ one }) => ({
  buildConfig: one(buildConfigurations, {
    fields: [quotes.buildConfigId],
    references: [buildConfigurations.id],
  }),
  assignee: one(users, {
    fields: [quotes.assignedTo],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [quotes.approvedBy],
    references: [users.id],
  }),
  completionImage: one(assetLicenses, {
    fields: [quotes.completionImageId],
    references: [assetLicenses.id],
  }),
}))
