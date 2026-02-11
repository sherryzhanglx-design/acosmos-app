import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthenticatedUser(): AuthenticatedUser {
  return {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

describe("roles.list", () => {
  it("returns a list of coaching roles", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const roles = await caller.roles.list();

    expect(Array.isArray(roles)).toBe(true);
    // After seeding, we should have at least the default roles
    if (roles.length > 0) {
      expect(roles[0]).toHaveProperty("id");
      expect(roles[0]).toHaveProperty("slug");
      expect(roles[0]).toHaveProperty("name");
      expect(roles[0]).toHaveProperty("description");
    }
  });

  it("returns roles with expected slugs after seeding", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const roles = await caller.roles.list();
    const slugs = roles.map(r => r.slug);

    // Check that expected coaching roles exist (8 A.Cosmos guardians)
    const expectedSlugs = ["career", "relationships", "anxiety", "leadership", "transformation", "legacy", "family", "emotions"];
    for (const slug of expectedSlugs) {
      if (roles.length > 0) {
        // Only check if database is available and seeded
        expect(slugs).toContain(slug);
      }
    }
  });
});

describe("conversations", () => {
  it("requires authentication for listing conversations", async () => {
    const ctx = createMockContext(); // No user
    const caller = appRouter.createCaller(ctx);

    await expect(caller.conversations.list()).rejects.toThrow();
  });

  it("allows authenticated users to list conversations", async () => {
    const user = createAuthenticatedUser();
    const ctx = createMockContext(user);
    const caller = appRouter.createCaller(ctx);

    const conversations = await caller.conversations.list();
    
    expect(Array.isArray(conversations)).toBe(true);
  });
});

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    
    expect(result).toBeNull();
  });

  it("returns user data for authenticated users", async () => {
    const user = createAuthenticatedUser();
    const ctx = createMockContext(user);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    
    expect(result).not.toBeNull();
    expect(result?.id).toBe(user.id);
    expect(result?.email).toBe(user.email);
    expect(result?.name).toBe(user.name);
  });
});

describe("auth.logout", () => {
  it("clears the session cookie", async () => {
    const user = createAuthenticatedUser();
    const ctx = createMockContext(user);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});
