import { describe, it, expect } from "vitest";
import { shouldUseOpenAI, invokeOpenAI } from "./openai";

describe("OpenAI Integration for All Active Guardians", () => {
  it("should route all 4 active guardians to OpenAI", () => {
    expect(shouldUseOpenAI("career")).toBe(true);
    expect(shouldUseOpenAI("anxiety")).toBe(true);
    expect(shouldUseOpenAI("relationships")).toBe(true);
    expect(shouldUseOpenAI("transformation")).toBe(true);
  });

  it("should NOT route inactive/future guardians to OpenAI", () => {
    expect(shouldUseOpenAI("leadership")).toBe(false);
    expect(shouldUseOpenAI("legacy")).toBe(false);
    expect(shouldUseOpenAI("family")).toBe(false);
    expect(shouldUseOpenAI("emotions")).toBe(false);
  });

  it("should successfully call OpenAI API with a simple message", async () => {
    const response = await invokeOpenAI({
      messages: [
        { role: "system", content: "You are a helpful assistant. Reply in one short sentence." },
        { role: "user", content: "Say hello." },
      ],
    });

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0].message.content).toBeDefined();
    expect(typeof response.choices[0].message.content).toBe("string");
    console.log("OpenAI response:", response.choices[0].message.content);
    console.log("Model used:", response.model);
  }, 30000);
});
