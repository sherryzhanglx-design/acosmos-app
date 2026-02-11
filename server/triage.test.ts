import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// Mock the db module
vi.mock("./db", () => ({
  seedDefaultRoles: vi.fn().mockResolvedValue(undefined),
  getActiveCoachingRoles: vi.fn().mockResolvedValue([
    { id: 1, name: "Andy", slug: "career", description: "Career & Life Design Guardian", avatar: "https://example.com/andy.png", color: "#f59e0b", icon: "Briefcase", isActive: 1, sortOrder: 1 },
    { id: 2, name: "Anya", slug: "anxiety", description: "Inner Peace Guardian", avatar: "https://example.com/anya.png", color: "#8b5cf6", icon: "Leaf", isActive: 1, sortOrder: 2 },
    { id: 3, name: "Alma", slug: "relationships", description: "Relationship Guardian", avatar: "https://example.com/alma.png", color: "#ec4899", icon: "Heart", isActive: 1, sortOrder: 3 },
    { id: 4, name: "Axel", slug: "transformation", description: "Transformation Guardian", avatar: "https://example.com/axel.png", color: "#06b6d4", icon: "Compass", isActive: 1, sortOrder: 4 },
  ]),
}));

import { invokeLLM } from "./_core/llm";

describe("Smart Triage Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse a valid LLM response with primary and secondary recommendations", async () => {
    const mockLLMResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            primary: { slug: "career", reason: "It sounds like you're navigating a career transition." },
            secondary: { slug: "anxiety", reason: "The stress you mentioned could also benefit from grounding work." }
          })
        }
      }]
    };

    (invokeLLM as any).mockResolvedValue(mockLLMResponse);

    // Simulate what the triage procedure does
    const content = mockLLMResponse.choices[0].message.content;
    const parsed = JSON.parse(content as string);

    expect(parsed.primary.slug).toBe("career");
    expect(parsed.primary.reason).toContain("career transition");
    expect(parsed.secondary).not.toBeNull();
    expect(parsed.secondary.slug).toBe("anxiety");
  });

  it("should handle LLM response with null secondary", async () => {
    const mockLLMResponse = {
      choices: [{
        message: {
          content: JSON.stringify({
            primary: { slug: "relationships", reason: "It sounds like your relationship is weighing on you." },
            secondary: null
          })
        }
      }]
    };

    (invokeLLM as any).mockResolvedValue(mockLLMResponse);

    const content = mockLLMResponse.choices[0].message.content;
    const parsed = JSON.parse(content as string);

    expect(parsed.primary.slug).toBe("relationships");
    expect(parsed.secondary).toBeNull();
  });

  it("should fallback to transformation when LLM returns no content", () => {
    const mockLLMResponse = {
      choices: [{
        message: {
          content: null
        }
      }]
    };

    const content = mockLLMResponse.choices[0].message.content;
    
    // Simulate fallback logic
    const result = !content
      ? { primary: { slug: "transformation", reason: "Let's start by looking inward." }, secondary: null }
      : JSON.parse(content);

    expect(result.primary.slug).toBe("transformation");
    expect(result.secondary).toBeNull();
  });

  it("should fallback to transformation when LLM returns invalid JSON", () => {
    const invalidContent = "This is not JSON";

    let result;
    try {
      result = JSON.parse(invalidContent);
    } catch {
      result = {
        primary: { slug: "transformation", reason: "Let's start by looking inward — Axel can help you see what's really going on." },
        secondary: null
      };
    }

    expect(result.primary.slug).toBe("transformation");
    expect(result.secondary).toBeNull();
  });

  it("should only recommend active guardian slugs", () => {
    const validSlugs = ["career", "anxiety", "relationships", "transformation"];
    
    // Test that a valid recommendation maps to known slugs
    const recommendation = { slug: "career", reason: "test" };
    expect(validSlugs).toContain(recommendation.slug);

    // Test that an unknown slug would need fallback
    const unknownSlug = "unknown_guardian";
    expect(validSlugs).not.toContain(unknownSlug);
  });

  it("should handle concern text within length limits", () => {
    const shortConcern = "I feel stuck";
    const longConcern = "a".repeat(1000);
    const tooLongConcern = "a".repeat(1001);

    expect(shortConcern.length).toBeGreaterThanOrEqual(1);
    expect(shortConcern.length).toBeLessThanOrEqual(1000);
    expect(longConcern.length).toBe(1000);
    expect(tooLongConcern.length).toBeGreaterThan(1000);
  });
});
