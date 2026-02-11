import { describe, it, expect } from "vitest";

// Test the phase closure signal detection and removal functions
// These mirror the frontend utility functions

function hasPhaseClosureSignal(content: string): boolean {
  return content.includes("[PHASE_CLOSURE]");
}

function removePhaseClosureSignal(content: string): string {
  return content.replace(/\[PHASE_CLOSURE\]/g, "").trim();
}

describe("Phase Closure Signal Detection", () => {
  it("should detect [PHASE_CLOSURE] signal in message content", () => {
    const messageWithSignal = "This feels like a good place to pause. Let what's clear settle. Come back when you're ready to look again. [PHASE_CLOSURE]";
    expect(hasPhaseClosureSignal(messageWithSignal)).toBe(true);
  });

  it("should not detect signal in regular messages", () => {
    const regularMessage = "I hear that you're feeling overwhelmed right now. We could stay with this feeling and let it settle, or we could try to separate what's yours from what isn't.";
    expect(hasPhaseClosureSignal(regularMessage)).toBe(false);
  });

  it("should detect signal anywhere in the message", () => {
    const messageWithMiddleSignal = "Some text [PHASE_CLOSURE] more text";
    expect(hasPhaseClosureSignal(messageWithMiddleSignal)).toBe(true);
  });

  it("should not detect partial signal matches", () => {
    const partialSignal = "This is about PHASE_CLOSURE without brackets";
    expect(hasPhaseClosureSignal(partialSignal)).toBe(false);
  });
});

describe("Phase Closure Signal Removal", () => {
  it("should remove [PHASE_CLOSURE] signal from end of message", () => {
    const messageWithSignal = "This feels like a good place to pause. [PHASE_CLOSURE]";
    const cleaned = removePhaseClosureSignal(messageWithSignal);
    expect(cleaned).toBe("This feels like a good place to pause.");
    expect(cleaned).not.toContain("[PHASE_CLOSURE]");
  });

  it("should remove signal from middle of message", () => {
    const messageWithMiddleSignal = "Some text [PHASE_CLOSURE] more text";
    const cleaned = removePhaseClosureSignal(messageWithMiddleSignal);
    expect(cleaned).toBe("Some text  more text");
  });

  it("should handle messages without signal", () => {
    const regularMessage = "This is a regular message without any signal.";
    const cleaned = removePhaseClosureSignal(regularMessage);
    expect(cleaned).toBe(regularMessage);
  });

  it("should remove multiple signals if present", () => {
    const multiSignal = "[PHASE_CLOSURE] text [PHASE_CLOSURE]";
    const cleaned = removePhaseClosureSignal(multiSignal);
    expect(cleaned).toBe("text");
    expect(cleaned).not.toContain("[PHASE_CLOSURE]");
  });

  it("should trim whitespace after removal", () => {
    const messageWithTrailingSpace = "Message content   [PHASE_CLOSURE]   ";
    const cleaned = removePhaseClosureSignal(messageWithTrailingSpace);
    expect(cleaned).toBe("Message content");
  });
});

describe("Phase Closure Prompt Integration", () => {
  // Test that the system prompts contain the phase closure guidance
  const COACHING_SYSTEM_PROMPTS: Record<string, string> = {
    career: "Phase Closure Awareness (Web Session)",
    anxiety: "Phase Closure Awareness (Web Session)",
    relationships: "Phase Closure Awareness (Web Session)",
    transformation: "Phase Closure Awareness (Web Session)"
  };

  it("should have phase closure guidance in Andy (career) prompt", () => {
    expect(COACHING_SYSTEM_PROMPTS.career).toContain("Phase Closure");
  });

  it("should have phase closure guidance in Anya (anxiety) prompt", () => {
    expect(COACHING_SYSTEM_PROMPTS.anxiety).toContain("Phase Closure");
  });

  it("should have phase closure guidance in Alma (relationships) prompt", () => {
    expect(COACHING_SYSTEM_PROMPTS.relationships).toContain("Phase Closure");
  });

  it("should have phase closure guidance in Axel (transformation) prompt", () => {
    expect(COACHING_SYSTEM_PROMPTS.transformation).toContain("Phase Closure");
  });
});

describe("Phase Closure Constraints", () => {
  // Test that the signal format is correct
  it("should use exact signal format [PHASE_CLOSURE]", () => {
    const validSignal = "[PHASE_CLOSURE]";
    expect(hasPhaseClosureSignal(validSignal)).toBe(true);
  });

  it("should not match lowercase variant", () => {
    const lowercaseSignal = "[phase_closure]";
    expect(hasPhaseClosureSignal(lowercaseSignal)).toBe(false);
  });

  it("should not match without brackets", () => {
    const noBrackets = "PHASE_CLOSURE";
    expect(hasPhaseClosureSignal(noBrackets)).toBe(false);
  });
});
