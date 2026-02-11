import { eq, sql, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { 
  InsertUser, users, 
  coachingRoles, InsertCoachingRole, CoachingRole,
  conversations, InsertConversation, Conversation,
  messages, InsertMessage, Message,
  userPreferences, InsertUserPreferences,
  cardHistory, InsertCardHistory, CardHistory,
  userUsage, InsertUserUsage, UserUsage,
  usageLogs, InsertUsageLog, UsageLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = neon(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ User Operations ============
export async function upsertUser(user: InsertUser): Promise<{ isNewUser: boolean }> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return { isNewUser: false };
  }

  try {
    // Check if user already exists
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
    const isNewUser = existingUser.length === 0;

    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerGoogleId || (ENV.ownerOpenId && user.openId === ENV.ownerOpenId)) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // PostgreSQL upsert using ON CONFLICT
    if (isNewUser) {
      await db.insert(users).values(values);
    } else {
      await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
    }

    return { isNewUser };
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get detailed user information with usage stats for admin view
 */
export async function getUserDetailWithUsage(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get user info
  const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userResult.length === 0) return null;
  const user = userResult[0];

  // Get usage stats
  const usageResult = await db.select().from(userUsage).where(eq(userUsage.userId, userId)).limit(1);
  const usage = usageResult.length > 0 ? usageResult[0] : null;

  // Get conversation count by coach
  const conversationsByCoach = await db.select({
    roleId: conversations.roleId,
    roleName: coachingRoles.name,
    roleSlug: coachingRoles.slug,
    count: sql<number>`COUNT(*)`,
  })
    .from(conversations)
    .leftJoin(coachingRoles, eq(conversations.roleId, coachingRoles.id))
    .where(eq(conversations.userId, userId))
    .groupBy(conversations.roleId, coachingRoles.name, coachingRoles.slug);

  // Get recent conversations
  const recentConversations = await db.select({
    id: conversations.id,
    title: conversations.title,
    roleId: conversations.roleId,
    roleName: coachingRoles.name,
    createdAt: conversations.createdAt,
    updatedAt: conversations.updatedAt,
  })
    .from(conversations)
    .leftJoin(coachingRoles, eq(conversations.roleId, coachingRoles.id))
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt))
    .limit(20);

  return {
    user,
    usage,
    conversationsByCoach,
    recentConversations,
  };
}

// ============ Coaching Roles Operations ============
export async function getActiveCoachingRoles(): Promise<CoachingRole[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select()
    .from(coachingRoles)
    .where(eq(coachingRoles.isActive, 1))
    .orderBy(coachingRoles.sortOrder);
  return result;
}

export async function getCoachingRoleById(id: number): Promise<CoachingRole | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(coachingRoles)
    .where(eq(coachingRoles.id, id))
    .limit(1);
  return result[0];
}

export async function getCoachingRoleBySlug(slug: string): Promise<CoachingRole | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(coachingRoles)
    .where(eq(coachingRoles.slug, slug))
    .limit(1);
  return result[0];
}

export async function createCoachingRole(role: InsertCoachingRole): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(coachingRoles).values(role);
}

export async function seedDefaultRoles(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const existingRoles = await db.select().from(coachingRoles).limit(1);
  if (existingRoles.length > 0) return;
  
  const defaultRoles: InsertCoachingRole[] = [
    { slug: "career", name: "Andy", description: "Guardian of North Star — guiding career and purpose with clarity and vision.", icon: "Briefcase", color: "#60a5fa", avatar: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/dCYqiRmHEEeSnkZx.png", sortOrder: 1 },
    { slug: "relationships", name: "Alma", description: "Guardian of Venus — nurturing love, freedom, and meaningful relationships.", icon: "Heart", color: "#fb7185", avatar: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/lLrTeiYvdbDStChq.png", sortOrder: 2 },
    { slug: "anxiety", name: "Anya", description: "Guardian of Jupiter — easing anxiety and inner chaos with calm presence.", icon: "Sparkles", color: "#4ade80", avatar: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/jvaFmJRQXdASRYQl.png", sortOrder: 3 },
    { slug: "leadership", name: "Alan", description: "Guardian of Mars — empowering leadership, courage, and confident action.", icon: "Crown", color: "#fb923c", avatar: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/APsAVJvhJfONWSsS.png", sortOrder: 4 },
    { slug: "transformation", name: "Axel", description: "Your inner mirror — revealing truth and guiding transformation.", icon: "Compass", color: "#818cf8", avatar: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/KTbsWTRNwAdhObNB.png", sortOrder: 5 },
    { slug: "legacy", name: "Atlas", description: "Guardian of Neptune — exploring legacy and life's deeper meaning.", icon: "Globe", color: "#38bdf8", avatar: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/ZeGqdDryhkHBPLgi.png", sortOrder: 6 },
    { slug: "wisdom", name: "Amos", description: "Guardian of the Galaxy — offering wisdom and integration across life domains.", icon: "Brain", color: "#a78bfa", avatar: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/eOVjFlKTtQnFuGnK.png", sortOrder: 7 },
    { slug: "emotions", name: "Annie", description: "Guardian of the Heart — supporting emotional wellness and inner peace.", icon: "Leaf", color: "#f472b6", avatar: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663273647099/plzLgfWzNLLtfILt.png", sortOrder: 8 },
  ];
  
  for (const role of defaultRoles) {
    await db.insert(coachingRoles).values(role);
  }
}

// ============ Conversation Operations ============
export async function getUserConversations(userId: number): Promise<(Conversation & { role: CoachingRole | null })[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select()
    .from(conversations)
    .leftJoin(coachingRoles, eq(conversations.roleId, coachingRoles.id))
    .where(and(eq(conversations.userId, userId), eq(conversations.isArchived, 0)))
    .orderBy(desc(conversations.updatedAt));
  
  return result.map(r => ({
    ...r.conversations,
    role: r.coaching_roles
  }));
}

export async function getConversationById(id: number, userId: number): Promise<Conversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(conversations)
    .where(and(eq(conversations.id, id), eq(conversations.userId, userId)))
    .limit(1);
  return result[0];
}

export async function createConversation(data: InsertConversation): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(conversations).values(data).returning({ id: conversations.id });
  return result[0].id;
}

export async function updateConversation(id: number, data: Partial<InsertConversation>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(conversations).set(data).where(eq(conversations.id, id));
}

// ============ Message Operations ============
export async function getConversationMessages(conversationId: number): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);
  return result;
}

export async function createMessage(data: InsertMessage): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values(data).returning({ id: messages.id });
  return result[0].id;
}

// ============ User Preferences Operations ============
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  return result[0];
}

export async function upsertUserPreferences(data: InsertUserPreferences): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // PostgreSQL upsert: check if exists, then insert or update
  const existing = await db.select({ id: userPreferences.id })
    .from(userPreferences)
    .where(eq(userPreferences.userId, data.userId))
    .limit(1);
  
  if (existing.length === 0) {
    await db.insert(userPreferences).values(data);
  } else {
    await db.update(userPreferences).set({
      preferredRoleId: data.preferredRoleId,
      voiceEnabled: data.voiceEnabled,
    }).where(eq(userPreferences.userId, data.userId));
  }
}

// ============ Admin Analytics Operations ============

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;
  
  // Total users
  const totalUsersResult = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  const totalUsers = totalUsersResult[0]?.count || 0;
  
  // Total conversations
  const totalConversationsResult = await db.select({ count: sql<number>`COUNT(*)` }).from(conversations);
  const totalConversations = totalConversationsResult[0]?.count || 0;
  
  // Total messages
  const totalMessagesResult = await db.select({ count: sql<number>`COUNT(*)` }).from(messages);
  const totalMessages = totalMessagesResult[0]?.count || 0;
  
  // Users registered in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsersResult = await db.select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(sql`${users.createdAt} >= ${sevenDaysAgo}`);
  const newUsersLast7Days = newUsersResult[0]?.count || 0;
  
  // Active users (had conversation in last 7 days)
  const activeUsersResult = await db.select({ count: sql<number>`COUNT(DISTINCT ${conversations.userId})` })
    .from(conversations)
    .where(sql`${conversations.createdAt} >= ${sevenDaysAgo}`);
  const activeUsersLast7Days = activeUsersResult[0]?.count || 0;
  
  return {
    totalUsers,
    totalConversations,
    totalMessages,
    newUsersLast7Days,
    activeUsersLast7Days,
  };
}

export async function getCoachUsageStats() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    roleId: conversations.roleId,
    roleName: coachingRoles.name,
    roleSlug: coachingRoles.slug,
    conversationCount: sql<number>`COUNT(${conversations.id})`,
    messageCount: sql<number>`(SELECT COUNT(*) FROM messages WHERE messages."conversationId" IN (SELECT id FROM conversations c2 WHERE c2."roleId" = ${conversations.roleId}))`,
  })
    .from(conversations)
    .leftJoin(coachingRoles, eq(conversations.roleId, coachingRoles.id))
    .groupBy(conversations.roleId, coachingRoles.name, coachingRoles.slug)
    .orderBy(sql`COUNT(${conversations.id}) DESC`);
  
  return result;
}

export async function getUserGrowthData(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const result = await db.select({
    date: sql<string>`DATE(${users.createdAt})`,
    count: sql<number>`COUNT(*)`,
  })
    .from(users)
    .where(sql`${users.createdAt} >= ${startDate}`)
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt})`);
  
  return result;
}

export async function getConversationGrowthData(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const result = await db.select({
    date: sql<string>`DATE(${conversations.createdAt})`,
    count: sql<number>`COUNT(*)`,
  })
    .from(conversations)
    .where(sql`${conversations.createdAt} >= ${startDate}`)
    .groupBy(sql`DATE(${conversations.createdAt})`)
    .orderBy(sql`DATE(${conversations.createdAt})`);
  
  return result;
}

export async function getRecentConversations(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    id: conversations.id,
    title: conversations.title,
    userId: conversations.userId,
    userName: users.name,
    userEmail: users.email,
    roleName: coachingRoles.name,
    roleSlug: coachingRoles.slug,
    createdAt: conversations.createdAt,
    updatedAt: conversations.updatedAt,
  })
    .from(conversations)
    .leftJoin(users, eq(conversations.userId, users.id))
    .leftJoin(coachingRoles, eq(conversations.roleId, coachingRoles.id))
    .orderBy(sql`${conversations.updatedAt} DESC`)
    .limit(limit);
  
  return result;
}

export async function getAllUsers(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
    conversationCount: sql<number>`(SELECT COUNT(*) FROM conversations WHERE conversations."userId" = ${users.id})`,
  })
    .from(users)
    .orderBy(sql`${users.createdAt} DESC`)
    .limit(limit)
    .offset(offset);
  
  return result;
}

// ============ Apex Roundtable Operations ============

export async function getConversationsWithMessages(conversationIds: number[], userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = [];
  
  for (const convId of conversationIds) {
    // Verify the conversation belongs to the user
    const conv = await db.select({
      id: conversations.id,
      title: conversations.title,
      roleId: conversations.roleId,
      createdAt: conversations.createdAt,
    })
      .from(conversations)
      .where(and(eq(conversations.id, convId), eq(conversations.userId, userId)))
      .limit(1);
    
    if (conv.length === 0) continue;
    
    // Get the role info
    const role = await db.select({
      name: coachingRoles.name,
      slug: coachingRoles.slug,
    })
      .from(coachingRoles)
      .where(eq(coachingRoles.id, conv[0].roleId))
      .limit(1);
    
    // Get messages for this conversation
    const msgs = await db.select({
      role: messages.role,
      content: messages.content,
      createdAt: messages.createdAt,
    })
      .from(messages)
      .where(eq(messages.conversationId, convId))
      .orderBy(messages.createdAt);
    
    result.push({
      id: conv[0].id,
      title: conv[0].title,
      coachName: role[0]?.name || "Unknown Coach",
      coachSlug: role[0]?.slug || "unknown",
      createdAt: conv[0].createdAt,
      messages: msgs,
    });
  }
  
  return result;
}


// ============ Card History Operations ============

export async function saveCardToHistory(data: InsertCardHistory): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(cardHistory).values(data).returning({ id: cardHistory.id });
  return result[0].id;
}

export async function getUserCardHistory(userId: number, guide?: string): Promise<CardHistory[]> {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select()
    .from(cardHistory)
    .where(guide 
      ? and(eq(cardHistory.userId, userId), eq(cardHistory.guide, guide))
      : eq(cardHistory.userId, userId))
    .orderBy(desc(cardHistory.drawnAt));
  
  const result = await query;
  return result;
}

export async function deleteCardFromHistory(id: number, userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.delete(cardHistory).where(and(eq(cardHistory.id, id), eq(cardHistory.userId, userId)));
}

// ============ Usage Tracking Operations ============

/**
 * Get current date strings for reset comparison
 */
function getDateStrings() {
  const now = new Date();
  const daily = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const monthly = daily.substring(0, 7); // YYYY-MM
  
  // Get Monday of current week
  const dayOfWeek = now.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + mondayOffset);
  const weekly = monday.toISOString().split('T')[0];
  
  return { daily, weekly, monthly };
}

/**
 * Get or create user usage record, with automatic counter resets
 */
export async function getUserUsage(userId: number): Promise<UserUsage | null> {
  const db = await getDb();
  if (!db) return null;
  
  const { daily, weekly, monthly } = getDateStrings();
  
  // Try to get existing record
  const existing = await db.select()
    .from(userUsage)
    .where(eq(userUsage.userId, userId))
    .limit(1);
  
  if (existing.length === 0) {
    // Create new record
    await db.insert(userUsage).values({
      userId,
      tier: 'free',
      dailyConversations: 0,
      weeklyConversations: 0,
      monthlyConversations: 0,
      totalConversations: 0,
      dailyMessages: 0,
      totalMessages: 0,
      lastDailyReset: daily,
      lastWeeklyReset: weekly,
      lastMonthlyReset: monthly,
    });
    
    const newRecord = await db.select()
      .from(userUsage)
      .where(eq(userUsage.userId, userId))
      .limit(1);
    return newRecord[0] || null;
  }
  
  const record = existing[0];
  const updates: Partial<InsertUserUsage> = {};
  
  // Check if daily reset needed
  if (record.lastDailyReset !== daily) {
    updates.dailyConversations = 0;
    updates.dailyMessages = 0;
    updates.lastDailyReset = daily;
  }
  
  // Check if weekly reset needed
  if (record.lastWeeklyReset !== weekly) {
    updates.weeklyConversations = 0;
    updates.lastWeeklyReset = weekly;
  }
  
  // Check if monthly reset needed
  if (record.lastMonthlyReset !== monthly) {
    updates.monthlyConversations = 0;
    updates.lastMonthlyReset = monthly;
  }
  
  // Apply resets if needed
  if (Object.keys(updates).length > 0) {
    await db.update(userUsage)
      .set(updates)
      .where(eq(userUsage.userId, userId));
    
    // Return updated record
    const updated = await db.select()
      .from(userUsage)
      .where(eq(userUsage.userId, userId))
      .limit(1);
    return updated[0] || null;
  }
  
  return record;
}

/**
 * Increment conversation count for a user
 * Returns the new total conversation count for milestone checking
 */
export async function incrementConversationCount(userId: number): Promise<{ newTotal: number }> {
  const db = await getDb();
  if (!db) return { newTotal: 0 };
  
  // Ensure user has a usage record (with resets applied)
  await getUserUsage(userId);
  
  await db.update(userUsage)
    .set({
      dailyConversations: sql`${userUsage.dailyConversations} + 1`,
      weeklyConversations: sql`${userUsage.weeklyConversations} + 1`,
      monthlyConversations: sql`${userUsage.monthlyConversations} + 1`,
      totalConversations: sql`${userUsage.totalConversations} + 1`,
    })
    .where(eq(userUsage.userId, userId));
  
  // Get the new total for milestone checking
  const result = await db.select({ total: userUsage.totalConversations })
    .from(userUsage)
    .where(eq(userUsage.userId, userId))
    .limit(1);
  
  return { newTotal: result[0]?.total || 0 };
}

/**
 * Increment message count for a user
 */
export async function incrementMessageCount(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Ensure user has a usage record (with resets applied)
  await getUserUsage(userId);
  
  await db.update(userUsage)
    .set({
      dailyMessages: sql`${userUsage.dailyMessages} + 1`,
      weeklyMessages: sql`${userUsage.weeklyMessages} + 1`,
      monthlyMessages: sql`${userUsage.monthlyMessages} + 1`,
      totalMessages: sql`${userUsage.totalMessages} + 1`,
    })
    .where(eq(userUsage.userId, userId));
}

/**
 * Log a usage action for analytics
 */
export async function logUsageAction(data: InsertUsageLog): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.insert(usageLogs).values(data);
}

/**
 * Get total registered user count from users table
 */
export async function getTotalUserCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({
    count: sql<number>`COUNT(*)`
  }).from(users);
  
  return Number(result[0]?.count) || 0;
}

/**
 * Get usage statistics for admin dashboard
 */
export async function getUsageStats() {
  const db = await getDb();
  if (!db) return null;
  
  // Total usage across all users
  const totalStats = await db.select({
    totalConversations: sql<number>`SUM(${userUsage.totalConversations})`,
    totalMessages: sql<number>`SUM(${userUsage.totalMessages})`,
    freeUsers: sql<number>`SUM(CASE WHEN ${userUsage.tier} = 'free' THEN 1 ELSE 0 END)`,
    basicUsers: sql<number>`SUM(CASE WHEN ${userUsage.tier} = 'basic' THEN 1 ELSE 0 END)`,
    premiumUsers: sql<number>`SUM(CASE WHEN ${userUsage.tier} = 'premium' THEN 1 ELSE 0 END)`,
  }).from(userUsage);
  
  // Today's activity
  const { daily, weekly, monthly } = getDateStrings();
  const todayStats = await db.select({
    activeUsers: sql<number>`COUNT(*)`,
    todayConversations: sql<number>`SUM(${userUsage.dailyConversations})`,
    todayMessages: sql<number>`SUM(${userUsage.dailyMessages})`,
  })
    .from(userUsage)
    .where(eq(userUsage.lastDailyReset, daily));
  
  // This week's activity
  const weekStats = await db.select({
    weekConversations: sql<number>`SUM(${userUsage.weeklyConversations})`,
    weekMessages: sql<number>`SUM(${userUsage.weeklyMessages})`,
  })
    .from(userUsage)
    .where(eq(userUsage.lastWeeklyReset, weekly));
  
  // This month's activity
  const monthStats = await db.select({
    monthConversations: sql<number>`SUM(${userUsage.monthlyConversations})`,
    monthMessages: sql<number>`SUM(${userUsage.monthlyMessages})`,
  })
    .from(userUsage)
    .where(eq(userUsage.lastMonthlyReset, monthly));
  
  const total = totalStats[0] || { totalConversations: 0, totalMessages: 0, freeUsers: 0, basicUsers: 0, premiumUsers: 0 };
  const today = todayStats[0] || { activeUsers: 0, todayConversations: 0, todayMessages: 0 };
  const week = weekStats[0] || { weekConversations: 0, weekMessages: 0 };
  const month = monthStats[0] || { monthConversations: 0, monthMessages: 0 };
  
  return {
    totalConversations: total.totalConversations || 0,
    totalMessages: total.totalMessages || 0,
    freeUsers: total.freeUsers || 0,
    basicUsers: total.basicUsers || 0,
    premiumUsers: total.premiumUsers || 0,
    activeUsersToday: today.activeUsers || 0,
    todayConversations: today.todayConversations || 0,
    todayMessages: today.todayMessages || 0,
    weekConversations: week.weekConversations || 0,
    weekMessages: week.weekMessages || 0,
    monthConversations: month.monthConversations || 0,
    monthMessages: month.monthMessages || 0,
    avgMessagesPerUser: total.totalMessages && total.totalConversations 
      ? (total.totalMessages / Math.max(total.freeUsers + total.basicUsers + total.premiumUsers, 1)) 
      : 0,
  };
}

/**
 * Get top users by usage
 */
export async function getTopUsersByUsage(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    userId: userUsage.userId,
    userName: users.name,
    userEmail: users.email,
    tier: userUsage.tier,
    totalConversations: userUsage.totalConversations,
    totalMessages: userUsage.totalMessages,
    dailyConversations: userUsage.dailyConversations,
    dailyMessages: userUsage.dailyMessages,
  })
    .from(userUsage)
    .leftJoin(users, eq(userUsage.userId, users.id))
    .orderBy(desc(userUsage.totalMessages))
    .limit(limit);
  
  return result;
}

/**
 * Get usage logs for a specific user
 */
export async function getUserUsageLogs(userId: number, limit: number = 50): Promise<UsageLog[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select()
    .from(usageLogs)
    .where(eq(usageLogs.userId, userId))
    .orderBy(desc(usageLogs.createdAt))
    .limit(limit);
  
  return result;
}

/**
 * Get action counts by type for analytics
 */
export async function getActionTypeCounts(days: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const result = await db.select({
    actionType: usageLogs.actionType,
    count: sql<number>`COUNT(*)`,
  })
    .from(usageLogs)
    .where(sql`${usageLogs.createdAt} >= ${startDate}`)
    .groupBy(usageLogs.actionType);
  
  return result;
}

/**
 * Get all users with usage data for CSV export
 */
export async function getAllUsersForExport() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    userId: users.id,
    userName: users.name,
    userEmail: users.email,
    role: users.role,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
    tier: userUsage.tier,
    totalConversations: userUsage.totalConversations,
    totalMessages: userUsage.totalMessages,
    dailyConversations: userUsage.dailyConversations,
    dailyMessages: userUsage.dailyMessages,
    weeklyConversations: userUsage.weeklyConversations,
    weeklyMessages: userUsage.weeklyMessages,
    monthlyConversations: userUsage.monthlyConversations,
    monthlyMessages: userUsage.monthlyMessages,
  })
    .from(users)
    .leftJoin(userUsage, eq(users.id, userUsage.userId))
    .orderBy(desc(users.createdAt));
  
  return result;
}

/**
 * Get all usage logs for CSV export
 */
export async function getAllUsageLogsForExport(days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const result = await db.select({
    logId: usageLogs.id,
    userId: usageLogs.userId,
    userName: users.name,
    userEmail: users.email,
    actionType: usageLogs.actionType,
    metadata: usageLogs.metadata,
    createdAt: usageLogs.createdAt,
  })
    .from(usageLogs)
    .leftJoin(users, eq(usageLogs.userId, users.id))
    .where(sql`${usageLogs.createdAt} >= ${startDate}`)
    .orderBy(desc(usageLogs.createdAt));
  
  return result;
}


/**
 * Get daily summary for notifications
 * Returns stats for yesterday (or today if called at end of day)
 */
export async function getDailySummary() {
  const db = await getDb();
  if (!db) return null;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
  const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));
  
  // New users registered yesterday
  const newUsersResult = await db.select({
    count: sql<number>`COUNT(*)`,
  })
    .from(users)
    .where(sql`${users.createdAt} >= ${startOfYesterday} AND ${users.createdAt} <= ${endOfYesterday}`);
  
  // Activity from usage logs yesterday
  const activityResult = await db.select({
    totalActions: sql<number>`COUNT(*)`,
    conversations: sql<number>`SUM(CASE WHEN ${usageLogs.actionType} = 'conversation_start' THEN 1 ELSE 0 END)`,
    messages: sql<number>`SUM(CASE WHEN ${usageLogs.actionType} = 'message_sent' THEN 1 ELSE 0 END)`,
    cardDraws: sql<number>`SUM(CASE WHEN ${usageLogs.actionType} = 'card_drawn' THEN 1 ELSE 0 END)`,
    apexSessions: sql<number>`SUM(CASE WHEN ${usageLogs.actionType} = 'apex_session' THEN 1 ELSE 0 END)`,
    activeUsers: sql<number>`COUNT(DISTINCT ${usageLogs.userId})`,
  })
    .from(usageLogs)
    .where(sql`${usageLogs.createdAt} >= ${startOfYesterday} AND ${usageLogs.createdAt} <= ${endOfYesterday}`);
  
  // Most popular guardian yesterday
  const guardianResult = await db.select({
    guardianSlug: usageLogs.guardianSlug,
    count: sql<number>`COUNT(*)`,
  })
    .from(usageLogs)
    .where(sql`${usageLogs.createdAt} >= ${startOfYesterday} AND ${usageLogs.createdAt} <= ${endOfYesterday} AND ${usageLogs.guardianSlug} IS NOT NULL`)
    .groupBy(usageLogs.guardianSlug)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(1);
  
  // Total users count
  const totalUsersResult = await db.select({
    count: sql<number>`COUNT(*)`,
  }).from(users);
  
  const newUsers = newUsersResult[0]?.count || 0;
  const activity = activityResult[0] || { totalActions: 0, conversations: 0, messages: 0, cardDraws: 0, apexSessions: 0, activeUsers: 0 };
  const topGuardian = guardianResult[0]?.guardianSlug || 'None';
  const totalUsers = totalUsersResult[0]?.count || 0;
  
  return {
    date: startOfYesterday.toISOString().split('T')[0],
    newUsers,
    totalUsers,
    activeUsers: activity.activeUsers || 0,
    conversations: activity.conversations || 0,
    messages: activity.messages || 0,
    cardDraws: activity.cardDraws || 0,
    apexSessions: activity.apexSessions || 0,
    topGuardian,
  };
}

/**
 * Get weekly summary for notifications
 * Returns stats for the past 7 days
 */
export async function getWeeklySummary() {
  const db = await getDb();
  if (!db) return null;
  
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  // New users this week
  const newUsersThisWeek = await db.select({
    count: sql<number>`COUNT(*)`,
  })
    .from(users)
    .where(sql`${users.createdAt} >= ${weekAgo}`);
  
  // New users last week (for comparison)
  const newUsersLastWeek = await db.select({
    count: sql<number>`COUNT(*)`,
  })
    .from(users)
    .where(sql`${users.createdAt} >= ${twoWeeksAgo} AND ${users.createdAt} < ${weekAgo}`);
  
  // Activity this week
  const activityThisWeek = await db.select({
    totalActions: sql<number>`COUNT(*)`,
    conversations: sql<number>`SUM(CASE WHEN ${usageLogs.actionType} = 'conversation_start' THEN 1 ELSE 0 END)`,
    messages: sql<number>`SUM(CASE WHEN ${usageLogs.actionType} = 'message_sent' THEN 1 ELSE 0 END)`,
    cardDraws: sql<number>`SUM(CASE WHEN ${usageLogs.actionType} = 'card_drawn' THEN 1 ELSE 0 END)`,
    apexSessions: sql<number>`SUM(CASE WHEN ${usageLogs.actionType} = 'apex_session' THEN 1 ELSE 0 END)`,
    activeUsers: sql<number>`COUNT(DISTINCT ${usageLogs.userId})`,
  })
    .from(usageLogs)
    .where(sql`${usageLogs.createdAt} >= ${weekAgo}`);
  
  // Activity last week (for comparison)
  const activityLastWeek = await db.select({
    conversations: sql<number>`SUM(CASE WHEN ${usageLogs.actionType} = 'conversation_start' THEN 1 ELSE 0 END)`,
    messages: sql<number>`SUM(CASE WHEN ${usageLogs.actionType} = 'message_sent' THEN 1 ELSE 0 END)`,
    activeUsers: sql<number>`COUNT(DISTINCT ${usageLogs.userId})`,
  })
    .from(usageLogs)
    .where(sql`${usageLogs.createdAt} >= ${twoWeeksAgo} AND ${usageLogs.createdAt} < ${weekAgo}`);
  
  // Guardian breakdown this week
  const guardianBreakdown = await db.select({
    guardianSlug: usageLogs.guardianSlug,
    count: sql<number>`COUNT(*)`,
  })
    .from(usageLogs)
    .where(sql`${usageLogs.createdAt} >= ${weekAgo} AND ${usageLogs.guardianSlug} IS NOT NULL`)
    .groupBy(usageLogs.guardianSlug)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(5);
  
  // Total users count
  const totalUsersResult = await db.select({
    count: sql<number>`COUNT(*)`,
  }).from(users);
  
  const thisWeek = activityThisWeek[0] || { totalActions: 0, conversations: 0, messages: 0, cardDraws: 0, apexSessions: 0, activeUsers: 0 };
  const lastWeek = activityLastWeek[0] || { conversations: 0, messages: 0, activeUsers: 0 };
  const newThisWeek = newUsersThisWeek[0]?.count || 0;
  const newLastWeek = newUsersLastWeek[0]?.count || 0;
  const totalUsers = totalUsersResult[0]?.count || 0;
  
  // Calculate growth percentages
  const userGrowth = newLastWeek > 0 ? Math.round(((newThisWeek - newLastWeek) / newLastWeek) * 100) : (newThisWeek > 0 ? 100 : 0);
  const conversationGrowth = (lastWeek.conversations || 0) > 0 
    ? Math.round((((thisWeek.conversations || 0) - (lastWeek.conversations || 0)) / (lastWeek.conversations || 1)) * 100) 
    : ((thisWeek.conversations || 0) > 0 ? 100 : 0);
  
  return {
    weekEnding: now.toISOString().split('T')[0],
    newUsers: newThisWeek,
    newUsersLastWeek: newLastWeek,
    userGrowth,
    totalUsers,
    activeUsers: thisWeek.activeUsers || 0,
    activeUsersLastWeek: lastWeek.activeUsers || 0,
    conversations: thisWeek.conversations || 0,
    conversationsLastWeek: lastWeek.conversations || 0,
    conversationGrowth,
    messages: thisWeek.messages || 0,
    cardDraws: thisWeek.cardDraws || 0,
    apexSessions: thisWeek.apexSessions || 0,
    guardianBreakdown: guardianBreakdown.map(g => ({
      guardian: g.guardianSlug || 'Unknown',
      count: g.count || 0,
    })),
  };
}
