/**
 * Database schema for CMS auth, sessions, and user preferences
 * Uses Drizzle ORM with D1 (Cloudflare SQLite)
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'
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
