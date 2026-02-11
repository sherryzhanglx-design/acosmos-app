import { integer, pgEnum, pgTable, text, timestamp, varchar, json, serial, boolean } from "drizzle-orm/pg-core";

/**
 * PostgreSQL enum types
 */
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant"]);
export const tierEnum = pgEnum("tier", ["free", "basic", "premium"]);
export const actionTypeEnum = pgEnum("action_type", [
  "conversation_start",
  "message_sent",
  "card_drawn",
  "apex_session",
  "voice_input"
]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Coaching roles available in the platform.
 * Each role represents a different coaching context (Career, Relationships, etc.)
 */
export const coachingRoles = pgTable("coaching_roles", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  promptId: varchar("promptId", { length: 128 }),
  icon: varchar("icon", { length: 64 }),
  avatar: varchar("avatar", { length: 512 }),
  color: varchar("color", { length: 32 }),
  isActive: integer("isActive").default(1).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CoachingRole = typeof coachingRoles.$inferSelect;
export type InsertCoachingRole = typeof coachingRoles.$inferInsert;

/**
 * Conversations between users and AI coaches.
 * Each conversation is associated with a specific coaching role.
 */
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  roleId: integer("roleId").notNull(),
  title: varchar("title", { length: 256 }),
  /** OpenAI previous_response_id for session continuity */
  lastResponseId: varchar("lastResponseId", { length: 256 }),
  /** Summary of the conversation for context */
  summary: text("summary"),
  isArchived: integer("isArchived").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

/**
 * Individual messages within a conversation.
 */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId").notNull(),
  role: messageRoleEnum("messageRole").notNull(),
  content: text("content").notNull(),
  /** OpenAI response_id for this specific message */
  responseId: varchar("responseId", { length: 256 }),
  /** Whether this message was from voice input */
  isVoiceInput: integer("isVoiceInput").default(0).notNull(),
  /** Metadata like token usage, model info */
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * User preferences for the coaching experience.
 */
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  preferredRoleId: integer("preferredRoleId"),
  voiceEnabled: integer("voiceEnabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;


/**
 * Card drawing history for reflection cards.
 * Tracks which cards users have drawn during their sessions.
 */
export const cardHistory = pgTable("card_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
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
export const userUsage = pgTable("user_usage", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  /** Current subscription tier: free, basic, premium */
  tier: tierEnum("tier").default("free").notNull(),
  /** Daily conversation count (resets at midnight UTC) */
  dailyConversations: integer("dailyConversations").default(0).notNull(),
  /** Weekly conversation count (resets on Monday UTC) */
  weeklyConversations: integer("weeklyConversations").default(0).notNull(),
  /** Monthly conversation count (resets on 1st of month UTC) */
  monthlyConversations: integer("monthlyConversations").default(0).notNull(),
  /** Total lifetime conversations */
  totalConversations: integer("totalConversations").default(0).notNull(),
  /** Daily message count */
  dailyMessages: integer("dailyMessages").default(0).notNull(),
  /** Weekly message count (resets on Monday UTC) */
  weeklyMessages: integer("weeklyMessages").default(0).notNull(),
  /** Monthly message count (resets on 1st of month UTC) */
  monthlyMessages: integer("monthlyMessages").default(0).notNull(),
  /** Total lifetime messages */
  totalMessages: integer("totalMessages").default(0).notNull(),
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserUsage = typeof userUsage.$inferSelect;
export type InsertUserUsage = typeof userUsage.$inferInsert;

/**
 * Detailed usage logs for analytics.
 * Records each significant user action for reporting.
 */
export const usageLogs = pgTable("usage_logs", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  /** Type of action: conversation_start, message_sent, card_drawn, etc. */
  actionType: actionTypeEnum("actionType").notNull(),
  /** Associated guardian/coach slug (if applicable) */
  guardianSlug: varchar("guardianSlug", { length: 64 }),
  /** Associated conversation ID (if applicable) */
  conversationId: integer("conversationId"),
  /** Additional metadata */
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = typeof usageLogs.$inferInsert;
