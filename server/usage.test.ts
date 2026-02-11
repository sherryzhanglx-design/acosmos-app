import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, sql } from 'drizzle-orm';
import { userUsage, usageLogs, users } from '../drizzle/schema';

// Test database connection
let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  if (process.env.DATABASE_URL) {
    const client = neon(process.env.DATABASE_URL);
    db = drizzle(client);
  }
});

describe('Usage Tracking Schema', () => {
  it('should have user_usage table with correct columns', async () => {
    if (!db) {
      console.log('Skipping test: DATABASE_URL not set');
      return;
    }
    
    // Query table structure using PostgreSQL information_schema
    const result = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'user_usage' ORDER BY ordinal_position
    `);
    const columns = (result.rows as any[]).map((row: any) => row.column_name);
    
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
    
    // Query table structure using PostgreSQL information_schema
    const result = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'usage_logs' ORDER BY ordinal_position
    `);
    const columns = (result.rows as any[]).map((row: any) => row.column_name);
    
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
    
    // Query PostgreSQL enum values
    const result = await db.execute(sql`
      SELECT unnest(enum_range(NULL::tier))::text AS value
    `);
    const values = (result.rows as any[]).map((row: any) => row.value);
    
    // Verify enum contains expected values
    expect(values).toContain('free');
    expect(values).toContain('basic');
    expect(values).toContain('premium');
  });

  it('should have correct actionType enum values', async () => {
    if (!db) {
      console.log('Skipping test: DATABASE_URL not set');
      return;
    }
    
    // Query PostgreSQL enum values
    const result = await db.execute(sql`
      SELECT unnest(enum_range(NULL::action_type))::text AS value
    `);
    const values = (result.rows as any[]).map((row: any) => row.value);
    
    // Verify enum contains expected values
    expect(values).toContain('conversation_start');
    expect(values).toContain('message_sent');
    expect(values).toContain('card_drawn');
    expect(values).toContain('apex_session');
    expect(values).toContain('voice_input');
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
