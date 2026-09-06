import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const generatedId = () => text("id").primaryKey().default(sql`lower(hex(randomblob(16)))`);
const createdAt = () => integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`);
const updatedAt = () => integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`);

/**
 * GearSwipe editorial/product tables used by the Vinext API routes.
 *
 * This module restores the schema contract those routes already import. It is
 * intentionally separate from cms-schema.ts (auth/marketplace) so the existing
 * routes can compile without pretending the two historical schemas are one.
 */
export const products = sqliteTable("gearswipe_products", {
  id: generatedId(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model"),
  category: text("category").notNull().default("carry"),
  description: text("description"),
  price: real("price"),
  currency: text("currency").notNull().default("USD"),
  purchaseLink: text("purchase_link"),
  verdict: text("verdict").notNull().default("good_with_caveats"),
  buildRating: integer("build_rating"),
  designRating: integer("design_rating"),
  comfortRating: integer("comfort_rating"),
  serviceRating: integer("service_rating"),
  valueRating: integer("value_rating"),
  heroImage: text("hero_image"),
  detailImages: text("detail_images").notNull().default("[]"),
  materials: text("materials"),
  construction: text("construction"),
  manufacturing: text("manufacturing"),
  warranty: text("warranty"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  isCommerceEnabled: integer("is_commerce_enabled", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Canonical object intake. AI and editorial records reference this identity. */
export const contentObjects = sqliteTable("gearswipe_content_objects", {
  gsId: text("gs_id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull().default("intake"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Metadata for source files stored in the verified R2 intake bucket. */
export const intakeAssets = sqliteTable("gearswipe_intake_assets", {
  id: generatedId(),
  gsId: text("gs_id").notNull(),
  objectKey: text("object_key").notNull().unique(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull().default("application/octet-stream"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  createdAt: createdAt(),
});

export const comparisons = sqliteTable("gearswipe_comparisons", {
  id: generatedId(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  productIds: text("product_ids").notNull().default("[]"),
  comparisonCategories: text("comparison_categories").notNull().default("[]"),
  content: text("content"),
  heroImage: text("hero_image"),
  pick: text("pick"),
  pickReason: text("pick_reason"),
  status: text("status").notNull().default("draft"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const fieldTests = sqliteTable("gearswipe_field_tests", {
  id: generatedId(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  subtitle: text("subtitle"),
  description: text("description"),
  testType: text("test_type").notNull().default("backpack"),
  methodology: text("methodology").notNull().default("gearswipe-standard"),
  status: text("status").notNull().default("upcoming"),
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  locations: text("locations").notNull().default("[]"),
  daysActive: integer("days_active").notNull().default(0),
  countriesVisited: integer("countries_visited").notNull().default(0),
  flightsCompleted: integer("flights_completed").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
  heroImage: text("hero_image"),
  content: text("content"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** Editorial records remain linked to the canonical object id when one exists. */
export const articles = sqliteTable("gearswipe_articles", {
  id: generatedId(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  dek: text("dek"),
  body: text("body").notNull(),
  heroImage: text("hero_image"),
  gsId: text("gs_id"),
  status: text("status").notNull().default("draft"),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const subscribers = sqliteTable("gearswipe_subscribers", {
  id: generatedId(),
  email: text("email").notNull().unique(),
  subscribedToFieldTests: integer("subscribed_to_field_tests", { mode: "boolean" }).notNull().default(true),
  subscribedToComparisons: integer("subscribed_to_comparisons", { mode: "boolean" }).notNull().default(true),
  subscribedToHeritage: integer("subscribed_to_heritage", { mode: "boolean" }).notNull().default(true),
  subscribedToManufacturing: integer("subscribed_to_manufacturing", { mode: "boolean" }).notNull().default(true),
  confirmed: integer("confirmed", { mode: "boolean" }).notNull().default(false),
  unsubscribed: integer("unsubscribed", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
