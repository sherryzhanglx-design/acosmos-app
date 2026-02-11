import { describe, it, expect } from "vitest";

describe("OpenAI API Key Validation", () => {
  it("should have OpenAIAPIKey4Manus set in environment", () => {
    const key = process.env.OpenAIAPIKey4Manus;
    expect(key).toBeDefined();
    expect(key).not.toBe("");
    expect(key!.startsWith("sk-")).toBe(true);
  });

  it("should be able to call OpenAI API with the key", async () => {
    const key = process.env.OpenAIAPIKey4Manus;
    if (!key) {
      throw new Error("OpenAIAPIKey4Manus not set");
    }

    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    // 200 means the key is valid and can list models
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
  }, 15000);
});
