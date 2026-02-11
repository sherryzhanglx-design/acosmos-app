/**
 * OpenAI GPT-5.2 integration for specific guardians.
 * Uses the user's own OpenAI API key (OpenAIAPIKey4Manus).
 * Configured for all 4 active guardians (Andy, Anya, Alma, Axel).
 */

import type { Message, InvokeResult } from "./_core/llm";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-5.2"; // Upgraded to GPT-5.2 — OpenAI's flagship model as of Feb 2026

// Guardians that should use OpenAI instead of built-in LLM
const OPENAI_GUARDIAN_SLUGS = new Set(["career", "anxiety", "relationships", "transformation"]);

/**
 * Check if a guardian slug should use OpenAI GPT
 */
export function shouldUseOpenAI(slug: string): boolean {
  return OPENAI_GUARDIAN_SLUGS.has(slug) && !!getOpenAIKey();
}

/**
 * Get the OpenAI API key from environment
 */
function getOpenAIKey(): string | undefined {
  return process.env.OpenAIAPIKey4Manus;
}

/**
 * Normalize messages for OpenAI API format
 */
function normalizeMessages(messages: Message[]): Array<{ role: string; content: string }> {
  return messages.map(m => ({
    role: m.role,
    content: typeof m.content === "string" 
      ? m.content 
      : Array.isArray(m.content) 
        ? m.content.map(part => typeof part === "string" ? part : ("text" in part ? part.text : "")).join("\n")
        : String(m.content),
  }));
}

/**
 * Invoke OpenAI GPT for guardian conversations.
 * Returns the same InvokeResult shape as the built-in invokeLLM for compatibility.
 */
export async function invokeOpenAI(params: { messages: Message[] }): Promise<InvokeResult> {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    throw new Error("OpenAI API key (OpenAIAPIKey4Manus) is not configured");
  }

  const payload = {
    model: OPENAI_MODEL,
    messages: normalizeMessages(params.messages),
    max_completion_tokens: 4096,
  };

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}
