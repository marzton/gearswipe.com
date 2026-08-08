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
