import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Coaching roles available in the platform.
 * Each role represents a different coaching context (Career, Relationships, etc.)
 */
export const coachingRoles = mysqlTable("coaching_roles", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  promptId: varchar("promptId", { length: 128 }),
  icon: varchar("icon", { length: 64 }),
  avatar: varchar("avatar", { length: 512 }),
  color: varchar("color", { length: 32 }),
  isActive: int("isActive").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoachingRole = typeof coachingRoles.$inferSelect;
export type InsertCoachingRole = typeof coachingRoles.$inferInsert;

/**
 * Conversations between users and AI coaches.
 * Each conversation is associated with a specific coaching role.
 */
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  roleId: int("roleId").notNull(),
  title: varchar("title", { length: 256 }),
  /** OpenAI previous_response_id for session continuity */
  lastResponseId: varchar("lastResponseId", { length: 256 }),
  /** Summary of the conversation for context */
  summary: text("summary"),
  isArchived: int("isArchived").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Individual messages within a conversation.
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("messageRole", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  /** OpenAI response_id for this specific message */
  responseId: varchar("responseId", { length: 256 }),
  /** Whether this message was from voice input */
  isVoiceInput: int("isVoiceInput").default(0).notNull(),
  /** Metadata like token usage, model info */
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * User preferences for the coaching experience.
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  preferredRoleId: int("preferredRoleId"),
  voiceEnabled: int("voiceEnabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;


/**
 * Card drawing history for reflection cards.
 * Tracks which cards users have drawn during their sessions.
 */
export const cardHistory = mysqlTable("card_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  cardId: varchar("cardId", { length: 64 }).notNull(),
  cardText: text("cardText").notNull(),
  cardImageUrl: varchar("cardImageUrl", { length: 512 }).notNull(),
  tags: json("tags").$type<string[]>(),
  guide: varchar("guide", { length: 64 }).notNull(), // e.g., "Anya", "Alma"
  drawnAt: timestamp("drawnAt").defaultNow().notNull(),
});

export type CardHistory = typeof cardHistory.$inferSelect;
export type InsertCardHistory = typeof cardHistory.$inferInsert;

/**
 * User usage tracking for monetization.
 * Tracks daily conversation counts and subscription status.
 */
export const userUsage = mysqlTable("user_usage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Current subscription tier: free, basic, premium */
  tier: mysqlEnum("tier", ["free", "basic", "premium"]).default("free").notNull(),
  /** Daily conversation count (resets at midnight UTC) */
  dailyConversations: int("dailyConversations").default(0).notNull(),
  /** Weekly conversation count (resets on Monday UTC) */
  weeklyConversations: int("weeklyConversations").default(0).notNull(),
  /** Monthly conversation count (resets on 1st of month UTC) */
  monthlyConversations: int("monthlyConversations").default(0).notNull(),
  /** Total lifetime conversations */
  totalConversations: int("totalConversations").default(0).notNull(),
  /** Daily message count */
  dailyMessages: int("dailyMessages").default(0).notNull(),
  /** Weekly message count (resets on Monday UTC) */
  weeklyMessages: int("weeklyMessages").default(0).notNull(),
  /** Monthly message count (resets on 1st of month UTC) */
  monthlyMessages: int("monthlyMessages").default(0).notNull(),
  /** Total lifetime messages */
  totalMessages: int("totalMessages").default(0).notNull(),
  /** Last reset date for daily counter (YYYY-MM-DD format) */
  lastDailyReset: varchar("lastDailyReset", { length: 10 }),
  /** Last reset date for weekly counter (YYYY-MM-DD format) */
  lastWeeklyReset: varchar("lastWeeklyReset", { length: 10 }),
  /** Last reset date for monthly counter (YYYY-MM format) */
  lastMonthlyReset: varchar("lastMonthlyReset", { length: 7 }),
  /** Subscription start date (if applicable) */
  subscriptionStartedAt: timestamp("subscriptionStartedAt"),
  /** Subscription end date (if applicable) */
  subscriptionEndsAt: timestamp("subscriptionEndsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserUsage = typeof userUsage.$inferSelect;
export type InsertUserUsage = typeof userUsage.$inferInsert;

/**
 * Detailed usage logs for analytics.
 * Records each significant user action for reporting.
 */
export const usageLogs = mysqlTable("usage_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Type of action: conversation_start, message_sent, card_drawn, etc. */
  actionType: mysqlEnum("actionType", [
    "conversation_start",
    "message_sent",
    "card_drawn",
    "apex_session",
    "voice_input"
  ]).notNull(),
  /** Associated guardian/coach slug (if applicable) */
  guardianSlug: varchar("guardianSlug", { length: 64 }),
  /** Associated conversation ID (if applicable) */
  conversationId: int("conversationId"),
  /** Additional metadata */
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = typeof usageLogs.$inferInsert;
