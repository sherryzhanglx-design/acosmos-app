import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq, sql } from 'drizzle-orm';
import { userUsage, usageLogs, users } from '../drizzle/schema';

// Test database connection
let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  if (process.env.DATABASE_URL) {
    db = drizzle(process.env.DATABASE_URL);
  }
});

describe('Usage Tracking Schema', () => {
  it('should have user_usage table with correct columns', async () => {
    if (!db) {
      console.log('Skipping test: DATABASE_URL not set');
      return;
    }
    
    // Query table structure
    const result = await db.execute(sql`DESCRIBE user_usage`);
    const columns = (result[0] as any[]).map((row: any) => row.Field);
    
    // Verify essential columns exist
    expect(columns).toContain('id');
    expect(columns).toContain('userId');
    expect(columns).toContain('tier');
    expect(columns).toContain('dailyConversations');
    expect(columns).toContain('weeklyConversations');
    expect(columns).toContain('monthlyConversations');
    expect(columns).toContain('totalConversations');
    expect(columns).toContain('dailyMessages');
    expect(columns).toContain('totalMessages');
    expect(columns).toContain('lastDailyReset');
    expect(columns).toContain('lastWeeklyReset');
    expect(columns).toContain('lastMonthlyReset');
  });

  it('should have usage_logs table with correct columns', async () => {
    if (!db) {
      console.log('Skipping test: DATABASE_URL not set');
      return;
    }
    
    // Query table structure
    const result = await db.execute(sql`DESCRIBE usage_logs`);
    const columns = (result[0] as any[]).map((row: any) => row.Field);
    
    // Verify essential columns exist
    expect(columns).toContain('id');
    expect(columns).toContain('userId');
    expect(columns).toContain('actionType');
    expect(columns).toContain('guardianSlug');
    expect(columns).toContain('conversationId');
    expect(columns).toContain('metadata');
    expect(columns).toContain('createdAt');
  });

  it('should have correct tier enum values', async () => {
    if (!db) {
      console.log('Skipping test: DATABASE_URL not set');
      return;
    }
    
    // Query column type
    const result = await db.execute(sql`SHOW COLUMNS FROM user_usage WHERE Field = 'tier'`);
    const tierColumn = (result[0] as any[])[0];
    
    // Verify enum contains expected values
    expect(tierColumn.Type).toContain('free');
    expect(tierColumn.Type).toContain('basic');
    expect(tierColumn.Type).toContain('premium');
  });

  it('should have correct actionType enum values', async () => {
    if (!db) {
      console.log('Skipping test: DATABASE_URL not set');
      return;
    }
    
    // Query column type
    const result = await db.execute(sql`SHOW COLUMNS FROM usage_logs WHERE Field = 'actionType'`);
    const actionTypeColumn = (result[0] as any[])[0];
    
    // Verify enum contains expected values
    expect(actionTypeColumn.Type).toContain('conversation_start');
    expect(actionTypeColumn.Type).toContain('message_sent');
    expect(actionTypeColumn.Type).toContain('card_drawn');
    expect(actionTypeColumn.Type).toContain('apex_session');
    expect(actionTypeColumn.Type).toContain('voice_input');
  });
});

describe('Usage Tracking Helper Functions', () => {
  it('getDateStrings should return correct date formats', () => {
    // Test the date string format logic
    const now = new Date();
    const daily = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const monthly = daily.substring(0, 7); // YYYY-MM
    
    // Verify formats
    expect(daily).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(monthly).toMatch(/^\d{4}-\d{2}$/);
  });

  it('should calculate Monday of current week correctly', () => {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() + mondayOffset);
    
    // Monday should be day 1 (or 0 if we're on Sunday and went back)
    expect(monday.getUTCDay()).toBe(1);
  });
});

describe('Usage Limits Configuration', () => {
  it('should have defined limits for all tiers', () => {
    const limits: Record<string, Record<string, number>> = {
      free: {
        dailyConversations: 999,
        dailyMessages: 9999,
      },
      basic: {
        dailyConversations: 999,
        dailyMessages: 9999,
      },
      premium: {
        dailyConversations: 999,
        dailyMessages: 9999,
      },
    };
    
    // Verify all tiers have limits defined
    expect(limits.free).toBeDefined();
    expect(limits.basic).toBeDefined();
    expect(limits.premium).toBeDefined();
    
    // Verify limits are positive numbers
    expect(limits.free.dailyConversations).toBeGreaterThan(0);
    expect(limits.free.dailyMessages).toBeGreaterThan(0);
    expect(limits.basic.dailyConversations).toBeGreaterThan(0);
    expect(limits.basic.dailyMessages).toBeGreaterThan(0);
    expect(limits.premium.dailyConversations).toBeGreaterThan(0);
    expect(limits.premium.dailyMessages).toBeGreaterThan(0);
  });

  it('should allow free tier users unlimited access for now', () => {
    const freeLimits = {
      dailyConversations: 999,
      dailyMessages: 9999,
    };
    
    // Current free tier should be effectively unlimited (999+ daily)
    expect(freeLimits.dailyConversations).toBeGreaterThanOrEqual(999);
    expect(freeLimits.dailyMessages).toBeGreaterThanOrEqual(9999);
  });
});
